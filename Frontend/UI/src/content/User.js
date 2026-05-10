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
                <select 
                    multiple 
                    value={favoriteLocations.map(loc => loc.location_id)}
                    onChange={(e) => {
                        const selectedIds = Array.from(e.target.selectedOptions, option => option.value);
                        const selectedLocations = locations.filter(loc => selectedIds.includes(loc.location_id));
                        setFavoriteLocations(selectedLocations);
                    }}
                >
                    {locations.map(loc => (
                        <option key={loc.location_id} value={loc.location_id}>
                            {loc.name}
                        </option>
                    ))}
                </select>
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
                <select 
                    multiple 
                    value={avoidUsers.map(user => user.user_id)}
                    onChange={(e) => {
                        const selectedIds = Array.from(e.target.selectedOptions, option => option.value);
                        const selectedUsers = users.filter(user => selectedIds.includes(user.user_id));
                        setAvoidUsers(selectedUsers);
                    }}
                >
                    {users.map(user => (
                        <option key={user.user_id} value={user.user_id}>
                            {user.user_id}
                        </option>
                    ))}
                </select>
                <button onClick={handleSubmitAvoidUsers}>Submit Avoided Users</button>
            </div>

            <button onClick={handleSubmit}>Go to {role} page</button>
        </div>
    );
}
