const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require('path');
const User = require('./Models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const app = express();
const { exec } = require('child_process');
const Reservation = require('./Models/vmreservation');
const { format } = require('date-fns');

const SSH_USER = 'admin';
const SSH_PASSWORD = 'eve';

app.use(express.json());
app.use(cors());

mongoose.connect("mongodb://127.0.0.1:27017/EVE-Book", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'build')));


// Register route
app.post('/register', async (req, res) => {
    try {
        const existingUser = await User.findOne({ $or: [{ email: req.body.email }, { username: req.body.username }] });
        if (existingUser) {
            return res.status(400).json({ message: 'Username or email already exists' });
        }

        const user = new User(req.body);
        await user.save();
        res.status(201).json(user);
    } catch (err) {
        console.error('Error during registration:', err);
        res.status(400).json({ message: "Registration failed", error: err.message });
    }
});

// Login route
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (email === 'admin@admin' && password === 'admin') {
    const token = jwt.sign({ role: 'admin' }, 'your_jwt_secret', { expiresIn: '1h' });
    return res.json({ message: "Success", token, redirect: "/admin" });
  }

  User.findOne({ email })
      .then(user => {
          if (!user) {
              return res.status(404).json({ message: "No record found with this email" });
          }

          if (user.status === 'Deactivated') {
              return res.status(403).json({ message: "This account has been deactivated." });
          }

          bcrypt.compare(password, user.password, (err, result) => {
              if (err) {
                  console.error("Error comparing passwords:", err); 
                  return res.status(500).json({ message: "Error comparing passwords" });
              }

              if (result) {
                  const token = jwt.sign({ id: user._id }, 'your_jwt_secret', { expiresIn: '1h' });
                  return res.json({ message: "Success", token });
              } else {
                  return res.status(401).json({ message: "Incorrect Password" });
              }
          });
      })
      .catch(err => {
          console.error("Error during login:", err); 
          res.status(500).json({ message: "Login failed due to server error" });
      });
});

require('dotenv').config({ path: './api/config.env' });

app.post('/api/refresh-token', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, 'your_jwt_secret', { ignoreExpiration: true }, (err, decoded) => {
        if (err) {
            console.error('Token verification failed:', err);
            return res.status(401).json({ message: 'Invalid token' });
        }

        const newToken = jwt.sign({ id: decoded.id }, 'your_jwt_secret', { expiresIn: '1h' });
        res.json({ token: newToken });
    });
});

const nodemailer = require('nodemailer');

// Configuration du transporteur de messagerie
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'evengbook@gmail.com',
        pass: 'mzat hrtf uxro qczv'
    }
});

//Route to execute ansible script
app.post('/api/execute-ansible', async (req, res) => {
  const { vmName, startDate, startTime, endDate, endTime } = req.body;
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, 'your_jwt_secret');
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      console.error('Token expired:', err);
      return res.status(401).json({ message: 'Token expired. Please log in again.' });
    }
    console.error('Token verification failed:', err);
    return res.status(401).json({ message: 'Invalid token' });
  }

  const userId = decoded.id;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const existingReservation = await Reservation.findOne({ vmName, startDate, startTime, user: user._id });
    if (existingReservation) {
      return res.status(409).json({ message: 'Reservation already exists' });
    }

    const reservation = new Reservation({
      vmName,
      status: 'Pending',
      startDate,
      startTime,
      endDate,
      endTime,
      userId: user._id
    });
    await reservation.save();

    const ansiblePlaybookPath = '/root/ansible/playbooks/create_vm.yml';
    const remoteHost = '192.168.23.133';
    const sshCommand = `C:\\WINDOWS\\System32\\OpenSSH\\ssh.exe root@${remoteHost} ansible-playbook ${ansiblePlaybookPath} -i /root/ansible/templates/inventory.ini --extra-vars ansible_ssh_pass=${SSH_PASSWORD} -vvvv`;

    exec(sshCommand, async (error, stdout, stderr) => {
      if (error) {
        console.error(`Execution error: ${error}`);
        return res.status(500).json({ success: false, message: 'Failed to execute Ansible script' });
      }

      console.error(`stderr: ${stderr}`);

      const formattedStartDate = format(new Date(startDate), 'yyyy-MM-dd');
      const formattedEndDate = format(new Date(endDate), 'yyyy-MM-dd');

      const mailOptions = {
        from: 'evengbook@gmail.com',
        to: user.email,
        subject: 'Details of Your VM Reservation',
        html: `
          <p>Hello <strong>${user.username}</strong>,</p>
          <p>Your reservation has been successfully made. Here are the details:</p>
          <ul>
            <li><strong>Start Date:</strong> ${formattedStartDate} at ${startTime}</li>
            <li><strong>End Date:</strong> ${formattedEndDate} at ${endTime}</li>
            <li><strong>SSH Settings:</strong></li>
            <ul>
              <li><strong>Username:</strong> ${SSH_USER}</li>
              <li><strong>Password:</strong> ${SSH_PASSWORD}</li>
              <li><strong>VM's IP Address:</strong> ${remoteHost}</li>
            </ul>
          </ul>
          <p>Thank you for your trust,</p>
          <p><strong>The EVE-BOOK Team</strong></p>
        `
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
        res.json({ success: true, message: 'VM is being created and email sent!' });
      } catch (emailError) {
        console.error('Error sending email:', emailError);
        return res.status(500).json({ success: false, message: 'Failed to send email' });
      }
    });

  } catch (error) {
    console.error('Error handling reservation:', error);
    return res.status(500).json({ success: false, message: 'Failed to handle reservation' });
  }
});

