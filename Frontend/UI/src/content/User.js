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

    const [users, setUsers] = React.useState([]);
    const [avoidUsers, setAvoidUsers] = React.useState([]);

    useEffect(() => {
        //not logged in
        if (!ID) return;
        
        //get the locations
        const getLocations = async () => {
            const response = await axios.get("http://localhost:8080/getLocations");
            setLocations(response.data || []);
        };
        getLocations();

        //get the users
        const getUsers = async () => {
            const response = await axios.get("http://localhost:8080/getUsers");
            setUsers(response.data || []);
        };
        getUsers();
    }, [ID]);
        

    if (!ID) {
        return (
            <div className="center-container">
                <p>You didn't login on the home page!</p>
                <button onClick={() => navigate('/')}>Go to Home</button>
            </div>
        );
    }

    //locations
    const handleToggleLocation = (location_id) => {
        if (favoriteLocations.some(loc => loc.location_id === location_id)) {
            setFavoriteLocations(favoriteLocations.filter(loc => loc.location_id !== location_id));
        } else {
            const loc = locations.find(loc => loc.location_id === location_id);
            if (loc) {
                setFavoriteLocations([...favoriteLocations, loc]);
            }
        }
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

    //users
    const handleToggleAvoidUser = (avoid_user_id) => {
        if (avoidUsers.some(user => user.user_id === avoid_user_id)) {
            setAvoidUsers(avoidUsers.filter(user => user.user_id !== avoid_user_id));
        } else {
            const user = users.find(user => user.user_id === avoid_user_id);
            if (user) {
                setAvoidUsers([...avoidUsers, user]);
            }
        }
    };

    const handleSubmitAvoidUsers = async () => {
        const avoid_user_ids = avoidUsers.map(user => user.user_id);
        try {
            await axios.post("http://localhost:8080/createAvoidUsers", { user_id: ID, avoid_user_ids });
            alert("Avoided users updated successfully!");
        } catch (error) {
            console.error("Error updating avoided users:", error);
            alert("Failed to update avoided users.");
        }
    };

    const handleSubmit = () => {
    navigate(`/${role}`, { state: { ID } });
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
                                    onChange={() => handleToggleLocation(loc.location_id)}
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
                    {users.map(user => (
                        <li key={user.user_id}>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={avoidUsers.some(avoid => avoid.user_id === user.user_id)}
                                    onChange={() => handleToggleAvoidUser(user.user_id)}
                                />
                                {user.user_id}
                            </label>
                        </li>
                    ))}
                </ul>
                <button onClick={handleSubmitAvoidUsers}>Submit Avoided Users</button>
            </div>

            <button onClick={handleSubmit}>Go to {role} page</button>
        </div>
    );
}
