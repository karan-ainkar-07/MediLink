import { useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./DoctorForm.css";
import { backendUrl } from "../constants";

export default function DoctorPrescriptionForm() {
  const { patientId } = useParams();
  const [notes, setNotes] = useState("");
  const [diagnoses, setDiagnoses] = useState([{ condition: "" }]);
  const [medicines, setMedicines] = useState([
    { name: "", dosage: "", duration: "", frequency: [] },
  ]);

  const handleDiagnosisChange = (index, value) => {
    const updated = [...diagnoses];
    updated[index].condition = value;
    setDiagnoses(updated);
  };

  const addDiagnosis = () => {
    setDiagnoses([...diagnoses, { condition: "" }]);
  };

  const handleMedicineChange = (index, field, value) => {
    const updated = [...medicines];
    if (field === "frequency") {
      if (updated[index].frequency.includes(value)) {
        updated[index].frequency = updated[index].frequency.filter((f) => f !== value);
      } else {
        updated[index].frequency.push(value);
      }
    } else {
      updated[index][field] = value;
    }
    setMedicines(updated);
  };

  const addMedicine = () => {
    setMedicines([
      ...medicines,
      { name: "", dosage: "", duration: "", frequency: [] },
    ]);
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post(
        { diagnoses, medicines, notes },
        { withCredentials: true }
      );

      if (response.status === 200) {
        alert("Prescription saved successfully!");
        setNotes("");
        setDiagnoses([{ condition: "" }]);
        setMedicines([{ name: "", dosage: "", duration: "", frequency: [] }]);
      }
    } catch (err) {
      console.error(err);
      alert("Error saving prescription");
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-title">E-Prescription</h2>
      <p className="patient-id">Patient ID: <strong>{patientId}</strong></p>

      <section>
        <h3 className="section-title">Diagnoses</h3>
        {diagnoses.map((diag, i) => (
          <div key={i} className="input-row">
            <input
              type="text"
              placeholder="Condition (e.g., Diabetes, Hypertension)"
              value={diag.condition}
              onChange={(e) => handleDiagnosisChange(i, e.target.value)}
            />
          </div>
        ))}
        <button className="add-btn" onClick={addDiagnosis}>
          + Add Diagnosis
        </button>
      </section>

      <section>
        <h3 className="section-title">Medicines</h3>
        {medicines.map((med, i) => (
          <div key={i} className="medicine-card">
            <input
              type="text"
              placeholder="Medicine name"
              value={med.name}
              onChange={(e) => handleMedicineChange(i, "name", e.target.value)}
            />
            <input
              type="number"
              placeholder="Dosage (mg)"
              value={med.dosage}
              onChange={(e) => handleMedicineChange(i, "dosage", e.target.value)}
            />
            <input
              type="number"
              placeholder="Duration (days)"
              value={med.duration}
              onChange={(e) => handleMedicineChange(i, "duration", e.target.value)}
            />

            <div className="freq-options">
              {["Morning", "Afternoon", "Evening", "Night"].map((time) => (
                <label key={time}>
                  <input
                    type="checkbox"
                    checked={med.frequency.includes(time)}
                    onChange={() => handleMedicineChange(i, "frequency", time)}
                  />
                  {time}
                </label>
              ))}
            </div>
          </div>
        ))}
        <button className="add-btn" onClick={addMedicine}>
          + Add Medicine
        </button>
      </section>

      <div className="input-group">
        <label>Additional Notes</label>
        <textarea
          placeholder="Write prescription notes or observations..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <button className="send-btn" onClick={handleSubmit}>
        Save & Complete Appointment
      </button>
    </div>
  );
}
