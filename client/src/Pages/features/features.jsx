import React from 'react';
import './features.css';
import Navbar from '../../Components/Navbar/navbar'; // Adjust the path as necessary

function Features() {
  return (
    <div className="features-page">
      <Navbar />
      <div className="features-container">
        <h1 className="features-title">Our Platform Features</h1>
        <p className="features-intro">
          Explore the key features of our VM reservation system designed to streamline your virtual machine management and enhance productivity.
        </p>
        <div className="features-content">
          <div className="feature-item">
            <div className="feature-icon">
              <i className="fas fa-calendar-alt"></i>
            </div>
            <h2>Easy VM Reservation</h2>
            <p>
              Effortlessly reserve a virtual machine with our user-friendly calendar system. Choose your date and duration, and leave the rest to us.
            </p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">
              <i className="fas fa-cogs"></i>
            </div>
            <h2>Automated VM Creation</h2>
            <p>
              After confirming your reservation, our automated system will create a VM in the EVE-NG environment, saving you valuable time.
            </p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">
              <i className="fas fa-lock"></i>
            </div>
            <h2>Secure SSH Access</h2>
            <p>
              Get SSH authentication parameters delivered directly to your email for secure and hassle-free access to your VM.
            </p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">
              <i className="fas fa-calendar-check"></i>
            </div>
            <h2>Real-Time Availability</h2>
            <p>
              Check VM availability in real-time to make informed decisions and avoid scheduling conflicts.
            </p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">
              <i className="fas fa-user-shield"></i>
            </div>
            <h2>User-Friendly Interface</h2>
            <p>
              Enjoy a sleek, intuitive interface that makes managing your VM reservations a breeze.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Features;
