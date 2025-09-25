import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./Dashboard";
import Appointment from "./Appointment";
import SymptomsChecker from "./SymptomChecker";
import BookingPanel from "./BookingPanel";
import DoctorDashboard from "./DoctorDashboard";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/appointment" element={<Appointment />} />
        <Route path="/symptom" element={<SymptomsChecker />} />
        <Route path="/BookingPanel" element={<BookingPanel />} />
      </Routes>
    </Router>

    // <DoctorDashboard/>
  );
}

export default App;
