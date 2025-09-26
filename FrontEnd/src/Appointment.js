import React, { useState } from "react";
import "./Appointment.css";
import { useNavigate } from "react-router-dom";

export default function Appointment() {
  const navigate = useNavigate();
  const [speciality, setSpeciality] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    setLoading(true);
    setError("");

    try {
      const queryParams = new URLSearchParams();
      if (speciality) queryParams.append("specialization", speciality);
      if (location) queryParams.append("city", location);

      const res = await fetch(
        `http://localhost:5000/userProfile/get-doctor?${queryParams.toString()}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch doctors");

      setResults(data.data); 
    } catch (err) {
      setError(err.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="appointment-container">
      <h1>Find a Doctor</h1>

      <div className="filters">
        <select
          value={speciality}
          onChange={(e) => setSpeciality(e.target.value)}
        >
          <option value="">Select Speciality</option>
          <option>General Consultation</option>
          <option>Treatment of Illness</option>
          <option>Basic First Aid</option>
          <option>Prescription and Medication Guidance</option>
          <option>Preventive Care</option>
          <option>Chronic Condition Support</option>
        </select>

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          min={new Date().toISOString().split("T")[0]}
        />

        <select value={location} onChange={(e) => setLocation(e.target.value)}>
          <option value="">Select Location</option>
          <option>Thane</option>
          <option>Badlapur</option>
          <option>Panvel</option>
        </select>

        <button className="btn-primary" onClick={handleSearch}>
          Search Doctors
        </button>
      </div>

      {loading && <p>Loading doctors...</p>}
      {error && <p className="error">{error}</p>}

      <div className="doctor-results">
        {results.length > 0 ? (
          results.map((doc) => (
            <div key={doc._id} className="doctor-card">
              <div className="doctor-image">
                <img src={doc.profileImage || "/default-avatar.png"} alt={doc.email} />
              </div>

              <div className="doctor-info">
                <h3 className="doctor-header">{doc.email}</h3>
                <p>
                  <strong>Speciality:</strong> {doc.specialization}
                </p>
                <p>
                  <strong>Experience:</strong> {doc.experience} years
                </p>
                <p>
                  <strong>Qualification:</strong> {doc.education.join(", ")}
                </p>
              </div>

              <div className="doctor-footer">
                <button className="btn-view" onClick={() => 
                  {
                    const doctorId=doc._id;
                    const clinicId=doc.clinic;
                    navigate("/BookingPanel",{state:{
                      doctorId,
                      clinicId,
                      }})}
                }>  
                  View
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="no-results">No doctors found. Try adjusting filters.</p>
        )}
      </div>
    </div>
  );
}
