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

    const [rides, setRides] = React.useState([]);

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

        //get the rides depending on the role
        const getRides = async () => {
            if (role === "passenger") {
                const response = await axios.get(`http://localhost:8080/getPassengerRides?passenger_id=${ID}`);
                setRides(response.data || []);
            } else if (role === "driver") {
                const response = await axios.get(`http://localhost:8080/getDriverRides?driver_id=${ID}`);
                setRides(response.data || []);
            }
        };
        getRides();

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
            //the user can not block themselves
            if (avoid_user_ids.includes(ID)) {
                alert("You cannot block yourself!");
                return;
            }
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
            <div style={{ textAlign: 'center', marginBottom: '30px', fontSize: '1.1em', color: '#666' }}>
                <span style={{ marginRight: '30px' }}><strong>ID:</strong> {ID}</span>
                <span><strong>Role:</strong> {role}</span>
            </div>

            {/* Top section: Favorite locations on left, Blocked users on right */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                {/* Left side with favorite locations */}
                <div className="left-side" style={{
                    flex: 1,
                    border: '2px solid #ddd',
                    borderRadius: '8px',
                    padding: '20px',
                    backgroundColor: '#f9f9f9'
                }}>
                    <h2>Favorite Locations</h2>
                    <h4 style={{ color: '#666', marginBottom: '20px' }}>Hold Ctrl (Cmd on Mac) to select multiple locations</h4>
                    <select 
                        multiple 
                        style={{ width: '100%', padding: '10px', marginBottom: '15px', border: '1px solid #ccc', borderRadius: '4px', minHeight: '120px' }}
                        value={favoriteLocations.map(loc => String(loc.location_id))}
                        onChange={(e) => {
                            const selectedIds = Array.from(e.target.selectedOptions, option => option.value);
                            const selectedLocations = locations.filter(loc => selectedIds.includes(String(loc.location_id)));
                            setFavoriteLocations(selectedLocations);
                        }}
                    >
                        {locations.map(loc => (
                            <option key={loc.location_id} value={loc.location_id}>
                                {loc.name}
                            </option>
                        ))}
                    </select>
                    <button onClick={handleSubmitFavorites} style={{ width: '100%'}}>Submit Favorite Locations</button>
                </div>

                {/* Right side with blocked users */}
                <div className="user-preferences" style={{ 
                    flex: 1, 
                    border: '2px solid #ddd', 
                    borderRadius: '8px', 
                    padding: '20px',
                    backgroundColor: '#f9f9f9'
                }}>
                    <h2>Blocked Users</h2>
                    <h4 style={{ color: '#666', marginBottom: '20px' }}>Hold Ctrl (Cmd on Mac) to select multiple locations</h4>
                    <select 
                        multiple 
                        style={{ width: '100%', padding: '10px', marginBottom: '15px', border: '1px solid #ccc', borderRadius: '4px', minHeight: '120px' }}
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
                    <button onClick={handleSubmitAvoidUsers} style={{ width: '100%'}}>Submit Avoided Users</button>
                </div>
            </div>

            {/* Bottom section: Rides */}
            <div className="right-side" style={{ 
                border: '2px solid #ddd', 
                borderRadius: '8px', 
                padding: '20px',
                backgroundColor: '#f9f9f9'
            }}>
                <h2>{role === "passenger" ? "The rides you have been assigned to" : "The rides you are proposing"}</h2>
                <ul>
                    {rides.length === 0 && <p style={{ textAlign: 'center', color: '#ff0000' }}>No rides to display</p>}
                    {rides.map(ride => (
                        <li key={ride.ride_id}>
                            <label>
                               {`Ride from ${ride.start_loc_name} to ${ride.end_loc_name} at ${ride.ride_time} with ${ride.seats} seats available`}
                                {role === "passenger" && ` by driver ${ride.driver_id}`}
                            </label>
                        </li>
                    ))}
                </ul>
            </div>

            <button onClick={handleSubmit} style={{ width: '100%', padding: '10px'}}>
                Go to {role} page
            </button>
        </div>
    );
}
