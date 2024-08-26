import React, { useState, useEffect } from 'react';
import Navbar from '../../Components/Navbar/navbar';
import './profile.css';
import axios from 'axios';

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

  // Assuming you have access to the user ID, e.g., from authentication
  const userId = '66bcecece68493e24d661030'; // Example user ID, replace with actual logic

  useEffect(() => {
    const token = localStorage.getItem('token'); // Get the token from local storage
    axios.get(`http://localhost:3001/api/user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => {
        const { username, email } = response.data;
        setUsername(username);
        setEmail(email);
      })
      .catch(error => {
        console.error("Error fetching user data:", error);
        setMessage('Error fetching user data.');
      });
  }, [userId]);
  

  const handleEdit = (field) => {
    setIsEditing(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!oldPasswordValid) {
        setMessage('Please validate your old password before updating.');
        return;
    }

    const token = localStorage.getItem('token'); 
    const userId = '66bcecece68493e24d661030'; 

    try {
        const response = await axios.put(
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
  axios.post(`http://localhost:3001/api/validate-old-password`, { oldPassword }, {
      headers: { Authorization: `Bearer ${token}` }
  })
  .then(response => {
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
  .catch(error => {
      setOldPassword('');
      setNewPassword('');
      setOldPasswordValid(false);
      setMessage('Error validating old password.');
      console.error("Error validating old password:", error);
  });
};

  return (
    <div className="profile-background">
      <Navbar /> 
      <div className="profile-container">
        <h1>Update Profile ({username})</h1> 
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <div className="input-group">
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                readOnly={!isEditing.username}
                required
              />
              <button
                type="button"
                className={`edit-button ${isEditing.username ? 'green-button' : 'red-button'}`}
                onClick={() => handleEdit('username')}
              >
                {isEditing.username ? 'Save' : 'Edit'}
              </button>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="old-password">Old Password</label>
            <div className="input-group">
              <input
                type="password"
                id="old-password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                readOnly={!isEditing.oldPassword}
                required
              />
              <button
                type="button"
                className={`edit-button ${isEditing.oldPassword ? 'green-button' : 'red-button'}`}
                onClick={() => {
                  if (isEditing.oldPassword) {
                    handleOldPasswordValidation();
                  } else {
                    handleEdit('oldPassword');
                  }
                }}
              >
                {isEditing.oldPassword ? 'Validate' : 'Edit'}
              </button>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="new-password">New Password</label>
            <div className="input-group">
              <input
                type="password"
                id="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                readOnly={!oldPasswordValid || !isEditing.newPassword}
                required
              />
              <button
                type="button"
                className={`edit-button ${isEditing.newPassword ? 'green-button' : 'red-button'}`}
                onClick={() => handleEdit('newPassword')}
                disabled={!oldPasswordValid}
              >
                {isEditing.newPassword ? 'Save' : 'Edit'}
              </button>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <div className="input-group">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                readOnly={!isEditing.email}
                required
              />
              <button
                type="button"
                className={`edit-button ${isEditing.email ? 'green-button' : 'red-button'}`}
                onClick={() => handleEdit('email')}
              >
                {isEditing.email ? 'Save' : 'Edit'}
              </button>
            </div>
          </div>
          <button type="submit" className="submit-button" disabled={!oldPasswordValid}>
            Update Profile
          </button>
          {message && <p className="message">{message}</p>}
        </form>
      </div>
    </div>
  );
}

export default Profile;
