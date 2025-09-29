import React, { useState } from "react";
import styles from "./mystyles.module.css";
import axios from "axios";
import { backendUrl } from "./constants";
import { useNavigate } from "react-router-dom";

export default function AuthUI({ isSignUpActive, onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const HandleSignIn = async (e) => {
    e.preventDefault(); 
    setLoading(true);
    setError("");
    try {
      const response = await axios.post(`${backendUrl}/user/login`, {
        email,
        password,
      });

      if (response.status >= 200 && response.status < 300) 
      {
        if(!response.requiresVerification)
        {
          navigate('/verifyOTP', { state: { email: email } });
        }
        else
        {
            navigate("/dashboard");
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
