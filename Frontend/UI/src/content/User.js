import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export function User() {

    const navigate = useNavigate();
    const location = useLocation(); 
    const { ID, role } = location.state || {};

    // Not logged in
    if (!ID) {
        return (
            <div className="center-container">
                <p>You didn't login on the home page!</p>
                <button onClick={() => navigate('/')}>Go to Home</button>
            </div>
        );
    }

    const handleSubmit = () => {
        navigate(`/${role}`, { state: { ID } });
    };

    return (
        <div className="user-page">

            <h1>User Details</h1>

            {/* Left side with favorite rides */}
            <div className="left-side">
                <h2>Favorite Locations</h2>
                <ul>
                    <li>Ride 1</li>
                    <li>Ride 2</li>
                    <li>Ride 3</li>
                </ul>
            </div>

            {/* Right side with previous rides */}
            <div className="right-side">
                <h2>Your Rides</h2>
                <ul>
                    <li>Ride 1</li>
                    <li>Ride 2</li>
                    <li>Ride 3</li>
                </ul>
            </div>

            {/* User preferences */}
            <div className="user-preferences">
                <h2>Blocked users</h2>
                <ul>
                    <li>User 1</li>
                    <li>User 2</li>
                    <li>User 3</li>
                </ul>
            </div>

            <button onClick={handleSubmit}>Go to {role} page</button>
        </div>
    );
}
