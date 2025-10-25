import { useState } from "react";
import "./DoctorForm.css"; // import the CSS

export default function DoctorPrescriptionForm() {
  const [patientName, setPatientName] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [prescription, setPrescription] = useState("");
  const [medicines, setMedicines] = useState([
    { name: "", morning: false, afternoon: false, evening: false },
  ]);

  const baseUrl = "http://localhost:8000";

  const handleMedicineChange = (index, field, value) => {
    const updatedMedicines = [...medicines];
    updatedMedicines[index][field] = value;
    setMedicines(updatedMedicines);
  };

  const addMedicine = () => {
    setMedicines([
      ...medicines,
      { name: "", morning: false, afternoon: false, evening: false },
    ]);
  };

  const sendPrescription = async () => {
    let medicineList = medicines
      .map((med) => {
        let times = [];
        if (med.morning) times.push("Morning");
        if (med.afternoon) times.push("Afternoon");
        if (med.evening) times.push("Evening");

        return `${med.name} - ${times.join(", ")}`;
      })
      .join("\n");

    const message = `Hello ${patientName},\n\nHere is your e-prescription:\n\n${medicineList}\n\nNotes:\n${prescription}\n\nGet well soon!`;

    const dataSend = {
      email: patientEmail,
      subject: `E-Prescription for ${patientName}`,
      message,
    };

    try {
      const res = await fetch(`${baseUrl}/email/sendPrescription`, {
        method: "POST",
        body: JSON.stringify(dataSend),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        alert("Prescription sent successfully!");
      } else {
        alert("Failed to send prescription");
      }
    } catch (err) {
      console.error(err);
      alert("Error sending prescription");
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-title">Doctor E-Prescription Form</h2>

      <div className="input-group">
        <label>Patient Name</label>
        <input
          type="text"
          placeholder="Enter patient's name"
          onChange={(e) => setPatientName(e.target.value)}
        />
      </div>

      <div className="input-group">
        <label>Patient Email</label>
        <input
          type="email"
          placeholder="Enter patient's email"
          onChange={(e) => setPatientEmail(e.target.value)}
        />
      </div>

      <h3 className="med-title">Medicines</h3>
      {medicines.map((med, index) => (
        <div key={index} className="medicine-row">
          <input
            type="text"
            placeholder="Medicine name"
            value={med.name}
            onChange={(e) =>
              handleMedicineChange(index, "name", e.target.value)
            }
            className="medicine-input"
          />
          <label>
            <input
              type="checkbox"
              checked={med.morning}
              onChange={(e) =>
                handleMedicineChange(index, "morning", e.target.checked)
              }
            />
            Morning
          </label>
          <label>
            <input
              type="checkbox"
              checked={med.afternoon}
              onChange={(e) =>
                handleMedicineChange(index, "afternoon", e.target.checked)
              }
            />
            Afternoon
          </label>
          <label>
            <input
              type="checkbox"
              checked={med.evening}
              onChange={(e) =>
                handleMedicineChange(index, "evening", e.target.checked)
              }
            />
            Evening
          </label>
        </div>
      ))}

      <button className="add-btn" onClick={addMedicine}>
        + Add More Medicine
      </button>

      <div className="input-group">
        <label>Additional Notes</label>
        <textarea
          placeholder="Write prescription details here..."
          onChange={(e) => setPrescription(e.target.value)}
        />
      </div>

      <button className="send-btn" onClick={sendPrescription}>
        Send Prescription
      </button>
    </div>
  );
}
