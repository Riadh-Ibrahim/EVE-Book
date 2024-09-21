import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './loading.module.css'; // Import CSS Module
import Navbar from '../../Components/Navbar/navbar'; // Adjust the path as needed

const Loading = () => {
  const [loading, setLoading] = useState(true);
  const [confirmation, setConfirmation] = useState(false);
  const [error, setError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const reservationData = location.state?.reservationData;

  useEffect(() => {
    const createVm = async () => {
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

        if (result.success) {
          setLoading(false);
          setConfirmation(true);
        } else {
          setLoading(false);
          setError(result.message || 'Failed to create VM.');
        }
      } catch (error) {
        console.error('Error:', error);
        setLoading(false);
        setError('An error occurred while creating your VM.');
      }
    };

    if (reservationData) {
      createVm();
    }
  }, [reservationData]);

  return (
    <div>
      <Navbar /> {/* Include the Navbar here */}
      <div className={styles.container}>
        {loading && (
          <div className={styles.loadingContainer}>
            <div className={styles.loader}></div>
            <p className={styles.largeText}>Loading...</p>
            <p className={styles.largeText}>Please wait! Your VM is being created...</p>
          </div>
        )}
        {error && !loading && (
          <div className={styles.confirmationContainer}>
            <h1>Creation Failed</h1>
            <p className={styles.largeText}>{error}</p>
            <button className={styles.homeButton} onClick={() => navigate('/home')}>
              Go Back to Home
            </button>
          </div>
        )}
        {confirmation && !loading && (
          <div className={styles.confirmationContainer}>
            <h1>Reservation Confirmed</h1>
            <p className={styles.largeText}>Your VM reservation has been successfully created.</p>
            <p className={styles.largeText}>An email with SSH parametres has been sent !</p>
            <button className={styles.homeButton} onClick={() => navigate('/home')}>
              Go Back to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Loading;
