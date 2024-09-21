import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import TimePicker from 'react-time-picker';
import { FaClock, FaMoon, FaSun } from 'react-icons/fa'; // Added icons for theme toggle
import 'react-calendar/dist/Calendar.css';
import 'react-time-picker/dist/TimePicker.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import homeImage from '../assets/home.jpg';
import homeImage1 from '../assets/home1.jpg';
import Navbar from '../Components/Navbar/navbar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Home() {
  const [step, setStep] = useState(1);
  const [startDate, setStartDate] = useState(new Date());
  const [startTime, setStartTime] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [vmName, setVmName] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [data, setData] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [isDarkTheme, setIsDarkTheme] = useState(false); // New state for theme
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    axios.get('/api/home', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => {
      setData(response.data);
    })
    .catch(error => {
      setApiError('Failed to load data from server.');
      console.error('There was an error fetching data!', error);
    });
  }, [navigate]);

  const currentTime = new Date();
  const isToday = startDate.toDateString() === currentTime.toDateString();

  const handleStartDateChange = (newDate) => {
    setStartDate(newDate);
    setStartTime(null);
    setAlertMessage('');
  };

  const handleStartTimeChange = (newTime) => {
    if (newTime === null) {
      setStartTime(null);
      setAlertMessage('');
      return;
    }

    const selectedHour = parseInt(newTime.split(':')[0], 10);
    if (isToday && selectedHour <= currentTime.getHours()) {
      setAlertMessage('Start time must be after the current hour.');
      setStartTime(null);
    } else {
      setStartTime(newTime);
      setAlertMessage('');
    }
  };

  const handleEndDateChange = (newDate) => {
    if (newDate < startDate) {
      setAlertMessage('End date cannot be before the start date.');
      setEndDate(null);
      setEndTime(null);
    } else {
      setEndDate(newDate);
      setAlertMessage('');
    }
  };

  const handleEndTimeChange = (newTime) => {
    if (newTime === null) {
      setEndTime(null);
      setAlertMessage('');
      return;
    }

    if (endDate && new Date(endDate).toDateString() === new Date(startDate).toDateString() && newTime <= startTime) {
      setAlertMessage('End time must be after the start time.');
      setEndTime(null);
      setEndDate(null);
    } else {
      setEndTime(newTime);
      setAlertMessage('');
    }
  };

  const handleNextStep = () => {
    if (!startTime) {
      setAlertMessage('Please select a valid start time.');
      return;
    }
    setStep(2);
    setAlertMessage('');
  };

  const handlePreviousStep = () => {
    setStep(1);
  };

  const handleVmNameChange = (event) => {
    setVmName(event.target.value);
  };

  const calculateDuration = () => {
    if (startDate && startTime && endDate && endTime) {
      const start = new Date(startDate);
      const [startHour, startMinute] = startTime.split(':').map(Number);
      start.setHours(startHour, startMinute);
  
      const end = new Date(endDate);
      const [endHour, endMinute] = endTime.split(':').map(Number);
      end.setHours(endHour, endMinute);
  
      const durationMs = end - start;
      if (durationMs <= 0) return 'Invalid duration';
  
      const durationHrs = Math.floor(durationMs / (1000 * 60 * 60));
      const durationMins = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
  
      if (durationHrs > 0 && durationMins > 0) {
        return `${durationHrs} hour(s) and ${durationMins} minute(s)`;
      }
      if (durationHrs > 0) {
        return `${durationHrs} hour(s)`;
      }
      if (durationMins > 0) {
        return `${durationMins} minute(s)`;
      }
      return '0 minutes';
    }
    return '';
  };
  
  const duration = calculateDuration();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!vmName) {
      setAlertMessage('Please enter a VM name.');
      return;
    }
  
    if (isSubmitting) return; // Prevent multiple submissions
  
    setIsSubmitting(true); // Set submitting state to true
  
    const reservationData = {
      vmName,
      status: 'Pending',
      startDate,
      startTime,
      endDate,
      endTime,
      duration,
    };
  
    // Redirect to loading page
    navigate('/loading', { state: { reservationData } });
  
    try {
      const response = await fetch('http://localhost:3001/api/execute-ansible', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(reservationData),
      });
  
      const result = await response.json();
  
      if (!result.success) {
        setAlertMessage(result.message);
      }
    } catch (error) {
      console.error('Error:', error);
      setAlertMessage('An error occurred while processing your reservation.');
    } finally {
      setIsSubmitting(false); // Reset submitting state
    }
  };  

  const backgroundContainerStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundImage: `url(${isDarkTheme ? homeImage1 : homeImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    filter: 'blur(8px)',
    zIndex: -1,
    backgroundColor: isDarkTheme ? '#333' : '#fff', // Background color based on theme
  };

  const contentContainerStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    padding: '40px 30px',
    backgroundColor: isDarkTheme ? 'rgba(50, 50, 50, 0.95)' : 'rgba(255, 255, 255, 0.95)', // Adjust based on theme
    borderRadius: '12px',
    boxShadow: isDarkTheme ? '0 8px 16px rgba(0, 0, 0, 0.8)' : '0 8px 16px rgba(0, 0, 0, 0.2)', // Adjust shadow based on theme
    maxWidth: '700px',
    width: '90%',
    textAlign: 'center',
  };

  const calendarWrapperStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: isDarkTheme ? '#444' : '#f8f9fa', // Background color based on theme
    border: isDarkTheme ? '1px solid #555' : '1px solid #dee2e6', // Border color based on theme
    borderRadius: '10px',
    padding: '20px',
    boxShadow: isDarkTheme ? '0 6px 12px rgba(0, 0, 0, 0.5)' : '0 6px 12px rgba(0, 0, 0, 0.15)', // Adjust shadow based on theme
    margin: 'auto',
  };

  const headingStyle = {
    fontFamily: "'Poppins', sans-serif",
    color: isDarkTheme ? '#ddd' : '#333', // Text color based on theme
    fontSize: '2rem',
    fontWeight: '600',
    marginBottom: '20px',
  };

  const buttonStyle = {
    marginTop: '20px',
    backgroundColor: isDarkTheme ? '#444' : '#0062cc', // Button color based on theme
    color: '#fff',
    borderRadius: '50px',
    padding: '10px 30px',
    fontFamily: "'Poppins', sans-serif",
    transition: 'background-color 0.6s ease, transform 0.6s ease',
    transform: 'scale(1)',
    border: 'none',
    cursor: 'pointer',
  };

  const clockIconStyle = {
    marginLeft: '10px',
    color: isDarkTheme ? '#ddd' : '#0062cc', // Icon color based on theme
    verticalAlign: 'middle',
  };

  const alertStyle = {
    color: '#cc0000',
    fontWeight: 'bold',
    marginTop: '20px',
  };

  // Toggle theme function
  const toggleTheme = () => {
    setIsDarkTheme(prevTheme => !prevTheme);
  };

  return (
    <div style={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>
      <Navbar />
      <div style={backgroundContainerStyle} />
      <style>
        {`
          /* Ensure the navigation arrows are black */
          .react-calendar__navigation button {
            color: black !important;
          }
        `}
      </style>
      <div style={contentContainerStyle}>
        <h2 style={headingStyle}>Select Your VM Reservation Date</h2>
        <div style={calendarWrapperStyle}>
          {step === 1 && (
            <div className="mb-4">
              <h4>Start Date and Time <FaClock style={clockIconStyle} /></h4>
              <Calendar
                onChange={handleStartDateChange}
                value={startDate}
                minDate={new Date()}
              />
              <div className="mt-3">
                <TimePicker
                  onChange={handleStartTimeChange}
                  value={startTime}
                  disableClock
                  format="HH:mm"
                  minTime={`${currentTime.getHours() + 1}:00`}
                />
              </div>
              {startTime && (
                <button
                  style={buttonStyle}
                  onClick={handleNextStep}
                >
                  Next
                </button>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="mb-4">
              <h4>End Date and Time <FaClock style={clockIconStyle} /></h4>
              <Calendar
                onChange={handleEndDateChange}
                value={endDate}
                minDate={startDate}
              />
              <div className="mt-3">
                <TimePicker
                  onChange={handleEndTimeChange}
                  value={endTime}
                  disableClock
                  format="HH:mm"
                />
              </div>
              <div className="mt-3">
                <input
                  type="text"
                  value={vmName}
                  onChange={handleVmNameChange}
                  placeholder="Enter VM Name"
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '5px',
                    border: isDarkTheme ? '1px solid #555' : '1px solid #ccc', // Border color based on theme
                  }}
                />
              </div>
              {endDate && endTime && (
                <div>
                  <p>Duration: {duration}</p>
                  <button
                    style={buttonStyle}
                    onClick={handlePreviousStep}
                  >
                    Back
                  </button>
                  <button
                    style={buttonStyle}
                    onClick={handleConfirm}
                  >
                    Confirm
                  </button>
                </div>
              )}
            </div>
          )}

          {alertMessage && (
            <div style={alertStyle}>{alertMessage}</div>
          )}
        </div>

        {/* Theme toggle button */}
        <button
          onClick={toggleTheme}
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            backgroundColor: isDarkTheme ? '#555' : '#ddd',
            color: isDarkTheme ? '#fff' : '#000',
            border: 'none',
            borderRadius: '50%',
            padding: '10px',
            cursor: 'pointer',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
          }}
        >
          {isDarkTheme ? <FaSun /> : <FaMoon />}
        </button>
      </div>
    </div>
  );
}

export default Home;
