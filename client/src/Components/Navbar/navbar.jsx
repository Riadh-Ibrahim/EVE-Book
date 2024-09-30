import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';
import 'bootstrap/dist/css/bootstrap.min.css';
import './navbar.css';
import { FaUserCircle } from 'react-icons/fa';
function Navbar() {
  const navigate = useNavigate();
  const currentPath = window.location.pathname;
  const isLandingPage = currentPath === '/';
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token && currentPath !== '/' && currentPath !== '/login') {
      navigate('/login');
    }
  }, [currentPath, navigate]);


  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
};


  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav className="navbar">
      <div className="left-section">
        <img src={logo} alt="Logo" className="logo" />
        <Link to="/" className="link brand-name">EVE-BOOK</Link>
      </div>
      <div className={`menu-icon ${menuOpen ? 'active' : ''}`} onClick={toggleMenu}>
        &#9776;
      </div>
      <div className={`center-section ${menuOpen ? 'dropdown-active' : ''}`}>
        {isLandingPage ? (
          <Link to="/login" className="link"><strong>Home</strong></Link>
        ) : (
          <Link to="/home" className="link"><strong>Home</strong></Link>
        )}
        <Link to="/features" className="link"><strong>Features</strong></Link>
        <Link to="/about" className="link"><strong>About</strong></Link>
        <Link to="/services" className="link"><strong>Services</strong></Link>
      </div>
      <div className={`right-section ${menuOpen ? 'dropdown-active' : ''}`}>
        {isLandingPage ? (
          <Link to="/login" className="button">Login</Link>
        ) : (
          <button className="button" onClick={handleLogout}>Logout</button>
        )}
        <Link to="/contact" className="button">Contact Us</Link>
        {!isLandingPage && (
          <Link to="/profile" className="profile-icon">
            <FaUserCircle size={30} />
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
