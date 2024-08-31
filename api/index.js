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

const SSH_USER = 'root';
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

// Create VM route
const nodemailer = require('nodemailer');

// Configuration du transporteur de messagerie
const transporter = nodemailer.createTransport({
    service: 'Gmail', // Utilisez le service de messagerie que vous souhaitez
    auth: {
        user: 'riadhibrahim007@gmail.com', // Remplacez par votre adresse e-mail
        pass: 'New@Mot123' // Remplacez par votre mot de passe
    }
});

app.post('/api/execute-ansible', async (req, res) => {
    const { startDate, startTime, endDate, endTime } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, 'your_jwt_secret', async (err, decoded) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                console.error('Token expired:', err);
                return res.status(401).json({ message: 'Token expired. Please log in again.' });
            } else {
                console.error('Token verification failed:', err);
                return res.status(401).json({ message: 'Invalid token' });
            }
        }

        const userId = decoded.id;

        try {
            // Récupérer l'utilisateur par son ID
            const user = await User.findById(userId);

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Enregistrer la réservation dans la base de données
            const reservation = new Reservation({
                userId,
                startDate,
                startTime,
                endDate,
                endTime
            });
            await reservation.save();

            // Exécuter le script Ansible avec la commande SSH
            const ansiblePlaybookPath = '/root/ansible/playbooks/create_vm.yml';
            const remoteHost = '192.168.23.133';

            const sshCommand = `C:\\WINDOWS\\System32\\OpenSSH\\ssh.exe root@${remoteHost} ansible-playbook ${ansiblePlaybookPath} -i /root/ansible/templates/inventory.ini --extra-vars ansible_ssh_pass=${SSH_PASSWORD} -vvvv`;

            exec(sshCommand, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Execution error: ${error}`);
                    return res.status(500).json({ success: false, message: 'Failed to execute Ansible script' });
                }

                console.log(`stdout: ${stdout}`);
                console.error(`stderr: ${stderr}`);

                // Envoyer un e-mail à l'utilisateur avec les détails de la réservation
                const mailOptions = {
                    from: 'riadhibrahim007@gmail.com',
                    to: user.email, // Adresse e-mail de l'utilisateur
                    subject: 'Details of Your VM Reservation',
                    text: `
                        Hello ${user.username},

                         Your reservation has been successfully made. Here are the details of your reservation:

                        - Start Date: ${startDate} at ${startTime}
                        - End Date: ${endDate} at ${endTime}
                         - SSH Settings:
                            - Username : ${SSH_USER}
                            - Password : ${SSH_PASSWORD}
                            - VM's IP Address : 192.168.23.133

                        Thank you for your trust,

                        The EVE-BOOK Team
                    `
                };

                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.error('Erreur lors de l\'envoi de l\'email:', error);
                        return res.status(500).json({ success: false, message: 'Failed to send email' });
                    } else {
                        console.log('Email envoyé:', info.response);
                    }
                });

                res.json({ success: true, message: 'VM is being created and email sent!' });
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
app.get('/api/users/:userId/reservations', (req, res) => {
    const { userId } = req.params;
    Reservation.find({ userId })
        .then(reservations => res.json(reservations))
        .catch(err => {
            console.error('Error fetching reservations:', err);
            res.status(500).json({ message: 'Error fetching reservations' });
        });
});

// Fetch all VM reservations with user info
app.get('/api/admin/reservations', (req, res) => {
    Reservation.find({})
      .populate('userId', 'username email') // Populate with username and email from the User model
      .then(reservations => res.json(reservations))
      .catch(err => res.status(500).json({ message: 'Error fetching reservations' }));
  });
  
  
  // Fetch all users (if needed for admin)
  app.get('/api/admin/users', (req, res) => {
    User.find({})
      .then(users => res.json(users))
      .catch(err => res.status(500).json({ message: 'Error fetching users' }));
  });
  

// Serve React app for any other requests
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(3001, () => {
    console.log("Server is running on port 3001");
});