const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require('path');
const User = require('./Models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const app = express();
const { exec } = require('child_process');
const Reservation = require('./Models/vmreservation'); // Import the VM reservation model

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

// API routes

// Login route
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    console.log("Received email:", email); // Debugging line
    User.findOne({ email })
        .then(user => {
            if (!user) {
                return res.status(404).json({ message: "No record found with this email" });
            }
            bcrypt.compare(password, user.password, (err, result) => {
                if (err) {
                    console.error("Error comparing passwords:", err); // Debugging line
                    return res.status(500).json({ message: "Error comparing passwords" });
                }
                if (result) {
                    const token = jwt.sign({ id: user._id }, 'your_jwt_secret', { expiresIn: '1h' });
                    console.log("Login successful, token generated"); // Debugging line
                    return res.json({ message: "Success", token });
                } else {
                    console.log("Incorrect password"); // Debugging line
                    return res.status(401).json({ message: "Incorrect Password" });
                }
            });
        })
        .catch(err => {
            console.error("Error during login:", err); // Debugging line
            res.status(500).json({ message: "Login failed due to server error" });
        });
});



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

require('dotenv').config({ path: './api/config.env' });

// Route to execute Ansible script and save reservation
app.post('/api/execute-ansible', async (req, res) => {
    const { startDate, startTime, endDate, endTime } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, 'your_jwt_secret', async (err, decoded) => {
        if (err) {
            console.error('Token verification failed:', err);
            return res.status(401).json({ message: 'Invalid token' });
        }

        const userId = decoded.id;

        try {
            // Save reservation to database
            const reservation = new Reservation({
                userId,
                startDate,
                startTime,
                endDate,
                endTime
            });
            await reservation.save();

            // Execute Ansible script
            const ansiblePlaybookPath = '/root/ansible/playbooks/create_vm.yml';
            const remoteHost = '192.168.23.133';

            const command = `sshpass -p '${SSH_PASSWORD}' ssh ${SSH_USER}@${remoteHost} 'ansible-playbook ${ansiblePlaybookPath}'`;

            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error('Error executing Ansible script:', error);
                    return res.status(500).json({ success: false, message: 'Failed to execute Ansible script' });
                }

                console.log('Ansible script output:', stdout);
                if (stderr) {
                    console.error('Ansible script stderr:', stderr);
                }

                res.json({ success: true, message: 'VM is being created!' });
            });
        } catch (error) {
            console.error('Error saving reservation:', error);
            res.status(500).json({ success: false, message: 'Failed to save reservation' });
        }
    });
});

// Route to fetch user data by ID
app.get('/api/user/:id', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1]; // Extract token from the "Bearer token" header
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

  app.put('/api/user/:id', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1]; // Extract token from the "Bearer token" header
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

                // Check if oldPassword is provided and validate it
                if (oldPassword) {
                    bcrypt.compare(oldPassword, user.password, (err, result) => {
                        if (err) {
                            return res.status(500).json({ message: 'Error comparing passwords' });
                        }
                        if (!result) {
                            return res.status(401).json({ message: 'Old password is incorrect' });
                        }

                        // Update user fields
                        if (username) user.username = username;
                        if (email) user.email = email;

                        // If there's a new password, hash it before saving
                        if (newPassword) {
                            bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
                                if (err) {
                                    return res.status(500).json({ message: 'Error hashing the password' });
                                }
                                user.password = hashedPassword;

                                // Save the updated user data after hashing the password
                                user.save()
                                    .then(updatedUser => {
                                        res.json({ message: 'Profile updated successfully', user: updatedUser });
                                    })
                                    .catch(err => {
                                        console.error('Error saving user data:', err);
                                        res.status(500).json({ message: 'Server error during update' });
                                    });
                            });
                        } else {
                            // If no new password, save the updated user data directly
                            user.save()
                                .then(updatedUser => {
                                    res.json({ message: 'Profile updated successfully', user: updatedUser });
                                })
                                .catch(err => {
                                    console.error('Error saving user data:', err);
                                    res.status(500).json({ message: 'Server error during update' });
                                });
                        }
                    });
                } else {
                    // If oldPassword is not provided, allow updating other fields directly
                    if (username) user.username = username;
                    if (email) user.email = email;

                    // Save the updated user data directly
                    user.save()
                        .then(updatedUser => {
                            res.json({ message: 'Profile updated successfully', user: updatedUser });
                        })
                        .catch(err => {
                            console.error('Error saving user data:', err);
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

// Route to validate old password
app.post('/api/validate-old-password', (req, res) => {
    const { oldPassword } = req.body;
    const token = req.headers.authorization?.split(' ')[1]; // Extract token from the header
  
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
  

// Serve React app for any other requests
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(3001, () => {
    console.log("Server is running on port 3001");
});