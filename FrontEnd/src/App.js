import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./User/Dashboard";
import Auth from "./User/Auth"
import Appointment from "./User/Appointment";
import SymptomsChecker from "./User/SymptomChecker";
import BookingPanel from "./User/BookingPanel";
import SignUp from "./User/userSignUp";
import VerifyOTP from "./User/verifyOtp";
import ClinicSignup from "./Doctor/ClinicRegister";
import LoginClinic from "./Doctor/clinicLogin";
import DoctorRegistration from "./Doctor/doctorSingup";
import ViewBookedAppointments from "./User/viewBookedAppointments"
import ViewPastAppointments from "./User/pastAppointments";
import DoctorPrescriptionForm from "./Doctor/DoctorForm";
import DoctorDashboard from "./Doctor/DoctorDashboard";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Auth/> } />
        <Route path="/doctorDashboard" element={<DoctorDashboard/> } />
        <Route path="/prescription" element={<DoctorPrescriptionForm/>}/>
        <Route path="/clinic-signUp" element={<ClinicSignup/>}/>
        <Route path="/clinic-signIn" element={<LoginClinic/>}/>
        <Route path="/doctor-signUp" element={<DoctorRegistration/>} />
        <Route path="/signUp" element={<SignUp/>}/>
        <Route path="/verifyOTP" element={<VerifyOTP/>}/>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/appointment" element={<Appointment />} />
        <Route path="/symptom" element={<SymptomsChecker />} />
        <Route path="/viewAppointments" element={<ViewBookedAppointments/>} />
        <Route path="/PastAppointments" element={<ViewPastAppointments/>} />
        <Route path="/bookingPanel/:doctorId" element={<BookingPanel />} />
      </Routes>
    </Router>

  );
}

export default App;
