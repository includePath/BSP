import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

// --FUNCTION-- //

export function User() {

    //switch pages
    const navigate = useNavigate();

    //get the user id and role
    const location = useLocation(); 
    const { ID, role } = location.state || {};

    const [locations, setLocations] = React.useState([]);
    const [favoriteLocations, setFavoriteLocations] = React.useState([]);

    useEffect(() => {
        //not logged in
        if (!ID) return;
        
        //get the locations
        const getLocations = async () => {
            const response = await axios.get("http://localhost:8080/getLocations");
            setLocations(response.data || []);
        };
        getLocations();
    }, [ID]);
        

    if (!ID) {
        return (
            <div className="center-container">
                <p>You didn't login on the home page!</p>
                <button onClick={() => navigate('/')}>Go to Home</button>
            </div>
        );
    }

    const handleToggle = (location_id) => {
        if (favoriteLocations.some(loc => loc.location_id === location_id)) {
            setFavoriteLocations(favoriteLocations.filter(loc => loc.location_id !== location_id));
        } else {
            const loc = locations.find(loc => loc.location_id === location_id);
            if (loc) {
                setFavoriteLocations([...favoriteLocations, loc]);
            }
        }
    };

    const handleSubmit = () => {
        navigate(`/${role}`, { state: { ID } });
    };

    const handleSubmitFavorites = async () => {
        const location_ids = favoriteLocations.map(loc => loc.location_id);
        try {
            await axios.post("http://localhost:8080/createFavoriteLocations", { user_id: ID, location_ids });
            alert("Favorite locations updated successfully!");
        } catch (error) {
            console.error("Error updating favorite locations:", error);
            alert("Failed to update favorite locations.");
        }
    };

    return (
        <div className="user-page">

            <h1>User Details</h1>

            <h2>ID: {ID}</h2>
            <h2>Role: {role}</h2>

            {/* Left side with favorite rides */}
            <div className="left-side">
                <h2>Favorite Locations</h2>
                <ul>
                    {locations.map(loc => (
                        <li key={loc.location_id}>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={favoriteLocations.some(fav => fav.location_id === loc.location_id)}
                                    onChange={() => handleToggle(loc.location_id)}
                                />
                                {loc.name}
                            </label>
                        </li>
                    ))}
                </ul>
                <button onClick={handleSubmitFavorites}>Submit Favorite Locations</button>
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
