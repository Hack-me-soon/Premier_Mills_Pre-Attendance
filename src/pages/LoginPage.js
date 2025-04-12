// src/pages/LoginPage.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const BASE_URL = process.env.REACT_APP_EURL;
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await axios.post(`${BASE_URL}/api/auth/send-otp`, { phone });
      setMessage('OTP sent to console. Please check and enter it below.');
      setOtpSent(true);
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || 'Failed to send OTP');
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${BASE_URL}/api/auth/verify-otp`, {
        phone,
        otp,
      });
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || 'OTP verification failed');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: 'auto', padding: '20px' }}>
      <h2>Login with OTP</h2>
      <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}>
        <div>
          <label>Phone Number:</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>

        {otpSent && (
          <div style={{ marginTop: '10px' }}>
            <label>OTP:</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          </div>
        )}

        <button type="submit" style={{ marginTop: '20px' }}>
          {otpSent ? 'Verify OTP' : 'Send OTP'}
        </button>
      </form>
      {message && <p style={{ color: otpSent ? 'green' : 'red' }}>{message}</p>}
    </div>
  );
};

export default LoginPage;
