import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './admin.module.css';
function Admin() {
  const [reservations, setReservations] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState(null);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
    
      try {
        const [reservationsResponse, usersResponse] = await Promise.all([
          axios.get('http://localhost:3001/api/admin/reservations', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:3001/api/admin/users', {
            headers: { Authorization: `Bearer ${token}` }
          }),
        ]);
    
        setReservations(Array.isArray(reservationsResponse.data) ? reservationsResponse.data : []);
        setUsers(Array.isArray(usersResponse.data) ? usersResponse.data : []);
      } catch (error) {
        setError('Failed to fetch data. Please try again later.');
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDateTime = (date, time) => {
    if (!date || !time) return '';
    const dateObj = new Date(date);
    const [hours, minutes] = time.split(':').map(Number);
    dateObj.setHours(hours, minutes);
    return `${dateObj.toLocaleDateString()} at ${dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const calculateDuration = (startDate, startTime, endDate, endTime) => {
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
  
      if (durationHrs > 0) {
        if (durationMins > 0) {
          return `${durationHrs} hour(s) and ${durationMins} minute(s)`;
        }
        return `${durationHrs} hour(s)`;
      }
  
      if (durationMins > 0) {
        return `${durationMins} minute(s)`;
      }
  
      return '0 minutes';
    }
    return '';
  };

  const getUserById = (userId) => {
    const user = users.find(user => user._id === userId);
    return user ? user.username : 'Unknown';
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className={styles.errorMessage}>{error}</div>;

  const ConfirmationDialog = ({ visible, onConfirm, onCancel, itemType }) => {
    if (!visible) return null;
  
    return (
      <div className={styles.confirmationDialog}>
        <div className={styles.confirmationDialogContent}>
          <p>Are you sure you want to delete this {itemType}?</p>
          <button onClick={onConfirm} className={`${styles.confirmationDialogButton} ${styles.confirm}`}>
            Yes
          </button>
          <button onClick={onCancel} className={`${styles.confirmationDialogButton} ${styles.cancel}`}>
            No
          </button>
        </div>
      </div>
    );
  };
  
  const handleDeleteClick = (id, type) => {
    setItemToDelete(id);
    setDeleteType(type);
    setShowConfirmDialog(true);
  };
  
  const cancelDelete = () => {
    setShowConfirmDialog(false);
    setItemToDelete(null);
    setDeleteType(null);
  };
  
  const SuccessNotification = ({ visible, message, onClose }) => {
    if (!visible) return null;
  
    return (
      <div className={styles.successNotification}>
        <div className={styles.notificationContent}>
          <p>{message}</p>
          <button onClick={onClose} className={styles.okButton}>OK</button>
        </div>
      </div>
    );
  }; 
  
  const confirmDelete = async () => {
    const token = localStorage.getItem('token');
  
    try {
      if (deleteType === 'reservation') {
        await axios.delete(`http://localhost:3001/api/admin/reservations/${itemToDelete}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setReservations(reservations.filter(reservation => reservation._id !== itemToDelete));
        setNotificationMessage('Reservation deletion completed');
      } else if (deleteType === 'user') {
        await axios.delete(`http://localhost:3001/api/admin/users/${itemToDelete}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(users.filter(user => user._id !== itemToDelete));
        setNotificationMessage('User deletion completed');
      }
      setShowSuccessNotification(true);
    } catch (error) {
      console.error(`Error deleting ${deleteType}:`, error);
      setError(`Failed to delete ${deleteType}. Please try again later.`);
    } finally {
      setShowConfirmDialog(false);
      setItemToDelete(null);
      setDeleteType(null);
    }
  };  
  
  const closeNotification = () => {
    setShowSuccessNotification(false);
    setNotificationMessage('');
  };  

  return (
    <div className={styles.adminDashboard}>
      <h1>Admin Dashboard</h1>
  
      <div className={styles.adminContent}>
        <div className={styles.reservationsList}>
          <h2>VM Reservations</h2>
          <table className={styles.adminTable}>
            <thead>
              <tr>
                <th>ID</th>
                <th>VM Name</th>
                <th>Username</th>
                <th>Status</th>
                <th className={styles.startDate}>Start Date</th>
                <th className={styles.endDate}>End Date</th>
                <th>Duration</th>
                <th>Date Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((reservation) => (
                <tr key={reservation._id}>
                  <td>{reservation._id}</td>
                  <td>{reservation.vmName}</td>
                  <td>{getUserById(reservation.userId)}</td>
                  <td>{reservation.status}</td>
                  <td className={styles.startDate}>{formatDateTime(reservation.startDate, reservation.startTime)}</td>
                  <td className={styles.endDate}>{formatDateTime(reservation.endDate, reservation.endTime)}</td>
                  <td>{calculateDuration(reservation.startDate, reservation.startTime, reservation.endDate, reservation.endTime)}</td>
                  <td>{new Date(reservation.date).toLocaleDateString()}</td>
                  <td>
                    <button
                      onClick={() => handleDeleteClick(reservation._id, 'reservation')}
                      className={styles.deleteButton}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
  
        <div className={styles.usersList}>
          <h2>Users</h2>
          <table className={styles.adminTable}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Status</th>
                <th>Actions</th> 
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user._id}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.status}</td>
                  <td>
                    <button
                      onClick={() => handleDeleteClick(user._id, 'user')}
                      className={styles.deleteButton}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
  
      <ConfirmationDialog
        visible={showConfirmDialog}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        itemType={deleteType}
      />
  
      <SuccessNotification
        visible={showSuccessNotification}
        message={notificationMessage}
        onClose={closeNotification}
      />
    </div>
  );
}

export default Admin;
