import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Calendar.css'; // optional for styling

const Calendar = () => {
    const BASE_URL = process.env.REACT_APP_EURL;
    const [remainingCount, setRemainingCount] = useState(null);
    const [userResponse, setUserResponse] = useState(null);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [availableDates, setAvailableDates] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);

    const fetchAvailability = async (month) => {
        const token = localStorage.getItem('token');
        const yearMonth = month.toISOString().slice(0, 7); // "YYYY-MM"

        try {
            const res = await axios.get(`${BASE_URL}/api/availability/month/${yearMonth}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            console.log("Fetched availability:", res.data.availableDates);
            setAvailableDates(res.data.availableDates);
        } catch (err) {
            console.error("Error fetching monthly availability:", err.message);
        }
    };

    useEffect(() => {
        fetchAvailability(currentMonth);
    }, [currentMonth]);

    const getDaysInMonth = (monthDate) => {
        const year = monthDate.getFullYear();
        const month = monthDate.getMonth();
        return new Date(year, month + 1, 0).getDate();
    };

    const startDayOffset = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
    const daysInMonth = getDaysInMonth(currentMonth);
    const totalCells = Math.ceil((startDayOffset + daysInMonth) / 7) * 7;

    const isAvailable = (day) => {
        const y = currentMonth.getFullYear();
        const m = currentMonth.getMonth() + 1;
        const d = day;

        const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const match = availableDates.includes(dateStr);
        return match;
    };


    const handleDateClick = async (day) => {
        const utcDate = new Date(Date.UTC(
            currentMonth.getFullYear(),
            currentMonth.getMonth(),
            day
        ));

        const dateStr = utcDate.toISOString().split('T')[0];

        if (isAvailable(day)) {
            setSelectedDate(dateStr);

            const token = localStorage.getItem('token');
            try {
                const res = await axios.get(`${BASE_URL}/api/availability/${dateStr}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const { available, remaining, user_response } = res.data;

                if (available) {
                    setRemainingCount(remaining ?? null);

                    if (user_response === 'confirmed') {
                        setUserResponse("Confirmed");
                    } else if (user_response === 'rejected') {
                        setUserResponse("Rejected");
                    } else {
                        setUserResponse("Not Yet Responded");
                    }
                } else {
                    setRemainingCount(null);
                    setUserResponse(null);
                }
            } catch (err) {
                console.error("Error fetching availability for selected date:", err.message);
            }
        }
    };



    const handleResponse = async (response) => {
        const token = localStorage.getItem('token');

        try {
            await axios.post(`${BASE_URL}/api/users/respond`, {
                date: selectedDate,
                response,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });

            alert(`You have ${response} for ${selectedDate}`);
            setUserResponse(response === 'confirmed' ? "Confirmed" : "Rejected");

            // Refresh remaining count and user response immediately after action
            const res = await axios.get(`${BASE_URL}/api/availability/${selectedDate}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const { remaining, user_response } = res.data;

            setRemainingCount(remaining ?? null);
            setUserResponse(
                user_response === 'confirmed' ? "Confirmed" :
                    user_response === 'rejected' ? "Rejected" :
                        "Not Yet Responded"
            );

            setSelectedDate(null);
        } catch (err) {
            console.error("Error submitting early response:", err);

            if (err.response && err.response.status === 400) {
                const errorMessage = err.response.data?.error || "No remaining slots available for this date";
                alert(`⚠️ ${errorMessage}`);
            } else {
                alert("❌ An unexpected error occurred while submitting your response.");
            }
        }
    };


    return (
        <div>
            <h2>{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>

            <div className="calendar-grid">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
                    <div key={i} className="calendar-header">{d}</div>
                ))}

                {[...Array(totalCells)].map((_, i) => {
                    const dayNum = i - startDayOffset + 1;

                    if (dayNum < 1 || dayNum > daysInMonth) {
                        return <div key={i} className="calendar-cell empty"></div>;
                    }

                    const available = isAvailable(dayNum);

                    return (
                        <div
                            key={i}
                            className={`calendar-cell ${available ? 'available' : 'unavailable'}`}
                            onClick={() => handleDateClick(dayNum)}
                        >
                            {dayNum}
                        </div>
                    );
                })}
            </div>

            {selectedDate && (
                <div className="response-box">
                    <h4>Respond for {selectedDate}</h4>

                    {remainingCount !== null && (
                        <p>🧮 Remaining Slots: <strong>{remainingCount}</strong></p>
                    )}

                    {userResponse && (
                        <p>🧑‍💼 Your Response: <strong>{userResponse}</strong></p>
                    )}
                    {!(
                        remainingCount === 0 &&
                        (userResponse === "Rejected" || userResponse === "Not Yet Responded")
                    ) && (
                            <>
                                <button onClick={() => handleResponse('confirmed')}>✅ Accept</button>
                                <button onClick={() => handleResponse('rejected')}>❌ Reject</button>
                            </>
                        )}

                </div>
            )}


        </div>
    );
};

export default Calendar;
