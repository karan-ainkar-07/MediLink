import React, { useState } from 'react';
import { Calendar, MapPin, Clock, User } from 'lucide-react';
import './bookingPanel.css';

export default function BookingPanel() {
  const [selectedTimeOfDay, setSelectedTimeOfDay] = useState('MORNING');
  const [selectedTime, setSelectedTime] = useState('');

  const timePeriods = ['MORNING', 'AFTERNOON', 'EVENING'];

  const allTimeSlots = {
    MORNING: ['8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM'],
    AFTERNOON: ['12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM'],
    EVENING: ['4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM', '6:00 PM']
  };

  const timeSlots = allTimeSlots[selectedTimeOfDay];

  return (
    <div className="dashboard-container">
      <div className="booking-header">
        <h1>Booking Panel</h1>
        <div className="top-section">
          <div className="doctor-image"><User size={48} /></div>
          <div className="doctor-profile">
            <h2>Dr. Swati D</h2>
            <p className="speciality">General Physician</p>
            <p className="experience">6+ years experience</p>
            <p className="qualification">MBBS, MD General physician</p>
            <div className="location"><MapPin size={16} /> Mumbai, Maharashtra</div>
          </div>
          <div className="appointment-info">
            <h3>General Physician Appointment</h3>
            <p className="fees">$600</p>
            <p className="fee-label">Consultation Fee</p>
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
                <p className="value">26</p>
                <p className="label">Total Booking</p>
              </div>
              <div className="stat-card">
                <p className="value orange">10</p>
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
        <button className="schedule-btn" disabled={!selectedTime}>
          <Calendar size={20} /> Schedule Appointment
        </button>
        {selectedTime && <div className="selected-info">Selected: {selectedTimeOfDay} at {selectedTime}</div>}
      </div>
    </div>
  );
}