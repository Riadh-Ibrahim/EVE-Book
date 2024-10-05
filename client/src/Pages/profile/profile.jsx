import React, { useState, useEffect } from 'react';
import Navbar from '../../Components/Navbar/navbar';
import './profile.css';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function Profile() {
  const [username, setUsername] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isEditing, setIsEditing] = useState({
    username: false,
    oldPassword: false,
    newPassword: false,
    email: false,
  });
  const [oldPasswordValid, setOldPasswordValid] = useState(false);
  const [userId, setUserId] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [currentReservation, setCurrentReservation] = useState(null);
  const [editReservation, setEditReservation] = useState({
    show: false,
    startDate: new Date(),
    endDate: new Date(),
    startTime: new Date(),
    endTime: new Date(),
  });
  const [showDialog, setShowDialog] = useState(false); 
  const [noReservations, setNoReservations] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios
        .get('http://localhost:3001/api/user/me', {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          const { _id, username, email } = response.data;
          setUserId(_id);
          setUsername(username);
          setEmail(email);
  
          // Fetch reservations
          axios
            .get(`http://localhost:3001/api/reservations/${_id}`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
              const filteredReservations = res.data.filter(
                (reservation) => reservation.userId
              );
              setReservations(filteredReservations);
              setNoReservations(filteredReservations.length === 0);
            })
            .catch((error) => {
              console.error('Error fetching reservations:', error);
            });
        })
        .catch((error) => {
          console.error('Error fetching user data:', error);
          setMessage('Error fetching user data.');
        });
    } else {
      setMessage('No token found. Please log in.');
    }
  }, []);
  

  const handleProfileEdit = (field) => {
    setIsEditing((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!oldPasswordValid) {
      setMessage('Please validate your old password before updating.');
      return;
    }

    const token = localStorage.getItem('token');

    try {
      await axios.put(
        `http://localhost:3001/api/user/${userId}`,
        {
          oldPassword,
          newPassword,
          username,
          email,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessage('Profile updated successfully.');
    } catch (error) {
      setMessage('Error updating profile.');
      console.error('Error updating profile:', error);
    }
  };

  const handleOldPasswordValidation = () => {
    const token = localStorage.getItem('token');
    axios
      .post(
        'http://localhost:3001/api/validate-old-password',
        { oldPassword },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then((response) => {
        if (response.data.valid) {
          setOldPasswordValid(true);
          setMessage('Old password validated.');
        } else {
          setOldPassword('');
          setNewPassword('');
          setOldPasswordValid(false);
          setMessage('Old password is incorrect.');
        }
      })
      .catch((error) => {
        setOldPassword('');
        setNewPassword('');
        setOldPasswordValid(false);
        setMessage('Error validating old password.');
        console.error('Error validating old password:', error);
      });
  };

  const handleDeactivateAccount = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:3001/api/user/deactivate',
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      localStorage.removeItem('token');
      window.location.href = '/login';
    } catch (error) {
      console.error('Error deactivating account:', error);
    }
  };

  const confirmDeactivation = () => {
    setShowDialog(true);
  };

  const handleConfirmYes = () => {
    setShowDialog(false);
    handleDeactivateAccount();
  };

  const handleConfirmNo = () => {
    setShowDialog(false);
  };

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

  const handleReservationDelete = (reservation) => {
    setCurrentReservation(reservation);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    setShowDeleteDialog(false);
    if (!currentReservation) return;

    const token = localStorage.getItem('token');
    try {
      await axios.put(
        `http://localhost:3001/api/reservations/${currentReservation._id}/cancel`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setReservations((prev) => prev.filter((r) => r._id !== currentReservation._id));
      setMessage('Reservation deleted successfully.');
    } catch (error) {
      setMessage('Error deleting reservation.');
      console.error('Error deleting reservation:', error);
    }
  };

  const handleReservationEdit = (reservation) => {
    setEditReservation({
      show: true,
      startDate: new Date(reservation.startDate),
      endDate: new Date(reservation.endDate),
      startTime: new Date(`1970-01-01T${reservation.startTime}:00`),
      endTime: new Date(`1970-01-01T${reservation.endTime}:00`),
    });
    setCurrentReservation(reservation);
  };

  const confirmEdit = async () => {
    const { startDate, endDate, startTime, endTime } = editReservation;
    if (!currentReservation) return;

    const token = localStorage.getItem('token');
    try {
      await axios.put(
        `http://localhost:3001/api/reservations/${currentReservation._id}`,
        {
          startDate: startDate.toISOString().split('T')[0],
          startTime: `${startTime.getHours()}:${startTime.getMinutes()}`,
          endDate: endDate.toISOString().split('T')[0],
          endTime: `${endTime.getHours()}:${endTime.getMinutes()}`,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setReservations((prev) =>
        prev.map((res) =>
          res._id === currentReservation._id
            ? {
                ...res,
                startDate: startDate.toISOString().split('T')[0],
                endDate: endDate.toISOString().split('T')[0],
                startTime: `${startTime.getHours()}:${startTime.getMinutes()}`,
                endTime: `${endTime.getHours()}:${endTime.getMinutes()}`,
              }
            : res
        )
      );
      setMessage('Reservation updated successfully.');
      setEditReservation({ show: false, startDate: new Date(), endDate: new Date(), startTime: new Date(), endTime: new Date() });
    } catch (error) {
      setMessage('Error updating reservation.');
      console.error('Error updating reservation:', error);
    }
  };

  const cancelEdit = () => {
    setEditReservation({ show: false, startDate: new Date(), endDate: new Date(), startTime: new Date(), endTime: new Date() });
  };

  function renderActions(reservation) {
    if (reservation.status === 'Pending') {
      return (
        <>
          <button className="edit-button">Edit</button>
          <button className="delete-button">Delete</button>
        </>
      );
    } else {
      return <span>No actions possible</span>;
    }
  }

  return (
    <div className="profile">
      <Navbar />
      <div className="profile-content">
        <div className={`profile-left ${noReservations ? 'no-reservations' : ''}`}>
          <div className="reservations-table">
            <h2 className="reservations-title"><strong>Your Reservations :</strong></h2>
            <table>
              <thead>
                <tr>
                  <th>VM Name</th>
                  <th>Status</th>
                  <th>Start Date & Time</th>
                  <th>End Date & Time</th>
                  <th>Duration</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((reservation) => (
                  <tr key={reservation._id}>
                    <td>{reservation.vmName}</td>
                    <td>{reservation.status}</td>
                    <td>{formatDateTime(reservation.startDate, reservation.startTime)}</td>
                    <td>{formatDateTime(reservation.endDate, reservation.endTime)}</td>
                    <td>{calculateDuration(reservation.startDate, reservation.startTime, reservation.endDate, reservation.endTime)}</td>
                    <td>
                      {reservation.status === 'Pending' && (
                        <>
                          <div className="button-container">
                            <button
                              onClick={() => handleReservationEdit(reservation)}
                              className="button-edit"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleReservationDelete(reservation)}
                              className="button-delete"
                            >
                              Cancel
                            </button>
                          </div>
                        </>
                      )}
                      {reservation.status !== 'Pending' && (
                        <>
                          <h6 style={{ marginLeft: '20px' }}> <strong> No actions</strong></h6>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className={`profile-right ${noReservations ? 'no-reservations' : ''}`}>
          <h2 className="update-title"><strong>Update Your Profile :</strong></h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Username :</label>
              <div className="input-group">
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  readOnly={!isEditing.username}
                />
                <button
                  type="button"
                  className={`edit-button ${isEditing.username ? 'green-button' : 'red-button'}`}
                  onClick={() => handleProfileEdit('username')}
                >
                  {isEditing.username ? 'Save' : 'Edit'}
                </button>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email :</label>
              <div className="input-group">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  readOnly={!isEditing.email}
                />
                <button
                  type="button"
                  className={`edit-button ${isEditing.email ? 'green-button' : 'red-button'}`}
                  onClick={() => handleProfileEdit('email')}
                >
                  {isEditing.email ? 'Save' : 'Edit'}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="old-password">Old Password :</label>
              <div className="input-group">
                <input
                  type="password"
                  id="old-password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  readOnly={!isEditing.oldPassword}
                />
                <button
                  type="button"
                  className={`edit-button ${isEditing.oldPassword ? 'green-button' : 'red-button'}`}
                  onClick={() => {
                    if (isEditing.oldPassword) {
                      handleOldPasswordValidation();
                    } else {
                      handleProfileEdit('oldPassword');
                    }
                  }}
                >
                  {isEditing.oldPassword ? 'Validate' : 'Edit'}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="new-password">New Password :</label>
              <div className="input-group">
                <input
                  type="password"
                  id="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  readOnly={!oldPasswordValid || !isEditing.newPassword}
                />
                <button
                  type="button"
                  className={`edit-button ${isEditing.newPassword ? 'green-button' : 'red-button'}`}
                  onClick={() => handleProfileEdit('newPassword')}
                  disabled={!oldPasswordValid}
                >
                  {isEditing.newPassword ? 'Save' : 'Edit'}
                </button>
              </div>
            </div>

            <button type="submit" className="submit-button" disabled={!oldPasswordValid}>
              Update Profile
            </button>

            <button
              type="button"
              className="deactivate-button"
              onClick={confirmDeactivation}
            >
              Deactivate Account
            </button>

            {message && <p className="message">{message}</p>}
          </form>
        </div>
      </div>
      
      {showDeleteDialog && (
        <>
          <div className="confirmation-dialog-overlay"></div>
          <div className="confirmation-dialog">
            <div className="dialog-content">
              <h5><strong>Are you sure you want to cancel this reservation?</strong></h5>
              <h6 style={{ fontWeight: '500' }}>This action cannot be undone.</h6>
              <button style={{ backgroundColor: 'red' }} onClick={confirmDelete}>Yes, Cancel it</button>
              <button style={{ backgroundColor: 'green' }} onClick={() => setShowDeleteDialog(false)}>No</button>
            </div>
          </div>
        </>
      )}


      {editReservation.show && (
          <div className="edit-dialog">
            <h3><strong>Edit Reservation</strong></h3>
            <div>
              <label>
                Start Date:
                <DatePicker
                  selected={editReservation.startDate}
                  onChange={(date) => setEditReservation((prev) => ({ ...prev, startDate: date }))}
                  dateFormat="yyyy/MM/dd"
                />
              </label>
              <label>
                Start Time:
                <DatePicker
                  selected={editReservation.startTime}
                  onChange={(date) => setEditReservation((prev) => ({ ...prev, startTime: date }))}
                  showTimeSelect
                  showTimeSelectOnly
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  dateFormat="HH:mm"
                />
              </label>
            </div>
            <div>
              <label>
                End Date:
                <DatePicker
                  selected={editReservation.endDate}
                  onChange={(date) => setEditReservation((prev) => ({ ...prev, endDate: date }))}
                  dateFormat="yyyy/MM/dd"
                />
              </label>
              <label>
                End Time:
                <DatePicker
                  selected={editReservation.endTime}
                  onChange={(date) => setEditReservation((prev) => ({ ...prev, endTime: date }))}
                  showTimeSelect
                  showTimeSelectOnly
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  dateFormat="HH:mm"
                />
              </label>
            </div>
            <button onClick={confirmEdit}>Confirm</button>
            <button onClick={cancelEdit}>Cancel</button>
          </div>
        )}
      {showDialog && (
        <>
          <div className="confirmation-dialog-overlay"></div>
          <div className="confirmation-dialog">
            <div className="dialog-content">
              <h5><strong>Are you sure you want to deactivate your account?</strong></h5>
              <h6 style={{ fontWeight: '500' }}>This action cannot be undone.</h6>
              <button onClick={handleConfirmYes}>Yes</button>
              <button style={{ backgroundColor: 'green' }} onClick={handleConfirmNo}>
                No
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Profile;
