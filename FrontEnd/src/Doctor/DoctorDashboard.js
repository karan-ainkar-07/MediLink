import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "./DoctorDashboard.css";
import { backendUrl } from "../constants";

function DoctorDashboard() {
  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loadingDoctor, setLoadingDoctor] = useState(true);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [currentToken, setCurrentToken] = useState(1);
  const [queueMsg, setQueueMsg] = useState(null);
  const [queueStatus, setQueueStatus] = useState("In-Progress"); // Track queue
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [clinicStatus, setClinicStatus] = useState("Open"); // Open / Closed

  const appointmentRef = useRef(null);
  const aboutRef = useRef(null);
  const contactRef = useRef(null);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const res = await axios.get(`${backendUrl}/doctor/get-current-user`, { withCredentials: true });
        setDoctor(res.data.data);
      } catch (err) {
        console.error("Error fetching doctor:", err);
      } finally {
        setLoadingDoctor(false);
      }
    };

    const fetchAppointments = async () => {
      try {
        const res = await axios.get(`${backendUrl}/doctor/view-appointments`, { withCredentials: true });
        const mappedAppointments = res.data.data.map((appt, idx) => ({
          ...appt,
          id: idx + 1,
          patientName: appt.patient?.name || "Patient " + (idx + 1),
          status: appt.status || "Booked",
        }));
        setAppointments(mappedAppointments);
      } catch (err) {
        console.error("Error fetching appointments:", err);
      } finally {
        setLoadingAppointments(false);
      }
    };

    fetchDoctor();
    fetchAppointments();
  }, []);

  const handleStatusChange = (id) => {
    setAppointments((prev) =>
      prev.map((appt) =>
        appt.id === id && appt.status === "Booked" ? { ...appt, status: "Completed" } : appt
      )
    );
    setCurrentToken((prev) => prev + 1);
    setQueueMsg(null);
  };

  const scrollTo = (ref) => ref.current.scrollIntoView({ behavior: "smooth" });

  const openPrescriptionWindow = () => {
    const width = 900;
    const height = 800;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;

    window.open(
      "/prescription",
      "PrescriptionWindow",
      `width=${width},height=${height},top=${top},left=${left},resizable=no,scrollbars=no`
    );
  };

  // Pause / Resume Queue (single button)
  const toggleQueue = async () => {
    if (queueStatus === "In-Progress") {
      try {
        await axios.patch(`${backendUrl}/doctor/pause-queue`, {}, { withCredentials: true });
        setQueueMsg({ type: "halted", text: "🚨 Queue Paused" });
        setQueueStatus("Stopped");
      } catch (err) {
        console.error(err);
        setQueueMsg({ type: "error", text: "❌ Failed to pause queue" });
      }
    } else {
      try {
        await axios.patch(`${backendUrl}/doctor/resume-queue`, {}, { withCredentials: true });
        setQueueMsg({ type: "started", text: "✅ Queue Resumed" });
        setQueueStatus("In-Progress");
      } catch (err) {
        console.error(err);
        setQueueMsg({ type: "error", text: "❌ Failed to resume queue" });
      }
    }
  };

  // Clinic Controls
  const toggleClinic = (status) => {
    setClinicStatus(status);
  };

  if (loadingDoctor) return <p>Loading doctor data...</p>;
  if (!doctor) return <p>No doctor data found.</p>;

  const currentPatient =
    currentToken === 0 || queueStatus === "Stopped"
      ? null
      : appointments.find((appt) => appt.id === currentToken);

  return (
    <div className="App">
      {/* Navbar */}
      <nav className="navbar">
        <img src="./images/logo/logo.png" alt="Logo" className="logo-img" />
        <ul className="nav-links">
          <li onClick={() => scrollTo(appointmentRef)}>Home</li>
          <li onClick={() => scrollTo(aboutRef)}>About</li>
          <li onClick={() => scrollTo(contactRef)}>Contact</li>
        </ul>
        <button className="profile-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
          Profile
        </button>
      </nav>

      {/* Sidebar */}
      <div className={`profile-sidebar ${sidebarOpen ? "open" : ""}`}>
        <button className="close-sidebar" onClick={() => setSidebarOpen(false)}>X</button>
        <h3>Clinic Controls</h3>
        <div className="clinic-buttons">
          <button
            className={clinicStatus === "Open" ? "active" : ""}
            onClick={() => toggleClinic("Open")}
          >
            Start Clinic
          </button>
          <button
            className={clinicStatus === "Closed" ? "active" : ""}
            onClick={() => toggleClinic("Closed")}
          >
            Close Clinic
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <section
        className="hero"
        style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url("./images/clinic.jpg")` }}
      >
        <div className="hero-content">
          <h1>Good morning, {doctor.name}</h1>
          <p>Here's what's happening with your practice today</p>
          <button className="appointment-btn" onClick={() => scrollTo(appointmentRef)}>
            See Appointments
          </button>
        </div>
      </section>

      {/* Stats */}
      <div className="stats">
        <div className="stat-card">
          <h3>Total Booking</h3>
          <p>{appointments.length} Today</p>
        </div>
        <div className="stat-card">
          <h3>Current Token</h3>
          <p>#{currentToken}</p>
        </div>
      </div>

      {/* Queue Control Single Button */}
      <div className="queue-controls">
        <button onClick={toggleQueue}>
          {queueStatus === "In-Progress" ? "Pause Queue" : "Resume Queue"}
        </button>
      </div>

      {queueMsg && (
        <p
          className={`queue-msg ${
            queueMsg.type === "started"
              ? "queue-started"
              : queueMsg.type === "halted"
              ? "queue-halted"
              : "queue-error"
          }`}
        >
          {queueMsg.text}
        </p>
      )}

      {/* Current Patient */}
      <div className="current-patient">
        <h2>Current Patient</h2>
        {currentPatient ? (
          <>
            <p>Token #{currentToken} : {currentPatient.patientName}</p>
            <button className="prescription-btn" onClick={openPrescriptionWindow}>
              Give Prescription
            </button>
          </>
        ) : (
          <p>No patient (Queue paused or empty)</p>
        )}
      </div>

      {/* Appointments Section */}
      <section className="appointments" ref={appointmentRef}>
        <h2>Today's Appointments</h2>
        {loadingAppointments ? <p>Loading appointments...</p> :
          appointments.length === 0 ? <p>No appointments found.</p> :
            <table>
              <thead>
                <tr>
                  <th>Token</th>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Prescription</th>
                </tr>
              </thead>
              <tbody>
                {appointments
                  .filter((appt) => !currentPatient || appt.id !== currentPatient.id)
                  .map((appt) => (
                    <tr key={appt.id}>
                      <td>{appt.id}</td>
                      <td>{appt.patientName}</td>
                      <td>
                        {appt.status === "Booked" ? (
                          <button className="pending-btn" onClick={() => handleStatusChange(appt.id)}>
                            Pending
                          </button>
                        ) : (
                          <span className="completed">Completed</span>
                        )}
                      </td>
                      <td>
                        {appt.status === "Completed" && (
                          <button className="prescription-btn" onClick={openPrescriptionWindow}>
                            Send Prescription
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>}
      </section>

      {/* About Section */}
      <section ref={aboutRef} className="about-section">
        <h2>About Us</h2>
        <p>We are a trusted local clinic committed to delivering quality healthcare with care and compassion.</p>
      </section>

      {/* Contact Section */}
      <section ref={contactRef} className="contact-section">
        <h2>Contact Us</h2>
        <p>📞 +1-212-456-7890</p>
        <p>📧 medilink@gmail.com</p>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-left">
          <p>We are a trusted local clinic committed to delivering quality healthcare with care and compassion.</p>
        </div>
        <div className="footer-right">
          <div>
            <h4>Company</h4>
            <p>Home</p>
            <p>About us</p>
            <p>Contact us</p>
            <p>Privacy policy</p>
          </div>
          <div>
            <h4>Get in Touch</h4>
            <p>+1-212-456-7890</p>
            <p>medilink@gmail.com</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default DoctorDashboard;
