import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners"; // Import modern loader
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false); // Track loading state

  const handleClick = () => {
    setLoading(true); // Show loader
    setTimeout(() => {
      navigate("/predict"); // Navigate after 2 seconds
    }, 2000);
  };

  return (
    <div className="home">
      <div className="overlay">
        <h1>Welcome to SOC Prediction</h1>
        <p>Predict Soil Organic Carbon with AI-powered models.</p>
        
        {/* Loader or Button */}
        {loading ? (
          <ClipLoader color="#ffcc00" size={40} />
        ) : (
          <button onClick={handleClick}>Get Started</button>
        )}
      </div>
    </div>
  );
};

export default Home;
