import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Prediction from "./pages/Prediction";
import About from "./pages/About";
import Results from "./pages/Results";
import Loader from "./components/Loader"; // Import Loader
import "./styles.css";

function App() {
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    // Simulate loading time (fetching data, API calls, etc.)
    setTimeout(() => {
      setLoading(false);
    }, 2000); // Show loader for 2 seconds
  }, []);

  return (
    <Router>
      {loading ? (
        <Loader /> // Show animated loader
      ) : (
        <>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/predict" element={<Prediction />} />
            <Route path="/about" element={<About />} />
            <Route path="/results" element={<Results />} />
          </Routes>
          <Footer />
        </>
      )}
    </Router>
  );
}

export default App;
