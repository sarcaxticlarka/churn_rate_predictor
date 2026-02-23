from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from ml_model import train_and_save_models, predict_churn, get_data_insights, MODEL_PATH, METRICS_PATH
import os
import json

app = FastAPI(title="E-Commerce Churn Prediction API")

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for deployed Vercel frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PredictRequest(BaseModel):
    Age: float
    Age_Group: str
    Gender: str
    Country: str
    Membership_Years: float
    Login_Frequency: int
    Session_Duration_Avg: float
    Pages_Per_Session: float
    Cart_Abandonment_Rate: float
    Wishlist_Items: int
    Total_Purchases: float
    Average_Order_Value: float
    Days_Since_Last_Purchase: int
    Discount_Usage_Rate: float
    Returns_Rate: float
    Email_Open_Rate: float
    Customer_Service_Calls: int
    Product_Reviews_Written: int
    Social_Media_Engagement_Score: float
    Payment_Method_Diversity: int
    Lifetime_Value: float
    Credit_Balance: int
    Signup_Quarter: str

    model_config = {
        "json_schema_extra": {
            "example": {
                "Age": 33.0,
                "Age_Group": "25-34",
                "Gender": "Female",
                "Country": "Germany",
                "Membership_Years": 2.5,
                "Login_Frequency": 10,
                "Session_Duration_Avg": 15.5,
                "Pages_Per_Session": 5.0,
                "Cart_Abandonment_Rate": 45.0,
                "Wishlist_Items": 3,
                "Total_Purchases": 12.0,
                "Average_Order_Value": 105.5,
                "Days_Since_Last_Purchase": 14,
                "Discount_Usage_Rate": 25.0,
                "Returns_Rate": 5.0,
                "Email_Open_Rate": 20.0,
                "Customer_Service_Calls": 2,
                "Product_Reviews_Written": 1,
                "Social_Media_Engagement_Score": 30.0,
                "Payment_Method_Diversity": 2,
                "Lifetime_Value": 1200.0,
                "Credit_Balance": 500,
                "Signup_Quarter": "Q2"
            }
        }
    }

@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "API is running"}

@app.post("/api/train")
def train_model():
    try:
        results = train_and_save_models()
        return {"status": "success", "results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/predict")
def predict(request: PredictRequest):
    try:
        if not os.path.exists(MODEL_PATH):
            raise HTTPException(status_code=400, detail="Model not trained yet. Call /api/train first.")
        
        input_data = request.model_dump()
        result = predict_churn(input_data)
        return {"status": "success", "prediction": result["prediction"], "probability": result["probability"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/dataset-info")
def data_insights():
    try:
        insights = get_data_insights()
        
        # Merge ML data if metrics.json is available
        if os.path.exists(METRICS_PATH):
            with open(METRICS_PATH, "r") as f:
                metrics_data = json.load(f)
                
            best_model = metrics_data.get("best_model")
            insights["ml_data"] = {
                "accuracy": metrics_data["metrics"][best_model]["Accuracy"],
                "f1_score": metrics_data["metrics"][best_model]["F1_Score"],
                "dataset_volume": len(insights["charts"]["age_distribution"]) # Simple proxy 
            }
            
        return {"status": "success", "data": insights}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/model-stats")
def get_metrics():
    try:
        if not os.path.exists(METRICS_PATH):
            results = train_and_save_models()
        else:
            with open(METRICS_PATH, "r") as f:
                results = json.load(f)
        return {"status": "success", "results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
