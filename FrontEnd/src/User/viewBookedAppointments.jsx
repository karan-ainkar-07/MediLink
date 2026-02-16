import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ViewAppointments.css";
import { backendUrl } from "../constants";

export default function ViewBookedAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAppointments = async () => {
    try {
      const res = await axios.get(`${backendUrl}/userProfile/view-appointments`, {
        withCredentials: true,
      });
      setAppointments(res.data?.data?.appointments || []);
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  if (loading) return <div className="appointments-loading">Loading appointments...</div>;
  if (error) return <div className="appointments-error">{error}</div>;

  return (
    <div className="appointments-container">
      <h2 className="appointments-title">My Booked Appointments</h2>
      {appointments.length === 0 ? (
        <p className="no-appointments">No appointments booked.</p>
      ) : (
        <div className="appointments-grid">
          {appointments.map((appt) => (
            <div key={appt._id} className="appointment-card">
              <div className="doctor-section">
                <div className="doctor-info">
                  <img
                    src={appt.doctor?.profileImage || "/default-doctor.png"}
                    alt="Doctor"
                    className="doctor-image"
                  />
                  <div>
                    <h3>{appt.doctor?.name || "Unknown Doctor"}</h3>
                    <p className="specialization">{appt.doctor?.specialization || "N/A"}</p>
                    <p className="rate">
                      {appt.doctor?.rate ? `₹${appt.doctor.rate}` : "Rate not available"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="clinic-section">
                <h4>Clinic Information</h4>
                <p><strong>Name:</strong> {appt.doctor?.clinicName || "N/A"}</p>
                <p><strong>Address:</strong> {`${appt.doctor?.address?.line1 || ""}, ${appt.doctor?.address?.city || ""}, ${appt.doctor?.address?.state || ""}`}</p>
              </div>

              <div className="details-section">
                <h4>Appointment Details</h4>
                <p><strong>Date:</strong> {new Date(appt.date).toLocaleDateString()}</p>
                <p><strong>Time:</strong> {appt.time || "N/A"}</p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    className={`status-text ${
                      appt.partOfQueue.status === "Stopped"
                        ? "status-stopped"
                        : "status-active"
                    }`}
                  >
                    {appt.partOfQueue.status}
                  </span>
                </p>
                <p><strong>Coupon Number:</strong> {appt.couponNumber}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
