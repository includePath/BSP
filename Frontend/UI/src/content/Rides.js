import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

// --FUNCTION-- //

export function Rides() {
  //switch pages
  const navigate = useNavigate(); 

  //loaidng the rides
  const [loading, setLoading] = useState(true);

  //get the user id
  const location = useLocation();
  const { ID } = location.state || {};

  const [ride, setRide] = useState(null);

  useEffect(() => {
    //show the corresponding ride
    const showRide = async () => {
      //run the algorithm
      const runResponse = await axios.post("http://localhost:8080/runAlgorithm", {});
      if (!runResponse.data.success) {
        setLoading(false);
        return;
      }

      // get the ride info
      const response = await axios.post("http://localhost:8080/showRide", {
        passenger_id: ID, 
      });
      setRide(response.data.ride || null);
      setLoading(false);
    };
    showRide();
  },[ID]);

  if (!ID) {
     return (
     <div className="center-container">
       <p>You didn't login on the home page!</p>
       <button onClick={() => navigate('/')}>Go to Home</button>
     </div>
   );
  }

  if (ride === null && !loading) {
    return (
      <div className="center-container">
        <p>Not enough riders are registered. Try again later.</p>
        <button onClick={() => navigate("/")}>
          Return to Homepage
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="center-container">
        <div className="loading-spinner"></div>
        <p>Finding your ride please be patient...</p>
      </div>
    );
  }

// --HTML-- //

  return (
    <div>
      <h1>Recommended ride:</h1>
      {ride ? (

      <div className="center-container">
        <strong>Driver ID:</strong> {ride.driver_id}<br />
        <strong>Ride ID:</strong> {ride.ride_id}<br />
        <br />
        <strong>Start Location:</strong> {ride.start_loc}<br />
        <strong>End Location:</strong> {ride.end_loc}<br />
        <strong>Time:</strong> {ride.ride_time}<br />
        <strong>Seats Available:</strong> {ride.seats}<br />
        <button onClick={() => navigate("/")}>
          Return to Homepage
        </button>
      </div>
      ) : (
        <p>No ride available</p>
      )}
    </div>
  );
}