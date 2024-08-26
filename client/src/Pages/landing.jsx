import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import landing from '../assets/landing.png';
import background from '../assets/background.jpg';
import Navbar from '../Components/Navbar/navbar'; // Adjust the path as necessary

const Landing = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 800);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1000);
    };

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <Navbar /> {/* Include the Navbar here */}

      <div 
        className="d-flex flex-column justify-content-center" 
        style={{ 
          backgroundImage: `url(${background})`,
          backgroundSize: 'cover', 
          backgroundPosition: 'center', 
          minHeight: '100vh',
          color: '#aff',
          textShadow: '2px 2px 8px rgba(0, 0, 0, 0.7)',
          padding: '0 5%',
          width: '100%',
        }}
      >
        <div className="row align-items-center" style={{ flex: '1' }}>
          <div className="col-lg-6 text-center text-lg-left">
            <h1 
              className="display-4 font-weight-bold" 
              style={{ fontFamily: "'Poppins', sans-serif", fontSize: '3rem' }} 
            >
              Reserve Powerful VMs for Your Needs
            </h1>
            <p 
              className="lead mt-4" 
              style={{ fontFamily: "'Open Sans', sans-serif", fontSize: '1.3rem' }}
            >
              Seamlessly reserve virtual machines tailored to your unique needs and schedule.
            </p>
            <a 
              href="/register"
              className="btn btn-lg mt-3" 
              style={{ 
                backgroundColor: '#0062cc',
                color: '#fff',
                borderRadius: '50px',
                padding: '10px 30px',
                fontFamily: "'Poppins', sans-serif",
                transition: 'background-color 0.6s ease, transform 0.6s ease',
                transform: 'scale(1)',
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#004080';
                e.target.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#0062cc';
                e.target.style.transform = 'scale(1)';
              }}
            >
              Begin Your Journey Here
            </a>
          </div>
          <div className="col-lg-6 text-center">
            <img 
              src={landing} 
              alt="EVE-NG related" 
              className="img-fluid rounded" 
              style={{ 
                maxWidth: '85%', 
                height: 'auto', 
                border: '5px solid rgba(255, 255, 255, 0.5)',
                borderRadius: '20px' 
              }} 
            />
          </div>
        </div>
        
        {!isMobile && (
          <div className="row mt-4" style={{ flex: '0 0 auto' }}>
            <div className="col-lg-4 text-center">
              <h3 className="font-weight-bold" style={{ fontFamily: "'Poppins', sans-serif", fontSize: '1.5rem' }}>Why Choose Us?</h3>
              <p className="mt-3" style={{ fontFamily: "'Open Sans', sans-serif", fontSize: '1rem' }}>
                Our platform specializes in reserving high-performance EVE-NG virtual machines tailored to your specific needs.
              </p>
            </div>
            <div className="col-lg-4 text-center">
              <h3 className="font-weight-bold" style={{ fontFamily: "'Poppins', sans-serif", fontSize: '1.5rem' }}>Flexible Scheduling</h3>
              <p className="mt-3" style={{ fontFamily: "'Open Sans', sans-serif'", fontSize: '1rem' }}>
                Reserve your virtual machine for any duration, and adjust your schedule with ease through our user-friendly interface.
              </p>
            </div>
            <div className="col-lg-4 text-center">
              <h3 className="font-weight-bold" style={{ fontFamily: "'Poppins', sans-serif", fontSize: '1.5rem' }}>Optimized for EVE-NG</h3>
              <p className="mt-3" style={{ fontFamily: "'Open Sans', sans-serif", fontSize: '1rem' }}>
                Enjoy seamless integration and optimized performance with EVE-NG for all your networking simulation needs.
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Landing;