app.use((req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, 'your_jwt_secret', (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    req.userId = decoded.id; // Attach user ID to request
    next();
  });
});


// Route to fetch user data by ID
app.get('/api/user/:id', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
  
    jwt.verify(token, 'your_jwt_secret', (err, decoded) => {
      if (err) {
        console.error('Token verification failed:', err);
        return res.status(401).json({ message: 'Invalid token' });
      }
  
      const userId = decoded.id;
      User.findById(userId)
        .then(user => {
          if (!user) {
            return res.status(404).json({ message: 'User not found' });
          }
          res.json(user);
        })
        .catch(err => {
          console.error('Error fetching user data:', err);
          res.status(500).json({ message: 'Server error' });
        });
    });
  });  

app.post('/api/validate-old-password', (req, res) => {
    const { oldPassword } = req.body;
    const token = req.headers.authorization?.split(' ')[1];
  
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
  
    jwt.verify(token, 'your_jwt_secret', (err, decoded) => {
      if (err) {
        console.error('Token verification failed:', err);
        return res.status(401).json({ message: 'Invalid token' });
      }
  
      User.findById(decoded.id)
        .then(user => {
          if (!user) {
            return res.status(404).json({ message: 'User not found' });
          }
  
          bcrypt.compare(oldPassword, user.password, (err, result) => {
            if (err) {
              console.error('Error comparing passwords:', err);
              return res.status(500).json({ message: 'Error comparing passwords' });
            }
  
            res.json({ valid: result });
          });
        })
        .catch(err => {
          console.error('Error fetching user data:', err);
          res.status(500).json({ message: 'Server error' });
        });
    });
  });

// Route to update user profile
app.put('/api/user/:id', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
      return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, 'your_jwt_secret', (err, decoded) => {
      if (err) {
          console.error('Token verification failed:', err);
          return res.status(401).json({ message: 'Invalid token' });
      }

      const userId = decoded.id;
      if (userId !== req.params.id) {
          return res.status(403).json({ message: 'Forbidden: You are not allowed to update this user' });
      }

      const { oldPassword, newPassword, username, email } = req.body;

      User.findById(userId)
          .then(user => {
              if (!user) {
                  return res.status(404).json({ message: 'User not found' });
              }

              if (oldPassword) {
                  bcrypt.compare(oldPassword, user.password, (err, result) => {
                      if (err) {
                          console.error('Error comparing passwords:', err);
                          return res.status(500).json({ message: 'Error comparing passwords' });
                      }
                      if (!result) {
                          return res.status(401).json({ message: 'Old password is incorrect' });
                      }

                      if (username) user.username = username;
                      if (email) user.email = email;

                      if (newPassword) {
                          bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
                              if (err) {
                                  return res.status(500).json({ message: 'Error hashing new password' });
                              }
                              user.password = hashedPassword;

                              user.save()
                                  .then(updatedUser => res.json({ message: 'Profile updated successfully', user: updatedUser }))
                                  .catch(err => {
                                      console.error('Error saving updated user:', err);
                                      res.status(500).json({ message: 'Server error during update' });
                                  });
                          });
                      } else {
                          user.save()
                              .then(updatedUser => res.json({ message: 'Profile updated successfully', user: updatedUser }))
                              .catch(err => {
                                  console.error('Error saving updated user:', err);
                                  res.status(500).json({ message: 'Server error during update' });
                              });
                      }
                  });
              } else {
                  if (username) user.username = username;
                  if (email) user.email = email;

                  user.save()
                      .then(updatedUser => res.json({ message: 'Profile updated successfully', user: updatedUser }))
                      .catch(err => {
                          console.error('Error saving updated user:', err);
                          res.status(500).json({ message: 'Server error during update' });
                      });
              }
          })
          .catch(err => {
              console.error('Error finding user:', err);
              res.status(500).json({ message: 'Server error during update' });
          });
  });
});

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Endpoint to deactivate user account
app.post('/api/user/deactivate', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, 'your_jwt_secret', (err, decoded) => {
    if (err) {
      console.error('Token verification failed:', err);
      return res.status(401).json({ message: 'Invalid token' });
    }

    User.findById(decoded.id)
      .then(user => {
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }

        user.status = 'Deactivated';
        user.save()
          .then(() => {
            res.json({ message: 'Account deactivated successfully' });
          })
          .catch(err => {
            console.error('Error saving updated user status:', err);
            res.status(500).json({ message: 'Server error during deactivation' });
          });
      })
      .catch(err => {
        console.error('Error finding user:', err);
        res.status(500).json({ message: 'Server error during deactivation' });
      });
  });
});


