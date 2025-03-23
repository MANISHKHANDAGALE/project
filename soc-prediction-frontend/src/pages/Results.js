import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Results.css";

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const predictions = location.state?.predictions;

  return (
    <div className="results-container">
      <div className="results-box">
        <h2>Prediction Results</h2>
        {predictions ? (
          <>
            <p>Linear Regression: {predictions.LinearRegression ? `${predictions.LinearRegression}%` : "N/A"}</p>
            <p>Random Forest: {predictions.RandomForest ? `${predictions.RandomForest}%` : "N/A"}</p>
            <p>Gradient Boosting: {predictions.GradientBoosting ? `${predictions.GradientBoosting}%` : "N/A"}</p>
          </>
        ) : (
          <p className="error-message">⚠️ Error: No data received</p>
        )}
        <button className="back-btn" onClick={() => navigate("/predict")}>🔄 Try Again</button>
      </div>
    </div>
  );
};

export default Results;
