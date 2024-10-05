import React, { useRef, useState } from 'react';
import './contact.css';
import emailjs from '@emailjs/browser';
import Navbar from '../../Components/Navbar/navbar';

const Contact = () => {
    const form = useRef();

    // State variables for modal control
    const [modalVisible, setModalVisible] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    const sendEmail = (e) => {
        e.preventDefault();

        const fromName = form.current.from_name.value.trim();
        const fromEmail = form.current.from_email.value.trim();
        const message = form.current.message.value.trim();

        if (!fromName || !fromEmail || !message) {
            console.log("Missing fields");
            setModalMessage("Please fill in all fields before submitting.");
            setIsSuccess(false);
            setModalVisible(true);
            return;
        }

        emailjs
            .sendForm('service_318vlhn', 'template_rz6b6u7', form.current, 'kPP3-fJhMztH7vrOz')
            .then(
                (result) => {
                    console.log('SUCCESS!', result.text);
                    setModalMessage("Email sent!\nThank you for your contribution!");
                    setIsSuccess(true);
                    setModalVisible(true);
                    form.current.reset();
                },
                (error) => {
                    console.log('FAILED...', error.text);
                    setModalMessage("Email sending failed. Please try again.");
                    setIsSuccess(false);
                    setModalVisible(true);
                }
            );
    };

    const handleCloseModal = () => {
        console.log("Closing modal");
        setModalVisible(false);
    };

    const handleSendAnother = () => {
        console.log("Sending another message");
        setModalVisible(false);
        form.current.reset();
    };

    return (
        <div id='contact-page'>
            <div className="navbar-container">
                <Navbar />
            </div>
            <div className="contact-content">
                <h1 className="contactPageTitle">Contact Us</h1>
                <p className="contactDesc">Please fill out the form below if you have any inquiries or problems.</p>
                <form className='contactForm' ref={form} onSubmit={sendEmail}>
                    <input type="text" className='name' placeholder='Your Name' name="from_name" />
                    <input type="email" className='email' placeholder='Your Email' name="from_email" />
                    <textarea className='msg' name="message" rows="5" placeholder='Your Message'></textarea>
                    <button type='submit' className='submitBtn'>Send Message</button>
                </form>
            </div>

            {/* Modal Component */}
            {modalVisible && (
                <div className="modal-overlay">
                    <div className="modal">
                        <p className={isSuccess ? 'strong-message' : ''}>
                            Email sent!<br />Thank you for your contribution!
                        </p>
                        <div className="modal-buttons">
                            <button className="ok-button" onClick={handleCloseModal}>OK</button>
                            {isSuccess && (
                                <button className="send-another-button" onClick={handleSendAnother}>Send Another Message</button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Contact;