// Route to fetch all users
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users' });
    }
});

// Route to fetch reservations for a specific user
app.get('/api/reservations/:userId', async (req, res) => {
  const { userId } = req.params;
  
  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    const reservations = await Reservation.find({ userId: userId }).exec();

    if (reservations.length === 0) {
      return res.status(404).json({ message: 'No reservations found for this user' });
    }

    res.json(reservations);
  } catch (error) {
    console.error('Error fetching reservations:', error);
    res.status(500).json({ message: 'Error fetching reservations' });
  }
});

// Fetch all VM reservations with user info
app.get('/api/admin/reservations', async (req, res) => {
    try {
      const reservations = await Reservation.find({});
      res.json(reservations);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      res.status(500).send('Internal Server Error');
    }
  });
  
// Fetch all users (if needed for admin)
app.get('/api/admin/users', (req, res) => {
User.find({})
    .then(users => res.json(users))
    .catch(err => res.status(500).json({ message: 'Error fetching users' }));
});

// Backend route to delete a user
app.delete('/api/admin/users/:id', async (req, res) => {
    try {
      const userId = req.params.id;
      const result = await User.findByIdAndDelete(userId);
      
      if (!result) {
        return res.status(404).json({ message: 'User not found.' });
      }
      
      res.status(200).json({ message: 'User deleted successfully.' });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });  

// Backend route to delete a reservation
app.delete('/api/admin/reservations/:id', async (req, res) => {
  try {
    const reservationId = req.params.id;
    const result = await Reservation.findByIdAndDelete(reservationId);

    if (!result) {
      return res.status(404).json({ message: 'Reservation not found.' });
    }

    res.status(200).json({ message: 'Reservation deleted successfully.' });
  } catch (error) {
    console.error('Error deleting reservation:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Sample route to get user info
app.get('/api/home', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
  
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
  
    jwt.verify(token, 'your_jwt_secret', (err, decoded) => {
      if (err) {
        console.error('Token verification failed:', err);
        return res.status(401).json({ message: 'Invalid token' });
      }
  
      User.findById(decoded.id)
        .then(user => {
          if (!user) {
            return res.status(404).json({ message: 'User not found' });
          }
          res.json({ user });
        })
        .catch(err => {
          console.error('Error fetching user data:', err);
          res.status(500).json({ message: 'Server error' });
        });
    });
  });

// Function to update reservation statuses
async function updateReservationStatuses() {
  try {
    let now = new Date();
    now.setHours(now.getHours() + 1);
    const reservations = await Reservation.find({});

    for (const reservation of reservations) {
      if (!reservation.userId) {
        continue;
      }

      if (reservation.status === 'Cancelled') {
        continue;
      }

      if (!reservation.startDate || !reservation.endDate) {
        continue;
      }

      const startDate = new Date(reservation.startDate);
      let endDate = new Date(reservation.endDate);

      if (endDate < startDate) {
        endDate.setDate(endDate.getDate() + 1);
      }

      if (now > endDate) {
        reservation.status = 'Completed';
      } else if (now >= startDate && now <= endDate) {
        reservation.status = 'In Progress';
      } else if (now < startDate) {
        reservation.status = 'Pending';
      }

      await reservation.save();
    }
    console.log('Reservation statuses updated successfully.');
  } catch (error) {
    console.error('Error updating reservation statuses:', error);
  }
}

updateReservationStatuses()

const cron = require('node-cron');

// Schedule the task to run every hour (you can adjust the frequency)
cron.schedule('0 * * * *', () => {
    console.log('Running scheduled task to update reservation statuses...');
    updateReservationStatuses();
});

// Update reservation status endpoint
app.post('/api/admin/update-statuses', async (req, res) => {
  try {
      await updateReservationStatuses();
      res.json({ message: 'Reservation statuses updated successfully.' });
  } catch (error) {
      console.error('Error updating reservation statuses:', error);
      res.status(500).json({ message: 'Error updating reservation statuses' });
  }
});

const moment = require('moment');

// Route to Update reservation
app.put('/api/reservations/:id', async (req, res) => {
  const { id } = req.params;
  let { startDate, startTime, endDate, endTime } = req.body;

  console.log('PUT request received:', { id, startDate, startTime, endDate, endTime });

  const normalizeTime = (time) => {
    const parts = time.split(':');
    if (parts.length === 2) {
      return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
    }
    return time;
  };

  startTime = normalizeTime(startTime);
  endTime = normalizeTime(endTime);

  console.log('Normalized start time:', startTime);
  console.log('Normalized end time:', endTime);

  const now = moment();
  const startDateTime = moment(`${startDate}T${startTime}`);
  const endDateTime = moment(`${endDate}T${endTime}`);

  console.log('Parsed start date/time:', startDateTime.format());
  console.log('Parsed end date/time:', endDateTime.format());

  if (!startDateTime.isValid() || !endDateTime.isValid()) {
    return res.status(400).json({ message: 'Invalid date or time format.' });
  }

  if (startDateTime.isBefore(now) || endDateTime.isBefore(now)) {
    return res.status(400).json({ message: 'Dates and times must be in the future.' });
  }

  if (endDateTime.isBefore(startDateTime)) {
    return res.status(400).json({ message: 'End date/time must be after start date/time.' });
  }

  try {
    const updatedReservation = await Reservation.findByIdAndUpdate(
      id,
      { startDate, startTime, endDate, endTime },
      { new: true, runValidators: true }
    );

    if (!updatedReservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    res.status(200).json(updatedReservation);
  } catch (error) {
    console.error('Error updating reservation:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route to cancel reservation
app.put('/api/reservations/:id/cancel', async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).send('Reservation not found');
    }

    reservation.status = 'Cancelled';
    await reservation.save();

    res.status(200).send('Reservation cancelled');
  } catch (error) {
    res.status(500).send('Error cancelling reservation');
  }
});

//Route to check start date conflicts
app.get('/api/check-start-date', async (req, res) => {
  const { start } = req.query;

  try {
      const newStart = new Date(start);

      if (isNaN(newStart.getTime())) {
          return res.status(400).json({ conflict: false, message: 'Invalid start date.' });
      }

      const existingReservations = await Reservation.find();

      const conflict = existingReservations.some(reservation => {
          const reservationStart = new Date(`${reservation.startDate.toISOString().split('T')[0]}T${reservation.startTime}`);
          reservationStart.setHours(reservationStart.getHours() + 1); // Add 1 hour
          
          const reservationEnd = new Date(`${reservation.endDate.toISOString().split('T')[0]}T${reservation.endTime}`);
          reservationEnd.setHours(reservationEnd.getHours() + 1); // Add 1 hour

          const isOverlappingEntirely = newStart < reservationStart && newStart >= reservationEnd;
          const isSameTime = newStart.getTime() === reservationStart.getTime();
          const isContainedWithin = newStart > reservationStart && newStart < reservationEnd;
          const isOverlappingPartially = newStart >= reservationStart && newStart <= reservationEnd;

          return isOverlappingEntirely || isSameTime || isContainedWithin || isOverlappingPartially;
      });

      res.json({ conflict });
  } catch (error) {
      console.error('Error checking start date conflict:', error);
      res.status(500).json({ conflict: false, message: 'Error checking start date.' });
  }
});

//Route to check end date conflicts
app.get('/api/check-end-date', async (req, res) => {
  const { start, end } = req.query;

  try {
      const newStart = new Date(start);
      const newEnd = new Date(end);

      if (isNaN(newStart.getTime()) || isNaN(newEnd.getTime())) {
          return res.status(400).json({ conflict: false, message: 'Invalid start or end date.' });
      }

      const existingReservations = await Reservation.find();

      const conflict = existingReservations.some(reservation => {
          const reservationStart = new Date(`${reservation.startDate.toISOString().split('T')[0]}T${reservation.startTime}`);
          const reservationEnd = new Date(`${reservation.endDate.toISOString().split('T')[0]}T${reservation.endTime}`);

          const isOverlappingEntirely = newStart < reservationStart && newEnd > reservationEnd;
          const isSameTime = newStart.getTime() === reservationStart.getTime() && newEnd.getTime() === reservationEnd.getTime();
          const isContainedWithin = newStart > reservationStart && newEnd < reservationEnd;
          const isOverlappingPartially = (newStart >= reservationStart && newStart <= reservationEnd) || 
                                         (newEnd >= reservationStart && newEnd <= reservationEnd);

          return isOverlappingEntirely || isSameTime || isContainedWithin || isOverlappingPartially;
      });

      res.json({ conflict });
  } catch (error) {
      console.error('Error checking end date conflict:', error);
      res.status(500).json({ conflict: false, message: 'Error checking end date.' });
  }
});

// Serve React app for any other requests
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(3001, () => {
    console.log("Server is running on port 3001");
});