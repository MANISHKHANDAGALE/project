import os
import pandas as pd
import joblib
import numpy as np
import json
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from xgboost import XGBRegressor

# **Ensure directories exist**
model_dir = "models"
static_dir = "static"
os.makedirs(model_dir, exist_ok=True)
os.makedirs(static_dir, exist_ok=True)

# **Load dataset**
file_path = "soc.csv"
if not os.path.exists(file_path):
    raise FileNotFoundError(f"Dataset file '{file_path}' not found!")

df = pd.read_csv(file_path)

# **Preprocessing**
df.columns = df.columns.str.strip()
df = df.dropna()

# **Define features & target**
features = ["TPI", "TRI", "TWI", "VDepth", "VIS", "NDVI_max", "NDVI_median", "NDVI_sd"]
target = "SOC (%)"

if target not in df.columns:
    raise ValueError(f"Target column '{target}' not found in CSV. Available columns: {list(df.columns)}")

X = df[features]
y = df[target]

# **Log transformation for stability**
y_log = np.log1p(y)

# **Train-Test Split**
X_train, X_test, y_train_log, y_test_log = train_test_split(X, y_log, test_size=0.2, random_state=42)

# **Create non-log-transformed y_train for Linear Regression**
y_train = np.expm1(y_train_log)  # Converts log-transformed values back to original scale

# **Scaling - Use StandardScaler**
scaler_standard = StandardScaler()
X_train_scaled = scaler_standard.fit_transform(X_train)
X_test_scaled = scaler_standard.transform(X_test)

# **Save scaler**
joblib.dump(scaler_standard, os.path.join(model_dir, "scaler.pkl"))

# **Hyperparameter tuning for Gradient Boosting**
gb_params = {
    "n_estimators": [100, 200, 300],
    "learning_rate": [0.01, 0.05, 0.1],
    "max_depth": [3, 5, 7]
}

gb_grid = GridSearchCV(GradientBoostingRegressor(random_state=42), gb_params, cv=5, scoring="r2", n_jobs=-1)
gb_grid.fit(X_train_scaled, y_train_log)  # Use log-transformed target for tuning

best_gb = gb_grid.best_estimator_
print(f"✅ Best Gradient Boosting Params: {gb_grid.best_params_}")

# **Train models**
models = {
    "LinearRegression": LinearRegression(),
    "RandomForest": RandomForestRegressor(n_estimators=200, random_state=42, max_depth=12),
    "GradientBoosting": best_gb,
    "XGBoost": XGBRegressor(n_estimators=200, learning_rate=0.05, max_depth=6, random_state=42)
}

performance = {}

for name, model in models.items():
    # **Linear Regression should use original target (not log-transformed)**
    if name == "LinearRegression":
        model.fit(X_train_scaled, y_train)  # Use `y_train` (non-log)
    else:
        model.fit(X_train_scaled, y_train_log)  # Use `y_train_log` (log-transformed)

    # **Save trained model**
    joblib.dump(model, os.path.join(model_dir, f"{name}.pkl"))

    # **Make Predictions**
    y_pred = model.predict(X_test_scaled)

    # **Reverse log transformation (except Linear Regression)**
    if name != "LinearRegression":
        y_pred = np.expm1(y_pred)

    # **Ensure SOC % is between 0-100**
    y_pred = np.clip(y_pred, 0, 100)

    # **Compute Performance Metrics**
    mae = mean_absolute_error(np.expm1(y_test_log), y_pred)
    mse = mean_squared_error(np.expm1(y_test_log), y_pred)
    rmse = np.sqrt(mse)
    r2 = r2_score(np.expm1(y_test_log), y_pred)

    performance[name] = {"MAE": round(mae, 3), "RMSE": round(rmse, 3), "R² Score": round(r2, 3)}

# **Save Performance Metrics**
with open(os.path.join(model_dir, "performance.json"), "w") as f:
    json.dump(performance, f, indent=4)

print("✅ Models trained and saved successfully!")

# **Generate Feature Importance Plot**
feature_importance_path = os.path.join(static_dir, "feature_importance.png")

if hasattr(best_gb, "feature_importances_"):
    feature_importance = best_gb.feature_importances_
    feat_imp_df = pd.DataFrame({"Feature": features, "Importance": feature_importance}).sort_values(by="Importance", ascending=False)

    plt.figure(figsize=(10, 6))
    sns.barplot(x="Importance", y="Feature", data=feat_imp_df, palette="viridis")
    plt.title("Feature Importance (Gradient Boosting)")
    plt.xlabel("Importance Score")
    plt.ylabel("Feature")
    plt.savefig(feature_importance_path)
    plt.close()

    print(f"✅ Feature importance plot saved at '{feature_importance_path}'")
