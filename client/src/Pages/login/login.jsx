import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './login.css';

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(""); // State for error message
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();

        axios.post('http://localhost:3001/login', { email, password })
            .then(result => {
                console.log("Response data:", result.data); // Debugging line

                if (result.data.message === "Success") {
                    localStorage.setItem('token', result.data.token); // Save token if needed
                    
                    // Check for redirect field and handle admin redirection
                    if (email === 'admin@admin' && password === 'admin') {
                        navigate('/admin'); // Redirect admin to dashboard
                    } else if (result.data.redirect) {
                        navigate(result.data.redirect); // Redirect based on backend response
                    } else {
                        navigate('/home'); // Default redirect for normal users
                    }
                } else {
                    setError(result.data.message); // Use message from backend response
                }
            })
            .catch(err => {
                console.error("Login error:", err.response?.data || err); // Debugging line
                setError("An error occurred. Please try again."); // Set generic error message
            });
    };

    return (
        <div className="container-wrapper">
            <div className="d-flex">
                {/* Left Side - Form */}
                <div className="w-45 bg-white p-5">
                    <div className="form-container w-100">
                        <h2 className="text-center sign-in-text"><strong>Sign in</strong></h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label htmlFor="email">
                                    <strong>Email</strong>
                                </label>
                                <input
                                    type="email"
                                    placeholder="Enter Email"
                                    autoComplete="off"
                                    name="email"
                                    className="form-control rounded-0"
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <div className="mb-3">
                                <label htmlFor="password">
                                    <strong>Password</strong>
                                </label>
                                <input
                                    type="password"
                                    placeholder="Enter Password"
                                    name="password"
                                    autoComplete="new-password"
                                    className="form-control rounded-0"
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>

                            <button type="submit" className="btn btn-success w-100 rounded-0">
                                Login
                            </button>
                        </form>

                        {error && (
                            <div className="alert alert-danger mt-3">
                                {error} {/* Display error message */}
                            </div>
                        )}

                        <p>Don't Have an Account?</p>
                        <Link to="/register" className="btn btn-default border w-100 bg-light rounded-0 text-decoration-none">
                            Register
                        </Link>
                    </div>
                </div>

                {/* Right Side - Image & Text */}
                <div className="right-column">
                    <h2>Master your network <span className="dynamic-word">[dynamicWord]</span></h2>
                    <Link to="/register" className="btn btn-outline-light mt-3">Register</Link>
                </div>
            </div>
        </div>
    );
}

export default Login;
