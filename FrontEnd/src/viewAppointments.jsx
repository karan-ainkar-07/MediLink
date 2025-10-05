import React, { useEffect, useState } from "react";
import axios from "axios";
import {backendUrl} from "./constants"

export default function ViewAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await axios.get(`${backendUrl}/userProfile/view-appointments`, {
          withCredentials: true
        });
        setAppointments(res.data.data.appointments || null);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  if (loading) return <p>Loading appointments...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  console.log(appointments);
  return (
    <h1>hello</h1>
  );
}
