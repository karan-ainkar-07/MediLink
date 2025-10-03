import React, { useState } from "react";
import axios from "axios";
import { backendUrl } from "./constants";
import { useNavigate } from "react-router-dom";

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const navigate=useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try{
      const response=await axios.post(`${backendUrl}/user/SignUp`,{formData},{ withCredentials: true });
      if(response.data?.data?.requiresVerification)
      {
        navigate("/verifyOTP", { state: { email: formData.email } });
      }
    }
    catch(err){
      console.error(err);
    }

  };

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      background: "#f5f5f5"
    }}>
      <div style={{
        background: "#fff",
        padding: "40px",
        borderRadius: "10px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
        width: "350px",
        textAlign: "center"
      }}>
        <h2>Sign Up</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            required
            style={inputStyle}
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            style={inputStyle}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            style={inputStyle}
          />
          <button type="submit" style={buttonStyle}>Sign Up</button>
        </form>
      </div>
    </div>
  );
};

// Inline styles
const inputStyle = {
  width: "100%",
  padding: "10px",
  margin: "10px 0",
  borderRadius: "5px",
  border: "1px solid #ccc",
  fontSize: "14px"
};

const buttonStyle = {
  width: "100%",
  padding: "10px",
  marginTop: "15px",
  border: "none",
  borderRadius: "5px",
  backgroundColor: "#4CAF50",
  color: "#fff",
  fontSize: "16px",
  cursor: "pointer"
};

export default SignUp;
