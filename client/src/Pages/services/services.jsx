import React from 'react';
import './services.css';
import Navbar from '../../Components/Navbar/navbar';

function Services() {
  return (
    <div className="services-page">
      <Navbar />
      <div className="services-container">
        <h2 className="services-title">Our Services</h2>
        <div className="services-content">
          <div className="service-item">
            <div className="service-icon">
              <i className="fas fa-calendar-check"></i>
            </div>
            <h4>VM Reservation Management</h4>
            <p>Manage and reserve virtual machines with ease through our intuitive and advanced reservation system. Our platform allows you to quickly select and book VMs tailored to your needs.</p>
          </div>
          <div className="service-item">
            <div className="service-icon">
              <i className="fas fa-headset"></i>
            </div>
            <h4>24/7 Support</h4>
            <p>Our dedicated support team is available around the clock to assist you with any issues or questions you may have. We pride ourselves on our quick response and effective problem-solving.</p>
          </div>
          <div className="service-item">
            <div className="service-icon">
              <i className="fas fa-cogs"></i>
            </div>
            <h4>Custom VM Configurations</h4>
            <p>We offer a variety of customizable VM configurations to meet the specific needs of your projects. Whether you need high-performance computing or specific software setups, we have you covered.</p>
          </div>
        </div>
        <div className="services-footer">
          <h2>Why Choose Us?</h2>
          <p>Our commitment to innovation, reliability, and customer satisfaction sets us apart. Discover how our services can enhance your virtual machine management experience.</p>
        </div>
      </div>
    </div>
  );
}

export default Services;
