import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './signup.css';

function Signup() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
    const navigate = useNavigate();

    // Dynamic text effect
    const words = ["topologies", "simulations"];
    const [dynamicWord, setDynamicWord] = useState(words[0]);
    const [fadeClass, setFadeClass] = useState('show');

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 900);

        window.addEventListener('resize', handleResize);

        const intervalId = setInterval(() => {
            setFadeClass('hide'); // Start fade out
            setTimeout(() => {
                setDynamicWord(prevWord => {
                    const currentIndex = words.indexOf(prevWord);
                    const nextIndex = (currentIndex + 1) % words.length;
                    return words[nextIndex];
                });
                setFadeClass('show'); // Start fade in
            }, 500); // Match this duration to the CSS transition time

        }, 2000); // Change every 2 seconds

        return () => {
            clearInterval(intervalId);
            window.removeEventListener('resize', handleResize);
        };
    }, [words]);

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post('http://localhost:3001/register', { username, email, password })
            .then(result => console.log(result))
            .then(() => navigate('/login'))
            .catch(err => console.log(err));
    };

    return (
        <div className="container-wrapper">
            <div className="d-flex">
                {/* Left Side - Form */}
                <div className={`d-flex justify-content-center align-items-center ${isMobile ? 'w-100' : 'w-45'} bg-white p-5`}>
                    <div className="form-container w-100">
                        <h2 className="text-center register-text"><strong>Register</strong></h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label htmlFor="name">
                                    <strong>Username</strong>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter Name"
                                    autoComplete="off"
                                    name="username"
                                    className="form-control rounded-0"
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>

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
                                Register
                            </button>
                        </form>

                        <p className="mt-3">Already Have an Account?</p>
                        <Link to="/login" className="btn btn-default border w-100 bg-light rounded-0 text-decoration-none">
                            Login
                        </Link>
                    </div>
                </div>

                {/* Right Side - Image & Text */}
                {!isMobile && (
                    <div className="right-column d-flex flex-column justify-content-center align-items-center w-55 text-white">
                        <h2>Master your network <span className={`dynamic-word ${fadeClass}`}>[{dynamicWord}]</span></h2>
                        <Link to="/login" className="btn btn-outline-light mt-3">Login</Link>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Signup;
