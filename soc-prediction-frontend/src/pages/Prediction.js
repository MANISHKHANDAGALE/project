import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Prediction.css";
import { FaMountain, FaWater, FaRulerVertical, FaEye, FaLeaf, FaChartBar, FaRandom } from "react-icons/fa"; // Modern icons
import { AiOutlineLoading3Quarters } from "react-icons/ai"; // Loader icon

const Prediction = () => {
  const navigate = useNavigate();
  const [inputData, setInputData] = useState({
    TPI: "",
    TRI: "",
    TWI: "",
    VDepth: "",
    VIS: "",
    NDVI_max: "",
    NDVI_median: "",
    NDVI_sd: "",
  });

  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputData({ ...inputData, [name]: value ? parseFloat(value) : "" });
  };

  const fillRandomValues = () => {
    const randomData = {
      TPI: (Math.random() * 20 - 10).toFixed(2),
      TRI: (Math.random() * 15 - 5).toFixed(2),
      TWI: (Math.random() * 30).toFixed(2),
      VDepth: (Math.random() * 50 + 10).toFixed(2),
      VIS: (Math.random() * 1).toFixed(3),
      NDVI_max: (Math.random() * 1).toFixed(3),
      NDVI_median: (Math.random() * 1).toFixed(3),
      NDVI_sd: (Math.random() * 0.5).toFixed(3),
    };
    setInputData(randomData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Object.values(inputData).some((val) => val === "")) {
      alert("⚠️ Please fill in all fields before submitting.");
      return;
    }

    setLoading(true);

    // Simulate step-by-step loading
    setLoadingStep("📡 Collecting Data...");
    setTimeout(() => {
      setLoadingStep("🖥️ Processing Data...");
      setTimeout(() => {
        setLoadingStep("📊 Predicting...");
        setTimeout(async () => {
          try {
            const response = await axios.post("http://127.0.0.1:8000/predict/", inputData);
            if (response.data && response.data.predictions) {
              navigate("/results", { state: { predictions: response.data.predictions } });
            } else {
              alert("Error: Unexpected response from the server.");
            }
          } catch (error) {
            alert("Failed to get a prediction. Please check the server and try again.");
          }
          setLoading(false);
        }, 2000);
      }, 1500);
    }, 1500);
  };

  return (
    <div className="prediction">
      <h2>🌱 Soil Organic Carbon Prediction</h2>
      {loading ? (
        <div className="loading-box">
          <AiOutlineLoading3Quarters className="loading-icon" />
          <p>{loadingStep}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {[
            { name: "TPI", icon: <FaMountain />, label: "Topographic Position Index" },
            { name: "TRI", icon: <FaMountain />, label: "Terrain Ruggedness Index" },
            { name: "TWI", icon: <FaWater />, label: "Topographic Wetness Index" },
            { name: "VDepth", icon: <FaRulerVertical />, label: "Vertical Depth" },
            { name: "VIS", icon: <FaEye />, label: "Visible Light Reflectance" },
            { name: "NDVI_max", icon: <FaLeaf />, label: "Max NDVI" },
            { name: "NDVI_median", icon: <FaChartBar />, label: "Median NDVI" },
            { name: "NDVI_sd", icon: <FaChartBar />, label: "NDVI Standard Deviation" },
          ].map(({ name, icon, label }) => (
            <div key={name} className="input-box">
              <label>{icon} {label}</label>
              <input type="number" name={name} value={inputData[name]} onChange={handleChange} step="any" required />
            </div>
          ))}

          <button type="button" onClick={fillRandomValues} className="random-btn">
            <FaRandom /> Fill Random Values
          </button>
          <button type="submit">📈 Predict</button>
        </form>
      )}
    </div>
  );
};

export default Prediction;
