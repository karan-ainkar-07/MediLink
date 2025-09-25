import React, { useState } from "react";
import "./Appointment.css";
import { useNavigate } from "react-router-dom";

export default function Appointment() {
  const navigate = useNavigate();
  const [speciality, setSpeciality] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [results, setResults] = useState([]);

  const doctors = [
    {
      id: 1,
      name: "Dr. Richard Jones",
      speciality: "Treatment of Illness",
      experience: 10,
      qualification: "MBBS, MD",
      fees: 500,
      location: "Thane",
      image: "/images/doctors/doctor-card1.png",
    },
    {
      id: 2,
      name: "Dr. Sarah Lee",
      speciality: "Treatment of Illness",
      experience: 7,
      qualification: "MBBS, MS",
      fees: 600,
      location: "Thane",
      image: "/images/doctors/doctor-card2.png",
    },
    {
      id: 3,
      name: "Dr. Amit Desai",
      speciality: "Treatment of Illness",
      experience: 15,
      qualification: "MBBS, MD",
      fees: 800,
      location: "Thane",
      image: "/images/doctors/doctor-card3.png",
    },
  ];

  const handleSearch = () => {
    const filtered = doctors.filter(
      (doc) =>
        (speciality
          ? doc.speciality.toLowerCase() === speciality.toLowerCase()
          : true) &&
        (location ? doc.location.toLowerCase() === location.toLowerCase() : true)
    );
    setResults(filtered);
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

      <div className="doctor-results">
        {results.length > 0 ? (
          results.map((doc) => (
            <div key={doc.id} className="doctor-card">
              <div className="doctor-image">
                <img src={doc.image} alt={doc.name} />
              </div>

              <div className="doctor-info">
                <h3 className="doctor-header">{doc.name}</h3>
                <p>
                  <strong>Speciality:</strong> {doc.speciality}
                </p>
                <p>
                  <strong>Experience:</strong> {doc.experience} years
                </p>
                <p>
                  <strong>Qualification:</strong> {doc.qualification}
                </p>
              </div>

              <div className="doctor-footer">
                <span className="doctor-fees">₹{doc.fees}</span>
                <button className="btn-view" onClick={() => navigate("/BookingPanel")}>View</button>
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
