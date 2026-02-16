import React, { useEffect, useState } from "react";
import "./Dashboard.css";
import { FaUserCircle, FaHistory, FaStar } from "react-icons/fa"; 
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { backendUrl } from "../constants";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [topDoctors, setTopDoctors] = useState([]);

  useEffect(() => {
    const getTopDoctors = async () => {
      try {
        const res = await axios.get(`${backendUrl}/userProfile/get-top-doctors`);
        setTopDoctors(res.data?.data || []);
        console.log(res)
      } catch (err) {
        console.error("Failed to fetch top doctors:", err);
      }
    };
    getTopDoctors();
  }, []);

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

  const fetchAppointments = async () => {
    try {
      const response = await axios.get(`${backendUrl}/userProfile/view-past-appointments`, {
        withCredentials: true,
      });
      setAppointments(response.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch past appointments:", err);
    }
  };

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

      {/* Sidebar */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? "open" : ""}`}
        onClick={() => setSidebarOpen(false)}
      ></div>

      <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <FaUserCircle className="sidebar-avatar" />
          <h3>{user.name || "User"}</h3>
          <p>{user.email || "user@email.com"}</p>
        </div>

        <div className="sidebar-tabs">
          <button className="tab-btn active" onClick={fetchAppointments}>
            <FaHistory /> Past Appointments
          </button>
        </div>

        <div className="sidebar-content">
          {appointments.length > 0 ? (
            <div className="appointments-list">
              {appointments.map((appt, index) => (
                <div key={index} className="appointment-item">
                  <p><strong>Doctor:</strong> {appt.doctor?.name || appt.doctorName || "Unknown"}</p>
                  <p><strong>Date:</strong> {new Date(appt.date).toLocaleDateString()}</p>
                  <p><strong>Time:</strong> {appt.time || "N/A"}</p>
                  <p><strong>Status:</strong> {appt.status}</p>
                  {appt.status === "Completed" && (
                    <button
                      className="btn-feedback"
                      disabled={appt.feedbackGiven}
                      onClick={() => navigate(`/feedback/${appt._id}`, { state: { appointment: appt } })}
                    >
                      Give Feedback
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p style={{ padding: "10px" }}>No past appointments found.</p>
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
        <button className="btn-blue" onClick={() => navigate("/viewAppointments")}>Booked Appointments</button>
        <button className="btn-yellow" onClick={() => navigate("/symptom")}>Symptom Checker</button>
      </section>

      {/* Doctors Section */}
<section className="doctors">
  <h2 className="section-title">Top Rated Doctors</h2>
  <p className="section-subtitle">
    Meet our most trusted and highly rated specialists ready to assist you.
  </p>

  <div className="doctor-grid">
    {topDoctors.length > 0 ? (
      topDoctors.map((doctor, index) => (
        <div key={index} className="doctor-card">
          <div className="doctor-image-wrapper">
            <img
              src={doctor.profileImage || "/images/doctors/doctor-card1.png"}
              alt={doctor.name || "Doctor"}
              className="doctor-image"
            />
            <div className="rating-badge">
              <FaStar className="star-icon" /> {doctor.rating?.toFixed(1) || "N/A"}
            </div>
          </div>

          <div className="doctor-info">
            <h3 className="doctor-name">{doctor.name}</h3>
            <p className="doctor-specialization">{doctor.specialization}</p>
            <p className="doctor-clinic"><strong>Clinic:</strong> {doctor.clinicName}</p>
            <p className="doctor-location">
              {doctor.address?.city}, {doctor.address?.state}
            </p>
            <p className="doctor-experience">
              <strong>Experience:</strong> {doctor.experience} years
            </p>
            <p className="doctor-rate">
              <strong>Consultation Fee:</strong> ₹{doctor.rate}
            </p>
          </div>

          <button
            className="book-btn"
            onClick={() => navigate("/appointment", { state: { doctor } })}
          >
            Book Appointment
          </button>
        </div>
      ))
    ) : (
      <p>Loading top doctors...</p>
    )}
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
