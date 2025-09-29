import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./Dashboard";
import Auth from "./Auth"
import Appointment from "./Appointment";
import SymptomsChecker from "./SymptomChecker";
import BookingPanel from "./BookingPanel";
import SignUp from "./userSignUp";
import VerifyOTP from "./verifyOtp";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Auth/> } />
        <Route path="/signUp" element={<SignUp/>}/>
        <Route path="/verifyOTP" element={<VerifyOTP/>}/>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/appointment" element={<Appointment />} />
        <Route path="/symptom" element={<SymptomsChecker />} />
        <Route path="/BookingPanel" element={<BookingPanel />} />
      </Routes>
    </Router>

    // <DoctorDashboard/>
  );
}

export default App;
