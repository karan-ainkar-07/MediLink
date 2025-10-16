import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./Dashboard";
import DashboardDoc from "./DoctorDashboard";
import Auth from "./Auth"
import Appointment from "./Appointment";
import SymptomsChecker from "./SymptomChecker";
import BookingPanel from "./BookingPanel";
import SignUp from "./userSignUp";
import VerifyOTP from "./verifyOtp";
import ClinicSignup from "./ClinicRegister";
import LoginClinic from "./clinicLogin";
import DoctorRegistration from "./doctorSingup";
import ViewAppointments from "./viewAppointments";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Auth/> } />
        <Route path="/clinic-signUp" element={<ClinicSignup/>}/>
        <Route path="/clinic-signIn" element={<LoginClinic/>}/>
        <Route path="/doctor-signUp" element={<DoctorRegistration/>} />
        <Route path="/signUp" element={<SignUp/>}/>
        <Route path="/verifyOTP" element={<VerifyOTP/>}/>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/doctorDashBoard" element={<DashboardDoc/>}/>
        <Route path="/appointment" element={<Appointment />} />
        <Route path="/symptom" element={<SymptomsChecker />} />
        <Route path="/viewAppointments" element={<ViewAppointments/>} />
        <Route path="/bookingPanel/:doctorId" element={<BookingPanel />} />
      </Routes>
    </Router>

  );
}

export default App;
