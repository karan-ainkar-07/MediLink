import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, User } from 'lucide-react';
import './bookingPanel.css';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { backendUrl } from '../constants';

export default function BookingPanel() {
  const {doctorId} = useParams();
  const [selectedTimeOfDay, setSelectedTimeOfDay] = useState('MORNING');
  const [selectedTime, setSelectedTime] = useState('');
  const [doctor, setDoctor] = useState(null);
  const [couponStats,setCouponStats] = useState(null);
  const [clinicId,setClinicId] = useState(null);
  const [queue,setQueue] = useState(null);
  const bookAppointment=async()=>{
    console.log(queue);
    const response= await axios.post(`${backendUrl}/userProfile/book-appointment`,
    {
      queue
    },
    {
      withCredentials:true,
    }
  );
    alert(response.data.message);
  }

  useEffect(() => {
    if (!doctorId) return;

    const fetchDoctor = async () => {
      try {
        const response = await axios.get(`${backendUrl}/userProfile/get-doctor`,{
          params:{doctorId}
        });
        setDoctor(response.data.data);
        setClinicId(response.data.data.clinic._id);
      } catch (error) {
        console.error('Error fetching doctor:', error);
      }
    };

    fetchDoctor();
  }, [doctorId]);


  useEffect(() => {
    const fetchCouponStats = async () => {
      try {
        const res = await axios.get(`${backendUrl}/userProfile/get-coupon-stats`, {
          params: { doctorId, clinicId },
        });
        setCouponStats(res.data.data);
        setQueue(res.data.data.queue);
      } catch (err) {
        console.error(err);
      }
    };

    if (doctorId && clinicId) 
    {
      fetchCouponStats();
    }
  }, [doctorId, clinicId]);

  useEffect(() => {
  console.log('couponStats updated:', couponStats);
}, [couponStats]);

  const timePeriods = ['MORNING', 'AFTERNOON', 'EVENING'];

  const allTimeSlots = {
    MORNING: ['8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM'],
    AFTERNOON: ['12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM'],
    EVENING: ['4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM', '6:00 PM']
  };

  const timeSlots = allTimeSlots[selectedTimeOfDay];

  if (!doctor) return <p>Loading doctor details...</p>;

  return (
    <div className="dashboard-container">
      <div className="booking-header">
        <h1>Booking Panel</h1>
        <div className="top-section">
          <div className="doctor-image">
            {doctor.profileImage ? <img src={doctor.profileImage} alt={doctor.email} /> : <User size={48} />}
          </div>
          <div className="doctor-profile">
            <h2>{doctor.email}</h2>
            <p className="speciality">{doctor.specialization.join(', ')}</p>
            <p className="experience">{doctor.experience}+ years experience</p>
            <p className="qualification">
              {doctor.education?.map(ed => `${ed.degree} (${ed.university}, ${ed.year})`).join(', ')}
            </p>
            <div className="location"><MapPin size={16} /> {doctor.address || 'N/A'}</div>
          </div>
          <div className="appointment-info">
            <h3>Appointment</h3>
            <p className="fees">₹{doctor.rate || 600}</p>
            <p className="fee-label">Total Bookings</p>
          </div>
        </div>
      </div>

      <div className="booking-slots">
        <h2>Booking Slots</h2>
        <div className="slots-container">
          <div className="time-section">
            <div className="time-of-day">
              {timePeriods.map(period => (
                <button
                  key={period}
                  onClick={() => setSelectedTimeOfDay(period)}
                  className={selectedTimeOfDay === period ? 'active' : ''}
                >
                  {period}
                </button>
              ))}
            </div>

            <div className="stats">
              <div className="stat-card">
                <p className="value">{couponStats?.totalCoupons || 0}</p>
                <p className="label">Total Booking</p>
              </div>
              <div className="stat-card">
                <p className="value orange">{couponStats?.currentCoupon || 0}</p>
                <p className="label">Current Token</p>
              </div>
            </div>

            <div className="time-slots">
              {timeSlots.map(time => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={selectedTime === time ? 'selected' : ''}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bottom-section">
        <button className="schedule-btn" disabled={!selectedTime} onClick={bookAppointment}>
          <Calendar size={20} /> Schedule Appointment
        </button>
        {selectedTime && <div className="selected-info">Selected: {selectedTimeOfDay} at {selectedTime}</div>}
      </div>
    </div>
  );
}
