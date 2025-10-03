import React, { useState } from "react";
import axios from "axios";
import { backendUrl } from "./constants";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

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
      const response = await axios.post(`${backendUrl}/${role}/login`, {
        email,
        password,
      },{withCredentials: true});

      if (response.status >= 200 && response.status < 300) 
      {
        if(role==="user")
        {
          if(response.data.data?.requiresVerification)
          {
            navigate('/verifyOTP', { state: { email: email } }  );
          }
          else
          {
              navigate("/dashboard");
          }
        }
        else{
          alert("Doctor logged in");
        }


      } 
      else {
        setError(response.data.message || "Login failed");
      }

    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`${styles.container} ${
        isSignUpActive ? styles.rightPanelActive : ""
      }`}
    >
      <div className={`${styles.formContainer} ${styles.signInContainer}`}>
        <form className={styles.authForm} onSubmit={HandleSignIn}>
          <h1>Sign In</h1>
          <input
            className={styles.authInput}
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className={styles.authInput}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <select
            className={styles.authInput}
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="user">User</option>
            <option value="doctor">Doctor</option>
          </select>

          {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
          <button
            className={styles.authButton}
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
