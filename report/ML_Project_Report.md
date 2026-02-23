# E-Commerce Churn Prediction: Machine Learning Project Report

## 1. Executive Summary
The goal of this project was to analyze an e-commerce platform's customer behavior and predict customer churn. By identifying customers at high risk of churning, the business can proactively intervene with retention strategies such as targeted discounts or personalized outreach. 

We developed a complete end-to-end Machine Learning web application structured around three core components:
1. **Data Preprocessing & ML Pipeline**: Built with Python and `scikit-learn` for training and evaluating multiple classification algorithms.
2. **RESTful API Backend**: Built with `FastAPI` (Python) to serve predictions and model metrics dynamically.
3. **MLOps Dashboard Frontend**: A premium Next.js interface providing real-time inference, model evaluation metrics, and demographic insights.

The final deployed model is a **Random Forest Classifier** which achieved an **Accuracy of 89.3%** and a **Global F1 Score of 79.4%**.

---

## 2. Dataset Overview
The dataset (`DVA_Capstone-G3_Section_C.xlsx` - Cleaned Data sheet) contains comprehensive behavioral, demographical, and transactional data for **9,998 customers**. 

* **Target Variable**: `Churned` (Binary: 0 = Retained, 1 = Churned). 
* **Class Imbalance**: The dataset represents roughly ~28.7% churned customers vs ~71.3% retained.
* **Feature Count**: 26 raw features. Two low-variance/irrelevant features (`City`, `Social_Score_missing`) were dropped, leaving 23 predictor features.

**Key Features Evaluated:**
* *Demographics*: Age, Gender, Country
* *Engagement metrics*: Login Frequency, Session Duration, Cart Abandonment Rate, Email Open Rate
* *Transactional metrics*: Total Purchases, Avg Order Value, Lifetime Value, Days Since Last Purchase
* *Service metrics*: Customer Service Calls, Returns Rate

---

## 3. Machine Learning Pipeline

### 3.1 Preprocessing Strategy
Due to the mix of categorical and continuous numerical variables, a robust `ColumnTransformer` pipeline was implemented:
* **Numerical Features**: Standardized using `StandardScaler` to ensure mean=0 and variance=1. This is critical for models sensitive to feature scaling (like Logistic Regression).
* **Categorical Features**: Encoded using `OneHotEncoder` to convert text categories (like Country and Gender) into numerical boolean arrays.

### 3.2 Models Evaluated
The dataset was split into an 80/20 Train-Test split. Three primary classification algorithms were trained and compared:

1. **Logistic Regression** (Baseline algorithm)
2. **Decision Tree Classifier**
3. **Random Forest Classifier** (Ensemble algorithm)

---

## 4. Model Evaluation & Results

The primary metric used to determine model success was the **F1 Score** because of the slight class imbalance (prioritizing the harmonic mean of precision and recall over outright accuracy).

| Model | Accuracy | Precision | Recall | F1 Score |
| :--- | :--- | :--- | :--- | :--- |
| **Logistic Regression** | 77.5% | 66.7% | 43.0% | 52.3% |
| **Decision Tree** | 83.2% | 71.0% | 70.2% | 70.6% |
| **Random Forest (Best)** | **89.3%** | **88.6%** | **71.9%**| **79.4%** |

### 4.1 Random Forest Deep-Dive
The **Random Forest** algorithm significantly outperformed the other models, correctly predicting churn with minimal false positives.

* **Confusion Matrix (Test Set)**:
  * True Negatives (Correctly predicted Retained): **1373**
  * True Positives (Correctly predicted Churned): **413**
  * False Positives (Incorrectly predicted Churned): **53**
  * False Negatives (Incorrectly predicted Retained): **161**

* **ROC Curve & AUC**:
  * The Receiver Operating Characteristic (ROC) curve plots True Positive Rate vs False Positive Rate.
  * The **Area Under Curve (AUC)** is **0.8997**, demonstrating excellent discriminatory ability.

### 4.2 Top Predictive Features
Using the Random Forest `feature_importances_` attribute, we identified the top drivers of customer churn:

1. **Lifetime Value** (13.1% Importance)
2. **Customer Service Calls** (11.0% Importance)
3. **Cart Abandonment Rate** (9.7% Importance)
4. **Days Since Last Purchase** (5.9% Importance)
5. **Discount Usage Rate** (5.7% Importance)

*Insight:* High customer service contact rates coupled with high cart abandonment are strong pre-indicators of churn. Lower lifetime values also indicate less sticky customers.

---

## 5. System Architecture & Deployment

### 5.1 Backend (FastAPI)
The backend loads the saved `joblib` Random Forest pipeline into memory. It exposes three core REST endpoints:
* `POST /api/predict`: Accepts a JSON payload of 23 customer features, transforms them through the pipeline, and returns a binary prediction alongside a strict probability percentage (e.g., "75% likely to churn").
* `GET /api/metrics`: Serves the pre-calculated Confusion Matrix and ROC coordinates for the MLOps dashboard.
* `GET /api/data-insights`: Dynamically computes demographic distributions directly from pandas dataframes for frontend EDA (Exploratory Data Analysis).

### 5.2 MLOps Dashboard (Next.js)
The frontend serves as the terminal for data scientists and business leaders to interact with the model:
* A polished dark-themed UI built with Tailwind CSS.
* Real-time form submissions passing state directly into the ML inference engine.
* Interactive `Recharts` visualizations plotting the mathematical evaluations (ROC Area graphs) and dataset EDA.

## 6. Conclusion
The resulting application successfully solves the core business requirement: predicting churn accurately and explaining why. The Random Forest model provides a highly reliable (89%+ accuracy) defensive tool, while the application infrastructure provides an immediate, user-friendly interface to test theories and monitor system performance.
