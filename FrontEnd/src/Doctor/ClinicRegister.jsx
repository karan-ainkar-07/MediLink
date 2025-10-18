import React, { useState } from "react";
import axios from "axios";
import { backendUrl } from "../constants";

export default function ClinicSignup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    mobileNo: "",
    addressLine1: "",
    city: "",
    country: "",
    localLogo: null
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    if (e.target.name === "localLogo") {
      setFormData({ ...formData, localLogo: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const payload = new FormData();
      payload.append("name", formData.name);
      payload.append("email", formData.email);
      payload.append("password", formData.password);
      payload.append("mobileNo", formData.mobileNo);
      payload.append("addressLine1", formData.addressLine1);
      payload.append("city", formData.city);
      payload.append("country", formData.country);

      if (formData.localLogo) {
        payload.append("localLogo", formData.localLogo);
      }


      await axios.post(`${backendUrl}/clinic/signUp`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage("Clinic registered successfully!");
      setFormData({
        name: "",
        email: "",
        password: "",
        mobileNo: "",
        addressLine1: "",
        city: "",
        country: "",
        localLogo: null
      });
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.error || "Something went wrong");
    }

    setLoading(false);
  };

  return (
    <div className="clinic-signup-container">
      <h2>Clinic Signup</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="Clinic Name" value={formData.name} onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
        <input type="text" name="mobileNo" placeholder="Mobile Number" value={formData.mobileNo} onChange={handleChange} required />
        <input type="text" name="addressLine1" placeholder="Address Line 1" value={formData.addressLine1} onChange={handleChange} required />
        <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleChange} required />
        <input type="text" name="country" placeholder="Country" value={formData.country} onChange={handleChange} required />
        <input type="file" name="localLogo" onChange={handleChange} />
        <button type="submit" disabled={loading}>{loading ? "Registering..." : "Signup"}</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}
