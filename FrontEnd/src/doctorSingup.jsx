import React, { useState } from "react";
import axios from "axios";
import { backendUrl } from "./constants";

const DoctorRegistration = () => {
  const [search, setSearch] = useState({ name: "", city: "" });
  const [clinics, setClinics] = useState([]);
  const [formData, setFormData] = useState({
    email: "",
    mobileNo: "",
    password: "",
    education: [{ degree: "", university: "", year: "" }],
    specialization: "General Practitioner",
    profileImage: null, // store file object
    clinic: "",
  });

  // Search clinics by name or city
  const handleSearch = async () => {
    try {
      const query = `?name=${search.name}&city=${search.city}`;
      const res = await axios.get(`${backendUrl}/clinic/get-clinic${query}`);
      setClinics(res.data?.data);
    } catch (err) {
      console.error(err);
      alert("Error fetching clinics");
    }
  };

  // Handle form input change
  const handleChange = (e, index, field) => {
    if (field === "education") {
      const newEducation = [...formData.education];
      newEducation[index][e.target.name] = e.target.value;
      setFormData({ ...formData, education: newEducation });
    } else if (e.target.name === "profileImage") {
      setFormData({ ...formData, profileImage: e.target.files[0] }); // file
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const addEducation = () => {
    setFormData({
      ...formData,
      education: [...formData.education, { degree: "", university: "", year: "" }],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = new FormData();
      submitData.append("email", formData.email);
      submitData.append("mobileNo", formData.mobileNo);
      submitData.append("password", formData.password);
      submitData.append("specialization", formData.specialization);
      submitData.append("clinic", formData.clinic);

      if (formData.profileImage) {
        submitData.append("profileImage", formData.profileImage);
      }

      submitData.append("educationString", JSON.stringify(formData.education));

      await axios.post(`${backendUrl}/doctor/signUp`, submitData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Doctor registered successfully!");
    } catch (err) {
      console.error(err);
      alert("Error registering doctor");
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-lg">
      <h2 className="text-2xl font-bold mb-4">Doctor Registration</h2>

      {/* Search clinics */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Clinic Name"
          value={search.name}
          onChange={(e) => setSearch({ ...search, name: e.target.value })}
          className="border p-2 flex-1"
        />
        <input
          type="text"
          placeholder="City"
          value={search.city}
          onChange={(e) => setSearch({ ...search, city: e.target.value })}
          className="border p-2 flex-1"
        />
        <button
          type="button"
          onClick={handleSearch}
          className="bg-blue-500 text-white p-2"
        >
          Search Clinics
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Clinic Selection Dropdown */}
        <div>
          <label>Select Clinic</label>
          <select
            name="clinic"
            value={formData.clinic}
            onChange={handleChange}
            required
            className="border p-2 w-full"
          >
            <option value="">-- Select Clinic --</option>
            {clinics.map((clinic) => (
              <option key={clinic._id} value={clinic._id}>
                {clinic.name} ({clinic.address.city})
              </option>
            ))}
          </select>
        </div>

        {/* Email */}
        <div>
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="border p-2 w-full"
          />
        </div>

        {/* Mobile Number */}
        <div>
          <label>Mobile Number</label>
          <input
            type="text"
            name="mobileNo"
            value={formData.mobileNo}
            onChange={handleChange}
            required
            className="border p-2 w-full"
          />
        </div>

        {/* Password */}
        <div>
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="border p-2 w-full"
          />
        </div>

        {/* Education */}
        <div>
          <label>Education</label>
          {formData.education.map((edu, index) => (
            <div key={index} className="space-y-2 mb-2 border p-2">
              <input
                type="text"
                name="degree"
                placeholder="Degree"
                value={edu.degree}
                onChange={(e) => handleChange(e, index, "education")}
                required
                className="border p-1 w-full"
              />
              <input
                type="text"
                name="university"
                placeholder="University"
                value={edu.university}
                onChange={(e) => handleChange(e, index, "education")}
                required
                className="border p-1 w-full"
              />
              <input
                type="number"
                name="year"
                placeholder="Year"
                value={edu.year}
                onChange={(e) => handleChange(e, index, "education")}
                required
                className="border p-1 w-full"
              />
            </div>
          ))}
          <button type="button" onClick={addEducation} className="bg-blue-500 text-white p-2">
            Add Another Degree
          </button>
        </div>

        {/* Specialization */}
        <div>
          <label>Specialization</label>
          <select
            name="specialization"
            value={formData.specialization}
            onChange={handleChange}
            required
            className="border p-2 w-full"
          >
            <option value="Dentist">Dentist</option>
            <option value="Dermatology">Dermatology</option>
            <option value="Pediatrics">Pediatrics</option>
            <option value="General Practitioner">General Practitioner</option>
          </select>
        </div>

        {/* Profile Image */}
        <div>
          <label>Profile Image</label>
          <input
            type="file"
            name="profileImage"
            accept="image/*"
            onChange={handleChange}
            required
            className="border p-2 w-full"
          />
        </div>

        <button
          type="submit"
          className="bg-green-500 text-white p-2 w-full font-bold mt-4"
        >
          Register Doctor
        </button>
      </form>
    </div>
  );
};

export default DoctorRegistration;
