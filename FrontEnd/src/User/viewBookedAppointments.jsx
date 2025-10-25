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

  if (loading) return <div className="appointments-loading">Loading...</div>;
  if (error) return <div className="appointments-error">{error}</div>;

  return (
    <div className="appointments-container">
      <h2>My Booked Appointments</h2>
      {appointments.length === 0 ? (
        <p>No appointments booked.</p>
      ) : (
        <ul className="appointments-list">
          {appointments.map((appt) => (
            <li
              key={appt._id}
              className={`appointment-card ${appt.isPresent ? "live-appointment" : ""}`}
            >
              <div className="appointment-section">
                <h3>Doctor Info</h3>
                <p><strong>Name:</strong> {appt.doctor?.name || "N/A"}</p>
                <p><strong>Specialization:</strong> {appt.doctor?.specialization?.join(", ") || "N/A"}</p>
                <p><strong>Rate:</strong> {appt.doctor?.rate ? `₹${appt.doctor.rate}` : "N/A"}</p>
                {appt.doctor?.profileImage && <img src={appt.doctor.profileImage} alt="Doctor" className="doctor-image" />}
              </div>

              <div className="appointment-section">
                <h3>Clinic Info</h3>
                <p><strong>Name:</strong> {appt.clinic?.name || "N/A"}</p>
                <p><strong>Email:</strong> {appt.clinic?.email || "N/A"}</p>
                <p><strong>Mobile:</strong> {appt.clinic?.mobileNo || "N/A"}</p>
                <p><strong>Address:</strong> {appt.clinic?.address?.line1}, {appt.clinic?.address?.city}, {appt.clinic?.address?.country}</p>
                {appt.clinic?.logo && <img src={appt.clinic.logo} alt="Clinic Logo" className="clinic-logo" />}
              </div>

              <div className="appointment-section">
                <h3>Appointment Details</h3>
                <p><strong>Date:</strong> {new Date(appt.date).toLocaleDateString()}</p>
                <p><strong>Status:</strong> {appt.status}</p>
                <p><strong>Coupon Number:</strong> {appt.couponNumber}</p>
                <p><strong>Live:</strong> {appt.isPresent ? "Yes" : "No"}</p>
                <p><strong>Queue Status:</strong> {appt.partOfQueue?.status || "N/A"}</p>
                <p><strong>Current Token:</strong> {appt.partOfQueue?.currentToken || 0}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
