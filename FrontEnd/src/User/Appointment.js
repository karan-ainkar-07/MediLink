import React, { useState } from "react";
import "./Appointment.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { backendUrl } from "../constants";

export default function Appointment() {
  const navigate = useNavigate();
  const [speciality, setSpeciality] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!date) {
      alert("Please select a date");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const queryParams = new URLSearchParams();
      if (speciality) queryParams.append("specialization", speciality);
      if (location) queryParams.append("city", location);
      queryParams.append("date", date); 

      const res = await axios.get(
        `${backendUrl}/userProfile/get-doctors?${queryParams.toString()}`,
        { headers: { "Content-Type": "application/json" } }
      );

      setResults(res.data.data.docList);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch doctors");
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
          <option value="Dentist">Dentist</option>
          <option value="Dermatology">Dermatology</option>
          <option value="Pediatrics">Pediatrics</option>
          <option value="General Practitioner">General Practitioner</option>
        </select>

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          min={new Date().toISOString().split("T")[0]}
          required
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
                <img src={doc.profileImage} alt={doc.email} />
              </div>

              <div className="doctor-info">
                <h3 className="doctor-header">{doc.name}</h3>
                <p>
                  <strong>Speciality:</strong> {doc.specialization || "N/A"}
                </p>
                <p>
                  <strong>Experience:</strong> {doc.experience || 0} years
                </p>
                <p>
                  <strong>Qualification:</strong>{" "}
                  {Array.isArray(doc.education)
                    ? doc.education.map((e) => e.degree || "").join(", ")
                    : "N/A"}
                </p>
              </div>

              <div className="doctor-footer">
                <button
                  className="btn-view"
                  onClick={() =>
                    navigate(`/BookingPanel/${doc._id}`, { state: { date } })
                  }
                >
                  View
                </button>
              </div>
            </div>
          ))
        ) : (
          !loading &&
          !error && (
            <p className="no-results">No doctors found. Try adjusting filters.</p>
          )
        )}
      </div>
    </div>
  );
}
