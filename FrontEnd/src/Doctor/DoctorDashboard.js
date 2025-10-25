import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./DoctorDashboard.css";
import { backendUrl } from "../constants";

function DoctorDashboard() {
  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loadingDoctor, setLoadingDoctor] = useState(true);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [currentToken, setCurrentToken] = useState(0);
  const [queueMsg, setQueueMsg] = useState(null);
  const [queueStatus, setQueueStatus] = useState("In-Progress");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [clinicStatus, setClinicStatus] = useState("Open");

  const appointmentRef = useRef(null);
  const aboutRef = useRef(null);
  const contactRef = useRef(null);
  const navigate = useNavigate();

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

  const scrollTo = (ref) => ref.current.scrollIntoView({ behavior: "smooth" });

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

  const handleNextCoupon = async () => {
    try {
      const res = await axios.get(`${backendUrl}/doctor/next-coupon`, { withCredentials: true });
      if (res.data && res.data.data) {
        console.log(res)
        console.log(appointments)
        const next = res.data.data;
        if (!next.startTime) next.startTime = new Date().toISOString();

        setCurrentPatient(next);
        setCurrentToken(next.couponNumber);
        setQueueMsg({ type: "started", text: `🎟️ Token #${next.couponNumber} called` });
      } else {
        setQueueMsg({ type: "error", text: "No next patient in queue" });
      }
    } catch (err) {
      console.error(err);
      setQueueMsg({ type: "error", text: "Error fetching next coupon" });
    }
  };

  const completeAppointment = async () => {
    if (!currentPatient) return;

    try {
      await axios.post(
        `${backendUrl}/doctor/complete-appointment`,
        { patientId: currentPatient.patient._id },
        { withCredentials: true }
      );
      setQueueMsg({ type: "started", text: `✅ Appointment for ${currentPatient.patientName} completed` });
      setCurrentPatient(null);
      setCurrentToken(0);
    } catch (err) {
      console.error(err);
      setQueueMsg({ type: "error", text: "Error completing appointment" });
    }
  };

  const handleStatusChange = (id) => {
    setAppointments((prev) =>
      prev.map((appt) =>
        appt.id === id && appt.status === "Booked"
          ? { ...appt, status: "Completed" }
          : appt
      )
    );
  };


  const toggleClinic = (status) => setClinicStatus(status);

  if (loadingDoctor) return <p>Loading doctor data...</p>;
  if (!doctor) return <p>No doctor data found.</p>;

  return (
    <div className="App">
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

      <div className={`profile-sidebar ${sidebarOpen ? "open" : ""}`}>
        <button className="close-sidebar" onClick={() => setSidebarOpen(false)}>X</button>
        <h3>Clinic Controls</h3>
        <div className="clinic-buttons">
          <button className={clinicStatus === "Open" ? "active" : ""} onClick={() => toggleClinic("Open")}>
            Start Clinic
          </button>
          <button className={clinicStatus === "Closed" ? "active" : ""} onClick={() => toggleClinic("Closed")}>
            Close Clinic
          </button>
        </div>
      </div>

      <section className="hero" style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url("./images/clinic.jpg")` }}>
        <div className="hero-content">
          <h1>Good morning, {doctor.name}</h1>
          <p>Here's what's happening with your practice today</p>
          <button className="appointment-btn" onClick={() => scrollTo(appointmentRef)}>See Appointments</button>
        </div>
      </section>

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

      <div className="queue-controls">
        <button onClick={handleNextCoupon} disabled={!!currentPatient}>Next Coupon</button>
        <button onClick={toggleQueue} disabled={!!currentPatient}>
          {queueStatus === "In-Progress" ? "Pause Queue" : "Resume Queue"}
        </button>
      </div>

      {queueMsg && (
        <p className={`queue-msg ${queueMsg.
        type === "started" ? "queue-started" : queueMsg.type === "halted" ? "queue-halted" : "queue-error"}`}>
          {queueMsg.text}
        </p>
      )}

      <div className="current-patient">
        <h2>Current Patient</h2>
        {currentPatient ? (
          <>
            <p>Token #{currentToken} : {currentPatient.name}</p>
            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
              <button className="prescription-btn" onClick={() => navigate(`/prescription/${currentPatient.nextPatient._id}`)}>
                Give Prescription
              </button>
              <button className="complete-btn" onClick={completeAppointment}>
                Complete Appointment
              </button>
            </div>
          </>
        ) : (
          <p>No patient (Queue paused or empty)</p>
        )}
      </div>

      <section className="appointments" ref={appointmentRef}>
        <h2>Today's Appointments</h2>
        {loadingAppointments ? (
          <p>Loading appointments...</p>
        ) : appointments.length === 0 ? (
          <p>No appointments found.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Token</th>
                <th>Name</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.filter((appt) => !currentPatient || appt.id !== currentPatient.id).map((appt) => (
                <tr key={appt.id}>
                  <td>{appt.id}</td>
                  <td>{appt.patientName}</td>
                  <td>
                    {appt.status === "Booked" ? (
                      <button className="pending-btn" onClick={() => handleStatusChange(appt.id)}>Pending</button>
                    ) : (
                      <span className="completed">Completed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

export default DoctorDashboard;
