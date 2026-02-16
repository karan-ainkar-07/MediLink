import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Feedback.css";
import { backendUrl } from "../constants";
import axios from "axios";

export default function Feedback() {
  const location = useLocation();
  const { appointment } = location.state || {};
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    overall: 0,
    attentive: "",
    explanation: "",
    waiting: "",
    cleanliness: "",
    staff: "",
    comments: "",
    consent: false,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleStarClick = (rating) => {
    setFormData((prev) => ({ ...prev, overall: rating }));
  };

  const handleClick = async () => {
    if (!appointment || !appointment.doctor?._id) {
      console.error("Appointment or doctor data missing.");
      return;
    }

    try {
      setLoading(true);
      await axios.post(
        `${backendUrl}/userProfile/give-feedback`,
        formData,
        {
          params: {
            doctorId: appointment.doctor._id,
            appointmentId: appointment._id,
          },
          withCredentials: true,
        }
      );

      navigate("/dashboard");
    } catch (error) {
      console.error("Error submitting feedback:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="feedback-wrapper">
      <form className="feedback-form">
        <h2>Doctor Appointment Feedback</h2>
        <p className="subtitle">
          We value your opinion and strive to improve your experience.
        </p>

        {/* --- Doctor Info --- */}
        {appointment && (
          <div className="doctor-info">
            <img
              src={appointment.doctor?.profileImage || "/images/doctors/default.png"}
              alt={appointment.doctor?.name || "Doctor"}
              className="doctor-img"
            />
            <div>
              <p><strong>Doctor:</strong> {appointment.doctor?.name || "Unknown"}</p>
              <p><strong>Specialization:</strong> {appointment.doctor?.specialization || "General"}</p>
              <p><strong>Date:</strong> {new Date(appointment.date).toLocaleDateString()}</p>
              <p><strong>Time:</strong> {appointment.time}</p>
            </div>
          </div>
        )}

        {/* --- Overall Rating --- */}
        <div className="form-group">
          <label>Overall Experience</label>
          <div className="star-rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`star ${formData.overall >= star ? "active" : ""}`}
                onClick={() => handleStarClick(star)}
              >
                ★
              </span>
            ))}
          </div>
        </div>

        {/* --- Doctor Behavior --- */}
        <div className="form-row">
          <div className="form-group">
            <label>Doctor Attentiveness</label>
            <select name="attentive" value={formData.attentive} onChange={handleChange}>
              <option value="">Select</option>
              <option>Poor</option>
              <option>Ok</option>
              <option>Good</option>
              <option>Very Good</option>
            </select>
          </div>
          <div className="form-group">
            <label>Explanation of Condition</label>
            <select name="explanation" value={formData.explanation} onChange={handleChange}>
              <option value="">Select</option>
              <option>Poor</option>
              <option>Ok</option>
              <option>Good</option>
              <option>Very Good</option>
            </select>
          </div>
        </div>

        {/* --- Clinic Experience --- */}
        <div className="form-row three">
          <div className="form-group">
            <label>Waiting Time</label>
            <select name="waiting" value={formData.waiting} onChange={handleChange}>
              <option value="">Select</option>
              <option>Poor</option>
              <option>Ok</option>
              <option>Good</option>
              <option>Very Good</option>
            </select>
          </div>

          <div className="form-group">
            <label>Cleanliness</label>
            <select name="cleanliness" value={formData.cleanliness} onChange={handleChange}>
              <option value="">Select</option>
              <option>Poor</option>
              <option>Ok</option>
              <option>Good</option>
              <option>Very Good</option>
            </select>
          </div>

          <div className="form-group">
            <label>Staff Behaviour</label>
            <select name="staff" value={formData.staff} onChange={handleChange}>
              <option value="">Select</option>
              <option>Poor</option>
              <option>Ok</option>
              <option>Good</option>
              <option>Very Good</option>
            </select>
          </div>
        </div>

        {/* --- Comments --- */}
        <div className="form-group">
          <label>Additional Comments or Suggestions</label>
          <textarea
            name="comments"
            rows="4"
            placeholder="Share your thoughts..."
            value={formData.comments}
            onChange={handleChange}
          ></textarea>
        </div>

        {/* --- Consent --- */}
        <div className="feedback-consent">
          <input
            type="checkbox"
            name="consent"
            checked={formData.consent}
            onChange={handleChange}
          />
          <span>I agree to be contacted regarding my feedback.</span>
        </div>

        {/* --- Submit --- */}
        <button
          type="button"
          className="feedback-btn"
          onClick={handleClick}
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit Feedback"}
        </button>
      </form>
    </div>
  );
}
