import React from 'react';
import './about.css';
import Navbar from '../../Components/Navbar/navbar'; // Adjust the path as necessary

function About() {
  return (
    <div className="about-page">
      <Navbar />
      <div className="about-container">
        <h1 className="about-title">About Us</h1>
        <div className="about-intro">
          <p>We are dedicated to providing seamless virtual machine management and reservation services. Our platform leverages advanced automation to make VM reservation and management as straightforward as possible.</p>
          <p>With our easy-to-use interface and secure access mechanisms, we ensure that your virtual machine needs are met efficiently and effectively. Our team is committed to continuous improvement and user satisfaction.</p>
        </div>
        <div className="about-mission">
          <h2>Our Mission</h2>
          <p>Our mission is to simplify virtual machine management through innovative technology and exceptional service. We strive to provide a robust and user-friendly platform that meets the evolving needs of our clients.</p>
        </div>
        <div className="about-values">
          <h2>Our Values</h2>
          <ul>
            <li>Innovation: We continuously seek new ways to enhance our services.</li>
            <li>Reliability: We ensure our platform is dependable and secure.</li>
            <li>Customer Focus: Our clients' needs are at the heart of what we do.</li>
            <li>Integrity: We conduct our business with honesty and transparency.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default About;
