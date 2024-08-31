import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './admin.css';

function Admin() {
  const [reservations, setReservations] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reservationsResponse, usersResponse] = await Promise.all([
          axios.get('/api/admin/reservations'),
          axios.get('/api/admin/users'),
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>

      <div className="admin-content">
        <div className="reservations-list">
          <h2>VM Reservations</h2>
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>VM Name</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((reservation) => (
                <tr key={reservation._id}>
                  <td>{reservation._id}</td>
                  <td>{reservation.userId.username} ({reservation.userId.email})</td>
                  <td>{reservation.vmName}</td>
                  <td>{reservation.status}</td>
                  <td>{new Date(reservation.date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>

        <div className="users-list">
          <h2>Users</h2>
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user._id}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Admin;
