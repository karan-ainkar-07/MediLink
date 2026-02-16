import React, { useState } from "react";
import axios from "axios";
import { backendUrl } from "../constants";
import { useNavigate } from "react-router-dom";
import "./Auth.css"

export default function AuthUI({ isSignUpActive, onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const HandleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await axios.post(
        `${backendUrl}/${role}/login`,
        { email, password },
        { withCredentials: true }
      );

      if (response.status >= 200 && response.status < 300) {
        if (role === "user") {
          if (response.data.data?.requiresVerification) {
            navigate("/verifyOTP", { state: { email } });
          } else {
            navigate("/dashboard");
          }
        } else {
          alert("Doctor logged in");
          navigate("/doctorDashboard");
        }
      } else {
        setError(response.data.message || "Login failed");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={HandleSignIn}>
        <h1 className="auth-title">Sign In</h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          className="auth-input"
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          className="auth-input"
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="auth-select"
        >
          <option value="user">Patient</option>
          <option value="doctor">Doctor</option>
        </select>

        {error && <p className="auth-error">{error}</p>}

        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? "Signing In..." : "Sign In"}
        </button>

        <p className="signup-text">
          Don’t have an account?{" "}
          <span
            className={`signup-link ${role === "doctor" ? "disabled" : ""}`}
            onClick={() => {
              if (role !== "doctor") navigate("/signup");
            }}
          >
            Sign Up
          </span>
        </p>
      </form>
    </div>
  );
}
