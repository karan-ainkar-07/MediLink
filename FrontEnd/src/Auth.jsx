import React, { useState } from "react";
import styles from "./mystyles.module.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AuthUI({ isSignUpActive, onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post("/user/login", { email, password }, { withCredentials: true });
      const { accessToken, refreshToken, User } = response.data.data;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("user", JSON.stringify(User));
      setLoading(false);
      navigate("/");
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className={`${styles.container} ${isSignUpActive ? styles.rightPanelActive : ""}`}>
      <div className={`${styles.formContainer} ${styles.signInContainer}`}>
        <form className={styles.authForm} onSubmit={handleSignIn}>
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
          <button className={styles.authButton} type="submit" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
