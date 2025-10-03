import React from "react";
import "./Spinner.css";

function Spinner({ size = 20 }) {
  return (
    <div 
      className="spinner" 
      style={{ width: size, height: size }}
    ></div>
  );
}

export default Spinner;
