import React, { useEffect, useState } from "react";
import axios from "axios";
import "./BookedAppointment.css";
import { backendUrl } from "../constants";

export default function BookedAppointment() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await axios.get(`${backendUrl}/userProfile/view-appointments`, {
          withCredentials: true,
        });
        
        console.log("API Response:", response.data);
        
        // Extract appointments from the nested structure
        let appointmentsData = [];
        
        if (response.data && response.data.data && response.data.data.appointments) {
          appointmentsData = response.data.data.appointments;
        } else if (Array.isArray(response.data)) {
          appointmentsData = response.data;
        } else if (Array.isArray(response.data?.data)) {
          appointmentsData = response.data.data;
        }
        
        console.log("Extracted appointments:", appointmentsData);
        setAppointments(appointmentsData);
      } catch (err) {
        console.error("Error fetching appointments:", err);
        setError(err.response?.data?.message || "Failed to fetch appointments");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  if (loading) return <p className="loading">Loading booked appointments...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="booked-container">
      <h1>Your Booked Appointments</h1>

      {!appointments || appointments.length === 0 ? (
        <p className="no-results">No booked appointments found.</p>
      ) : (
        <div className="appointment-list">
          {appointments.map((app) => (
            <div key={app._id} className="appointment-card">
              <div className="card-left">
                <h2>{app.doctor?.name || "Dr. Unknown"}</h2>
                <p><strong>Specialization:</strong> {app.doctor?.specialization?.join(", ") || "N/A"}</p>
                <p><strong>Clinic:</strong> {app.clinic?.name || "N/A"}</p>
                <p><strong>Address:</strong> {app.clinic?.address ? 
                  `${app.clinic.address.street || ""}, ${app.clinic.address.city || ""}, ${app.clinic.address.state || ""} ${app.clinic.address.zipCode || ""}`.trim() 
                  : "N/A"}</p>
                <p><strong>Date:</strong> {new Date(app.date).toLocaleDateString()}</p>
              </div>

              <div className="card-right">
                <p><strong>Token Number:</strong> {app.couponNumber || "N/A"}</p>
                <p><strong>Current Token:</strong> {app.partOfQueue?.currentToken || "N/A"}</p>
                <p><strong>Fees:</strong> ₹{app.doctor?.rate || 0}</p>
                <p><strong>Appointment Status:</strong> {app.status || "N/A"}</p>
                <p>
                  <strong>Queue Status:</strong>{" "}
                  <span className={`status ${app.partOfQueue?.status === "HALT" ? "halt" : app.partOfQueue?.status === "In-Progress" ? "in-progress" : "unknown"}`}>
                    {app.partOfQueue?.status === "HALT" ? "Queue Halted" : 
                     app.partOfQueue?.status === "In-Progress" ? "Queue In Progress" : 
                     app.partOfQueue?.status || "Unknown"}
                  </span>
                </p>
                <p><strong>Present:</strong> {app.isPresent ? "Yes" : "No"}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}