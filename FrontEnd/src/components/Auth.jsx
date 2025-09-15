import React from "react";
import styles from "../styles/mystyles.module.css";

export default function AuthUI({ isSignUpActive, onClose }) {
  return (
    <div
      className={`${styles.container} ${
        isSignUpActive ? styles.rightPanelActive : ""
      }`}
    >
      {/* Sign Up Form */}
      <div className={`${styles.formContainer} ${styles.signUpContainer}`}>
        <form className={styles.authForm}>
          <h1>Create Account</h1>
          <input
            className={styles.authInput}
            type="email"
            placeholder="Email"
          />
          <input
            className={styles.authInput}
            type="password"
            placeholder="Password"
          />
          <input
            className={styles.authInput}
            type="password"
            placeholder="Confirm Password"
          />
          <button className={styles.authButton}>Sign Up</button>
        </form>
      </div>

      {/* Sign In Form */}
      <div className={`${styles.formContainer} ${styles.signInContainer}`}>
        <form className={styles.authForm}>
          <h1>Sign In</h1>
          <input
            className={styles.authInput}
            type="email"
            placeholder="Email"
          />
          <input
            className={styles.authInput}
            type="password"
            placeholder="Password"
          />
          <button className={styles.authButton}>Sign In</button>
        </form>
      </div>

      {/* Overlay */}
      <div className={styles.overlayContainer}>
        <div className={styles.overlay}>
          <div className={`${styles.overlayPanel} ${styles.overlayLeft}`}>
            <h1>Welcome Back!</h1>
            <p>
              To keep connected with us please login with your personal info
            </p>
            <button
              className={`${styles.authButton} ${styles.ghost}`}
            >
              Sign In
            </button>
          </div>

          <div className={`${styles.overlayPanel} ${styles.overlayRight}`}>
            <h1>Hello, Friend!</h1>
            <p>
              Enter your personal details and start journey with us
            </p>
            <button
              className={`${styles.authButton} ${styles.ghost}`}
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>

      {/* Cancel Button */}
      <button className={styles.cancelButton} onClick={onClose}>
        ✖ 
      </button>
    </div>
  );
}
