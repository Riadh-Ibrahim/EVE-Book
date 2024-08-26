import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import TimePicker from 'react-time-picker';
import { FaClock } from 'react-icons/fa';
import 'react-calendar/dist/Calendar.css';
import 'react-time-picker/dist/TimePicker.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import homeImage from '../assets/home.jpg';
import Navbar from '../Components/Navbar/navbar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Home() {
  const [step, setStep] = useState(1);
  const [startDate, setStartDate] = useState(new Date());
  const [startTime, setStartTime] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [alertMessage, setAlertMessage] = useState('');
  const [data, setData] = useState(null);
  const [apiError, setApiError] = useState(null);
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
      // Handle the case where newTime is null
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
    // Handle the case where newTime is null
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

      return `${durationHrs} hour(s) and ${durationMins} minute(s);`;
    }
    return '';
  };

  const duration = calculateDuration();

  const executeAnsibleScript = async () => {
    const reservationData = {
        startDate,
        startTime,
        endDate,
        endTime,
    };

    try {
        // Save the reservation and execute the Ansible script
        const response = await fetch('http://localhost:3001/api/execute-ansible', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify(reservationData),
        });

        const result = await response.json();

        if (result.success) {
            alert(result.message);
        } else {
            setAlertMessage(result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        setAlertMessage('An error occurred while processing your reservation.');
    }
};

  const backgroundContainerStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundImage: `url(${homeImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    filter: 'blur(8px)',
    zIndex: -1,
  };

  const contentContainerStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    padding: '40px 30px',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '12px',
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
    maxWidth: '700px',
    width: '90%',
    textAlign: 'center',
  };

  const calendarWrapperStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    border: '1px solid #dee2e6',
    borderRadius: '10px',
    padding: '20px',
    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
    margin: 'auto',
  };

  const headingStyle = {
    fontFamily: "'Poppins', sans-serif",
    color: '#333',
    fontSize: '2rem',
    fontWeight: '600',
    marginBottom: '20px',
  };

  const buttonStyle = {
    marginTop: '20px',
    backgroundColor: '#0062cc',
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
    color: '#0062cc',
    verticalAlign: 'middle',
  };

  const alertStyle = {
    color: '#cc0000',
    fontWeight: 'bold',
    marginTop: '20px',
  };              

  return (
    <div style={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>
      <Navbar /> {/* Include the Navbar here */}
      {/* Blurred background container */}
      <div style={backgroundContainerStyle} />

      {/* Content container */}
      <div style={contentContainerStyle}>
        <h2 style={headingStyle}>
          Select Your VM Reservation Date
        </h2>
        <div style={calendarWrapperStyle}>
          {step === 1 && (
            <div className="mb-4">
              <h4>Start Date and Time <FaClock style={clockIconStyle} /></h4>
              <Calendar
                onChange={handleStartDateChange}
                value={startDate}
                minDate={new Date()} // Allow choosing today as start date
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
                    onClick={executeAnsibleScript}
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
      </div>
    </div>
  );
}

export default Home;
