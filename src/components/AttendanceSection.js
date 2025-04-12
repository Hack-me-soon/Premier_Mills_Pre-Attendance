import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AttendanceSection = () => {
  const BASE_URL = process.env.REACT_APP_EURL;
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);
    const [today, setToday] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const todayDate = new Date();
        todayDate.setDate(todayDate.getDate() + 1); // get tomorrow's date
        const tomorrow = todayDate.toISOString().split('T')[0];
        setToday(tomorrow);
      
        const fetchResponse = async () => {
          try {
            const token = localStorage.getItem('token');
            if (!token) {
              console.error('No token found');
              return;
            }
      
            const res = await axios.get(
              `${BASE_URL}/api/users/my-response?date=${tomorrow}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
      
            if (res.data.response) {
              setResponse(res.data.response);
            }
          } catch (err) {
            console.error('Error fetching response:', err);
          }
        };
      
        fetchResponse();
      }, []);
      

    const handleResponse = async (choice) => {
        setLoading(true);
        setMessage('');
        try {
            const token = localStorage.getItem('token'); // Assume token stored
            const res = await axios.post(
                `${BASE_URL}/api/users/respond`,
                { date: today, response: choice },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setResponse(choice);
            setMessage(res.data.message);
        } catch (err) {
            console.error(err);
            setMessage('Error submitting response.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
            <h2>Attendance for {today}</h2>
            {response ? (
                <p>You have {response} your attendance.</p>
            ) : (
                <>
                    <button
                        onClick={() => handleResponse('confirmed')}
                        disabled={loading}
                        style={{ marginRight: '10px' }}
                    >
                        ✅ Confirm
                    </button>
                    <button
                        onClick={() => handleResponse('rejected')}
                        disabled={loading}
                    >
                        ❌ Reject
                    </button>
                </>
            )}
            {message && <p style={{ marginTop: '1rem' }}>{message}</p>}
        </div>
    );
};

export default AttendanceSection;
