import os
import joblib
import pandas as pd
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict

# **Initialize FastAPI app**
app = FastAPI(
    title="SOC Prediction API",
    description="Predict SOC % using trained ML models",
    version="1.2"
)

# **Enable CORS**
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all domains (change this in production)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# **Load trained models & scaler**
model_dir = "models"
models = {}
scaler = None

# **Check for required files**
required_files = [
    "LinearRegression.pkl",
    "RandomForest.pkl",
    "GradientBoosting.pkl",
    "XGBoost.pkl",
    "scaler.pkl"
]

missing_files = [file for file in required_files if not os.path.exists(os.path.join(model_dir, file))]

if missing_files:
    raise RuntimeError(f"❌ Missing required files: {missing_files}")

try:
    models["LinearRegression"] = joblib.load(os.path.join(model_dir, "LinearRegression.pkl"))
    models["RandomForest"] = joblib.load(os.path.join(model_dir, "RandomForest.pkl"))
    models["GradientBoosting"] = joblib.load(os.path.join(model_dir, "GradientBoosting.pkl"))
    models["XGBoost"] = joblib.load(os.path.join(model_dir, "XGBoost.pkl"))

    scaler = joblib.load(os.path.join(model_dir, "scaler.pkl"))

    print("✅ Models and scaler loaded successfully!")

except Exception as e:
    raise RuntimeError(f"❌ Error loading models: {str(e)}")

# **Define request model**
class PredictionRequest(BaseModel):
    TPI: float
    TRI: float
    TWI: float
    VDepth: float
    VIS: float
    NDVI_max: float
    NDVI_median: float
    NDVI_sd: float

# **Prediction Endpoint**
@app.post("/predict/")
def predict(data: PredictionRequest) -> Dict:
    try:
        if not models or scaler is None:
            raise HTTPException(status_code=500, detail="Models or scaler not loaded!")

        # **Prepare input data**
        input_data = pd.DataFrame([data.dict()])
        input_scaled = scaler.transform(input_data)

        predictions = {}

        for model_name, model in models.items():
            pred = model.predict(input_scaled)[0]

            # **Reverse log transformation (except Linear Regression)**
            if model_name != "LinearRegression":
                pred = np.expm1(pred)

            # **Ensure SOC % is within 0-100 range**
            pred = np.clip(pred, 0, 100)

            predictions[model_name] = round(float(pred), 2)

        return {
            "predictions": predictions,
            "message": "SOC % predicted successfully"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

# **Health Check Endpoint**
@app.get("/health/")
def health_check():
    return {"status": "ok", "message": "API is running, models are loaded"}

# **Home Endpoint**
@app.get("/")
def home():
    return {"message": "Welcome to the SOC Prediction API. Use /predict/ to get predictions."}
