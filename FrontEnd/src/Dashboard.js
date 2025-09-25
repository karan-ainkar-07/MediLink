import React from "react";
import "./Dashboard.css";
import { FaUserCircle } from "react-icons/fa"; // profile icon
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  return (
    <div className="container">
      {/* Navbar */}
      <nav className="navbar">
        <button className="profile-btn">
          <FaUserCircle className="profile-icon" />
          Profile
        </button>

        <ul className="nav-links">
          <li><a href="#home">Home</a></li>
          <li><a href="#about">About Us</a></li>
          <li><a href="#about">Contact</a></li>
        </ul>

        <img src="/images/logo/logo.png" alt="logo" className="nav-logo" />
      </nav>

      {/* Hero Section */}
      <section
        id="home"
        className="hero"
        style={{
          backgroundImage: `url("/images/clinic.jpg")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="overlay"></div>
        <div className="hero-content">
          <div className="hero-text">
            <h1>Book Appointment With Trusted Doctors</h1>
            <p>
              Access a network of trusted doctors and specialists. Book appointments quickly and easily.
            </p>
            <button className="btn-primary" onClick={() => navigate("/appointment")}>Book Appointment</button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <button className="btn-blue">Booked Appointments</button>
        <button className="btn-yellow" onClick={() => navigate("/symptom")}>Symptom Checker</button>
      </section>

      {/* Doctors Section */}
      <section className="doctors">
        <h2>Top Doctors to Book</h2>
        <div className="doctor-list">
          {[1, 2, 3, 4].map((id) => (
            <div key={id} className="doctor-card">
              <img src="/images/doctors/doctor-card1.png" alt={`Doctor ${id}`} />
              <h3>Dr. Richard Jones</h3>
              <p>Specialist</p>
            </div>
          ))}
        </div>
      </section>

      {/* Ask Curo Section */}
      <section className="ask-curo">
        <div className="ask-content">
          <h2>Ask anything about your health.</h2>
          <p>Get trusted answers directly from our doctors.</p>
          <button className="btn-primary">Ask Curo</button>
        </div>
        <img src="/images/ask-curo/ask-doctor.png" alt="Doctor" />
      </section>

      {/* Footer */}
      <footer id="about" className="footer">
        <div className="footer-sections">
          <div>
            <p>
              We are a trusted clinic committed to delivering reliable healthcare consultations online.
            </p>
            <p>Our goal is to make your appointments simple, fast, and stress-free.</p>
          </div>
          <div>
            <h4>Company</h4>
            <ul>
              <li><a href="#home">Home</a></li>
              <li><a href="#about">About Us</a></li>
              <li><a href="#about">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4>Get In Touch</h4>
            <p>+123-456-7890</p>
            <p>medicuro@email.com</p>
          </div>
        </div>
        <p className="footer-copy">© 2025 MediCuro. All Rights Reserved.</p>
        <img src="/images/logo/logo.png" alt="logo" />
      </footer>
    </div>
  );
}
