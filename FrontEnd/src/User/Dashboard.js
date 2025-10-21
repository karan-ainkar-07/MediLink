import React, { useEffect, useState } from "react";
import "./Dashboard.css";
import { FaUserCircle, FaHeartbeat, FaHistory } from "react-icons/fa"; 
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { backendUrl } from "../constants";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("health");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const fetchedUser = await axios.get(`${backendUrl}/User/get-current-user`, {
          withCredentials: true,
        });
        setUser(fetchedUser.data?.data || null);
      } catch (err) {
        console.error(err);
        navigate("/");
      }
    };
    fetchUser();
  }, [navigate]);

  if (!user) return null;

  return (
    <div className="container">
      {/* Navbar */}
      <nav className="navbar">
        <button className="profile-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
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

      {/* Sidebar (slides from right) */}
      <div className={`sidebar-overlay ${sidebarOpen ? "open" : ""}`} onClick={() => setSidebarOpen(false)}></div>
      <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <FaUserCircle className="sidebar-avatar" />
          <h3>{user.name || "User"}</h3>
          <p>{user.email || "user@email.com"}</p>
        </div>

        <div className="sidebar-tabs">
          <button
            className={`tab-btn ${activeTab === "health" ? "active" : ""}`}
            onClick={() => setActiveTab("health")}
          >
            <FaHeartbeat /> Health Info
          </button>
          <button
            className={`tab-btn ${activeTab === "appointments" ? "active" : ""}`}
            onClick={() => setActiveTab("appointments")}
          >
            <FaHistory /> Past Appointments
          </button>
        </div>

        <div className="sidebar-content">
          {activeTab === "health" && (
            <div>
              <h4>Health Info</h4>
              <p><strong>Age:</strong> {user.age || "Not provided"}</p>
              <p><strong>Gender:</strong> {user.gender || "Not provided"}</p>
              <p><strong>Blood Group:</strong> {user.bloodGroup || "Not provided"}</p>
            </div>
          )}
          {activeTab === "appointments" && (
            <div>
              <button onClick={()=>{
                navigate('/PastAppointments')
              }}>Past Appointments</button>
            </div>
          )}
        </div>
      </div>

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
        <button className="btn-blue" onClick={() => navigate("/PastAppointments")}>Booked Appointments</button>
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
