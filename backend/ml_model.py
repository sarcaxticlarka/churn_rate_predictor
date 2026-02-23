import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score, r2_score, 
    mean_absolute_error, mean_squared_error, confusion_matrix, roc_curve, auc
)
import joblib
import json
import os

DATA_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'DVA_Capstone-G3_Section_C.xlsx')
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'best_model.joblib')
METRICS_PATH = os.path.join(os.path.dirname(__file__), 'metrics.json')

def load_data():
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(f"Data file not found at {DATA_PATH}")
    df = pd.read_excel(DATA_PATH, sheet_name='Cleaned_Data')
    return df

def get_data_insights():
    df = load_data()
    # Basic stats
    total_customers = len(df)
    churn_rate = df['Churned'].mean()
    avg_order_value = df['Average_Order_Value'].mean()
    total_revenue = df['Total_Purchases'].sum() * avg_order_value # Rough estimate

    # Distributions for frontend charts
    churn_by_country = df.groupby('Country')['Churned'].mean().to_dict()
    churn_by_gender = df.groupby('Gender')['Churned'].mean().to_dict()
    
    age_distribution = df['Age_Group'].value_counts().to_dict()
    
    return {
        "kpis": {
            "total_customers": total_customers,
            "churn_rate": float(churn_rate),
            "avg_order_value": float(avg_order_value),
            "total_revenue": float(total_revenue)
        },
        "charts": {
            "churn_by_country": churn_by_country,
            "churn_by_gender": churn_by_gender,
            "age_distribution": age_distribution
        }
    }

def train_and_save_models():
    df = load_data()
    
    # Drop irrelevant columns for modeling
    drop_cols = ['City', 'Social_Score_missing']
    df = df.drop(columns=[col for col in drop_cols if col in df.columns])
    
    # Separate features and target
    X = df.drop(columns=['Churned'])
    y = df['Churned']
    
    # Identify column types
    categorical_cols = X.select_dtypes(include=['object', 'category']).columns.tolist()
    numeric_cols = X.select_dtypes(include=['int64', 'float64']).columns.tolist()
    
    # Preprocessing pipeline
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numeric_cols),
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), categorical_cols)
        ])
    
    # Features after transformation will need names for feature importance
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    # Define models
    models = {
        "Logistic Regression": LogisticRegression(max_iter=1000, random_state=42),
        "Decision Tree": DecisionTreeClassifier(random_state=42),
        "Random Forest": RandomForestClassifier(n_estimators=100, random_state=42)
    }
    
    metrics = {}
    best_model_name = None
    best_f1 = -1
    best_pipeline = None
    feature_importances = {}
    
    for name, model in models.items():
        pipeline = Pipeline(steps=[('preprocessor', preprocessor),
                                   ('classifier', model)])
        
        # Train
        pipeline.fit(X_train, y_train)
        
        # Predict
        y_pred = pipeline.predict(X_test)
        
        # Evaluate (Classification metrics)
        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred)
        rec = recall_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred)
        
        # Evaluate (Regression metrics as requested, though unconventional for classification)
        r2 = r2_score(y_test, y_pred)
        mae = mean_absolute_error(y_test, y_pred)
        mse = mean_squared_error(y_test, y_pred)
        
        # Calculate Confusion Matrix
        cm = confusion_matrix(y_test, y_pred)
        
        # Calculate ROC Curve and AUC (if probabilities are available)
        roc_data = None
        if hasattr(model, 'predict_proba'):
            y_probs = pipeline.predict_proba(X_test)[:, 1]
            fpr, tpr, thresholds = roc_curve(y_test, y_probs)
            roc_auc = auc(fpr, tpr)
            roc_data = {
                "fpr": fpr.tolist()[::max(1, len(fpr)//50)], # Downsample for frontend
                "tpr": tpr.tolist()[::max(1, len(tpr)//50)],
                "auc": float(roc_auc)
            }
        
        metrics[name] = {
            "Accuracy": float(acc),
            "Precision": float(prec),
            "Recall": float(rec),
            "F1_Score": float(f1),
            "R2_Score": float(r2),
            "MAE": float(mae),
            "MSE": float(mse),
            "ConfusionMatrix": cm.tolist(),
            "ROC": roc_data
        }
        
        # Determine best model based on F1 Score
        if f1 > best_f1:
            best_f1 = f1
            best_model_name = name
            best_pipeline = pipeline
            
            # Store probability distribution for best model
            if hasattr(model, 'predict_proba'):
                best_model_probs = pipeline.predict_proba(X_test)[:, 1].tolist()

            
            # Extract Feature Importance if available (Random Forest/Decision Tree)
            if hasattr(model, 'feature_importances_'):
                # Get feature names after one-hot encoding
                cat_encoder = preprocessor.named_transformers_['cat']
                cat_features = cat_encoder.get_feature_names_out(categorical_cols)
                all_features = numeric_cols + list(cat_features)
                
                importances = model.feature_importances_
                
                # Sort and keep top 15
                indices = np.argsort(importances)[::-1][:15]
                feature_importances = {all_features[i]: float(importances[i]) for i in indices}
            elif name == "Logistic Regression":
                # For Logistic Regression, we can use absolute coefficients as importance
                cat_encoder = preprocessor.named_transformers_['cat']
                cat_features = cat_encoder.get_feature_names_out(categorical_cols)
                all_features = numeric_cols + list(cat_features)
                
                importances = np.abs(model.coef_[0])
                indices = np.argsort(importances)[::-1][:15]
                feature_importances = {all_features[i]: float(importances[i]) for i in indices}
    
    # Save best model
    joblib.dump(best_pipeline, MODEL_PATH)
    
    # Save metrics to JSON for quick frontend retrieval
    final_results = {
        "metrics": metrics,
        "best_model": best_model_name,
        "feature_importances": feature_importances,
        "prob_distribution": best_model_probs if 'best_model_probs' in locals() else []
    }
    
    with open(METRICS_PATH, "w") as f:
        json.dump(final_results, f)
        
    return final_results

def predict_churn(input_data: dict):
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError("Model not trained yet. Please train the model first.")
    
    pipeline = joblib.load(MODEL_PATH)
    
    # Convert input dict to DataFrame
    df_input = pd.DataFrame([input_data])
    
    # Predict
    prediction = pipeline.predict(df_input)[0]
    
    # Predict probability if supported
    probability = None
    if hasattr(pipeline.named_steps['classifier'], 'predict_proba'):
        probability = pipeline.predict_proba(df_input)[0][1] # Probability of class 1 (churned)
        
    return {
        "prediction": int(prediction),
        "probability": float(probability) if probability is not None else None
    }

if __name__ == "__main__":
    print("Training models...")
    results = train_and_save_models()
    print(f"Best Model: {results['best_model']}")
    print("Metrics:", results['metrics'][results['best_model']])
    print("\nFeature Importances (Top 5):")
    for k, v in list(results['feature_importances'].items())[:5]:
        print(f"{k}: {v:.4f}")
