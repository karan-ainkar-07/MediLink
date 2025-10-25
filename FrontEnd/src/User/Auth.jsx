import React, { useState } from "react";
import axios from "axios";
import { backendUrl } from "../constants"; // ✅ Make sure this file exists or update the path
import { useNavigate } from "react-router-dom";
import "./Auth.css";

export default function AuthUI() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // 🟢 Handle Login
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
            navigate("/verifyOTP", { state: { email: email } });
          } else {
            navigate("/dashboard");
          }
        } else {
          alert("Doctor logged in successfully!");
          navigate("/doctorDashBoard");
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

  // 🟣 Navigate to Sign Up page
  const handleNavigateToSignUp = () => {
    navigate("/signUp");
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <form onSubmit={HandleSignIn}>
          <h1>Sign In</h1>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="user">User</option>
            <option value="doctor">Doctor</option>
          </select>

          {error && <p>{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        {/* 🟡 Sign Up Section */}
        <p className="auth-signup-text">
          Don’t have an account?{" "}
          <button type="button" onClick={handleNavigateToSignUp}>
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
}
