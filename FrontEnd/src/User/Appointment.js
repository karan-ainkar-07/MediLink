import React, { useState } from "react";
import "./Appointment.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { backendUrl } from "../constants";

function StarRating({ rating }) {
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`star ${star <= Math.round(rating) ? "filled" : star - 0.5 <= rating ? "half" : ""}`}
        >
          ★
        </span>
      ))}
      <span className="rating-value">{rating?.toFixed(1)}</span>
    </div>
  );
}

function formatTime(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const period = h >= 12 ? "PM" : "AM";
  const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${displayH}:${m.toString().padStart(2, "0")} ${period}`;
}

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
      {/* Hero Header */}
      <div className="page-header">
        <div className="header-badge">Healthcare</div>
        <h1 className="page-title">Find Your Doctor</h1>
        <p className="page-subtitle">Search from verified specialists near you</p>
      </div>

      {/* Filter Panel */}
      <div className="filter-panel">
        <div className="filter-group">
          <label className="filter-label">Speciality</label>
          <div className="select-wrapper">
            <select
              value={speciality}
              onChange={(e) => setSpeciality(e.target.value)}
            >
              <option value="">All Specialities</option>
              <option value="Dentist">Dentist</option>
              <option value="Dermatology">Dermatology</option>
              <option value="Pediatrics">Pediatrics</option>
              <option value="General Practitioner">General Practitioner</option>
            </select>
            <span className="select-icon">▾</span>
          </div>
        </div>

        <div className="filter-group">
          <label className="filter-label">Date <span className="required">*</span></label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            required
          />
        </div>

        <div className="filter-group">
          <label className="filter-label">Location</label>
          <div className="select-wrapper">
            <select value={location} onChange={(e) => setLocation(e.target.value)}>
              <option value="">All Locations</option>
              <option>Thane</option>
              <option>Badlapur</option>
              <option>Panvel</option>
            </select>
            <span className="select-icon">▾</span>
          </div>
        </div>

        <button className="btn-search" onClick={handleSearch}>
          <span className="search-icon">⌕</span>
          Search Doctors
        </button>
      </div>

      {/* Status Messages */}
      {loading && (
        <div className="status-message loading-state">
          <div className="pulse-dot"></div>
          Finding available doctors…
        </div>
      )}
      {error && <div className="status-message error-state">⚠ {error}</div>}

      {/* Results */}
      {!loading && !error && results.length > 0 && (
        <div className="results-header">
          <span className="results-count">{results.length} doctor{results.length > 1 ? "s" : ""} found</span>
        </div>
      )}

      <div className="doctor-results">
        {results.length > 0 ? (
          results.map((doc) => (
            <div key={doc._id} className="doctor-card">
              {/* Left: Avatar */}
              <div className="card-avatar">
                <img src={doc.profileImage} alt={doc.name} />
                <div className="availability-badge">
                  Available
                </div>
              </div>

              {/* Center: Info */}
              <div className="card-body">
                <div className="card-top">
                  <div>
                    <h3 className="doctor-name">{doc.name}</h3>
                    <p className="clinic-name">🏥 {doc.clinicName || "Clinic"}</p>
                  </div>
                  <div className="speciality-tag">{doc.specialization || "General"}</div>
                </div>

                <div className="card-meta">
                  <div className="meta-item">
                    <StarRating rating={doc.rating} />
                    <span className="meta-sub">({doc.totalFeedback} reviews)</span>
                  </div>
                  <div className="meta-divider" />
                  <div className="meta-item">
                    <span className="meta-icon">🎓</span>
                    <span>
                      {Array.isArray(doc.education)
                        ? doc.education.map((e) => e.degree).join(", ")
                        : "N/A"}
                    </span>
                  </div>
                  <div className="meta-divider" />
                  <div className="meta-item">
                    <span className="meta-icon">💼</span>
                    <span>{doc.experience || 0} yrs exp</span>
                  </div>
                </div>

                <div className="card-details">
                  <div className="detail-pill">
                    <span className="detail-icon">📍</span>
                    {doc.address
                      ? `${doc.address.line1 ? doc.address.line1 + ", " : ""}${doc.address.city}, ${doc.address.state}`
                      : "N/A"}
                  </div>
                  <div className="detail-pill">
                    <span className="detail-icon">🕐</span>
                    {formatTime(doc.startTime)} – {formatTime(doc.endTime)}
                  </div>
                  <div className="detail-pill">
                    <span className="detail-icon">⏱</span>
                    {doc.slotTime} min slots
                  </div>
                  <div className="detail-pill">
                    <span className="detail-icon">📞</span>
                    {doc.mobileNo}
                  </div>
                </div>
              </div>

              {/* Right: CTA */}
              <div className="card-cta">
                <div className="consultation-fee">
                  <span className="fee-label">Consultation</span>
                  <span className="fee-amount">₹{doc.rate}</span>
                </div>
                <button
                  className="btn-book"
                  onClick={() =>
                    navigate(`/BookingPanel/${doc._id}`, { state: { date } })
                  }
                >
                  Book Now
                </button>
                <p className="cta-note">No hidden charges</p>
              </div>
            </div>
          ))
        ) : (
          !loading && !error && (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <h3>No doctors found</h3>
              <p>Try adjusting your filters or selecting a different date.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}