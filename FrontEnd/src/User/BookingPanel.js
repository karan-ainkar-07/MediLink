import React, { useState, useEffect } from "react";
import { Calendar, MapPin, User } from "lucide-react";
import "./bookingPanel.css";
import axios from "axios";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { backendUrl } from "../constants";

export default function BookingPanel() {

  const { doctorId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const bookingDate = location.state?.date;

  const [doctor, setDoctor] = useState(null);
  const [couponStats, setCouponStats] = useState(null);
  const [selectedStartTime, setSelectedStartTime] = useState(null);
  const [loading, setLoading] = useState(false);

  /*
  ------------------------
  FETCH DOCTOR
  ------------------------
  */

  useEffect(() => {
    if (!doctorId) return;

    const fetchDoctor = async () => {
      try {
        const res = await axios.get(`${backendUrl}/userProfile/get-doctor`, {
          params: { doctorId },
        });

        setDoctor(res.data.data);

      } catch (err) {
        console.error("Doctor fetch failed:", err);
      }
    };

    fetchDoctor();
  }, [doctorId]);


  /*
  ------------------------
  FETCH COUPONS
  ------------------------
  */

  useEffect(() => {
    if (!doctorId || !bookingDate) return;

    const fetchCoupons = async () => {
      try {
        const res = await axios.get(
          `${backendUrl}/userProfile/get-coupon-stats`,
          {
            params: { doctorId, dateStr: bookingDate },
            withCredentials: true,
          }
        );

        setCouponStats(res.data.data);
        console.log(res.data.data);

      } catch (err) {
        console.error("Coupon fetch failed:", err);
      }
    };

    fetchCoupons();
  }, [doctorId, bookingDate]);


  /*
  ------------------------
  BOOK APPOINTMENT
  ------------------------
  */

  const bookAppointment = async () => {

    if (!selectedStartTime) return;

    const selectedCoupon = availableCoupons.find(
      c => c.startTime === selectedStartTime
    );

    if (!selectedCoupon) return;

    setLoading(true);

    try {

      const res = await axios.post(
        `${backendUrl}/userProfile/book-appointment`,
        {
          doctorId,
          date: bookingDate,
          time: selectedCoupon.startTime,
          couponNumber: selectedCoupon.couponNumber
        },
        { withCredentials: true }
      );

      alert(res.data.message);
      navigate("/dashboard");

    } catch (err) {
      console.error(err);
      alert("Booking failed");
    } finally {
      setLoading(false);
    }
  };


  /*
  ------------------------
  DERIVED DATA
  ------------------------
  */

  const availableCoupons = couponStats?.availableCoupons || [];

  const totalAvailableSlots =
    availableCoupons.filter(c => c.available).length;


  /*
  ------------------------
  LOADING STATES
  ------------------------
  */

  if (!doctor) return <p>Loading doctor details...</p>;
  if (!couponStats) return <p>Loading slots...</p>;


  /*
  ------------------------
  UI
  ------------------------
  */

  return (
    <div className="dashboard-container">

      <div className="booking-header">
        <h1>Booking Panel</h1>

        <div className="top-section">

          <div className="doctor-image">
            {doctor.profileImage
              ? <img src={doctor.profileImage} alt={doctor.email} />
              : <User size={48} />
            }
          </div>

          <div className="doctor-profile">
            <h2>{doctor.email}</h2>
            <p className="speciality">{doctor.specialization || "N/A"}</p>
            <p className="experience">{doctor.experience || 0}+ years experience</p>

            <p className="qualification">
              {doctor.education
                ?.map(ed => `${ed.degree} (${ed.university}, ${ed.year})`)
                .join(", ") || "N/A"}
            </p>

            <div className="location">
              <MapPin size={16} /> {doctor.address?.line1 || "N/A"}
            </div>
          </div>

          <div className="appointment-info">
            <h3>Appointment</h3>
            <p className="fees">₹{doctor.rate || 600}</p>
          </div>

        </div>
      </div>



      <div className="booking-slots">

        <h2>Available Slots ({bookingDate})</h2>
        <p>Total Available Slots: {totalAvailableSlots}</p>

        <div className="slots-container">
          <div className="time-slots">

            {availableCoupons.map((coupon) => {

              const isDisabled = !coupon.available;

              return (
                <button
                  key={coupon.startTime}
                  disabled={isDisabled || loading}
                  onClick={() => setSelectedStartTime(coupon.startTime)}
                  className={
                    selectedStartTime === coupon.startTime
                      ? "selected"
                      : isDisabled
                        ? "disabled-slot"
                        : ""
                  }
                >
                  {coupon.displayTime}
                </button>
              );

            })}

          </div>
        </div>
      </div>



      <div className="bottom-section">

        <button
          className="schedule-btn"
          disabled={!selectedStartTime || loading}
          onClick={bookAppointment}
        >
          {loading
            ? "Booking..."
            : <><Calendar size={20} /> Schedule Appointment</>
          }
        </button>

        {selectedStartTime && (
          <div className="selected-info">
            Selected at {
              availableCoupons.find(c => c.startTime === selectedStartTime)?.displayTime
            } on {bookingDate}
          </div>
        )}

      </div>

    </div>
  );
}