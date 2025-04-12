// After other imports
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Calendar from '../components/Calendar/Calendar';

const Dashboard = () => {
    const BASE_URL = process.env.REACT_APP_EURL;
    const [user, setUser] = useState(null);
    const [serverTime, setServerTime] = useState(null);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    const fetchServerTime = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/api/time`);
            const serverDate = new Date(res.data.serverTime);
            return serverDate;
        } catch (err) {
            console.error("[Time] Failed to fetch server time:", err);
            return new Date(); // fallback
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };

                const currentServerTime = await fetchServerTime();
                setServerTime(currentServerTime);

                const userRes = await axios.get(`${BASE_URL}/api/users/me`, { headers });
                setUser(userRes.data);

                setLoading(false);
            } catch (err) {
                console.error('[Init] Error fetching data:', err);
                handleLogout();
            }
        };

        fetchData();
    }, [handleLogout]);

    if (loading) return <p>Loading...</p>;

    return (
        <div style={{ maxWidth: '600px', margin: 'auto', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Welcome to Dashboard</h2>
                <button onClick={handleLogout} style={{ padding: '6px 12px', cursor: 'pointer' }}>
                    🚪 Logout
                </button>
            </div>

            {user && (
                <div style={{ marginBottom: '20px' }}>
                    <p><strong>Name:</strong> {user.name || 'N/A'}</p>
                    <p><strong>Phone:</strong> {user.phone}</p>
                </div>
            )}

            <p><strong>Current Server Time:</strong> {serverTime ? serverTime.toLocaleTimeString() : 'Loading...'}</p>

            <div style={{ marginTop: '40px' }}>
                <h3>📅 Attendance Calendar</h3>
                <Calendar />
            </div>
        </div>
    );
};

export default Dashboard;
