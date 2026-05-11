import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import { Icon } from "leaflet";
import { useMap } from 'react-leaflet';

// Map fit bounds component
function MapFitBounds({ startCoor, endCoor }) {
  const map = useMap();

  useEffect(() => {
    if (startCoor && endCoor) {
      const bounds = [startCoor, endCoor];
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [startCoor, endCoor, map]);

  return null;
}

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

  const [startCoor, setStartCoor] = useState(null);
  const [endCoor, setEndCoor] = useState(null);

  const [route, setRoute] = useState(null);

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

  //get the geocodes for the map
  useEffect(() => {
    const fetchGeocodes = async () => {
      if (ride) {
        const startResponse = await axios.post("http://localhost:8080/getGeocode", {
          location: ride.start_loc_name
        });
        setStartCoor([startResponse.data.geocode.lat, startResponse.data.geocode.lon]);

        const endResponse = await axios.post("http://localhost:8080/getGeocode", {
          location: ride.end_loc_name
        });
        setEndCoor([endResponse.data.geocode.lat, endResponse.data.geocode.lon]);
      }
    };
    fetchGeocodes();
  }, [ride]);

  //get the route between the start and end location
  useEffect(() => {
    const fetchRoute = async () => {
      if (startCoor && endCoor) {
        const url = `https://router.project-osrm.org/route/v1/driving/${startCoor[1]},${startCoor[0]};${endCoor[1]},${endCoor[0]}?overview=full&geometries=geojson`;
        const response = await axios.get(url);
        const coords = response.data.routes[0].geometry.coordinates;
        setRoute(coords.map(([lon, lat]) => [lat, lon]));
      }
    };
    fetchRoute();
  }, [startCoor, endCoor]);

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

  //markers for map
  const markers = [];
  if (startCoor) {
    markers.push({ geocode: startCoor, type: "start" });
  }
  if (endCoor) {
    markers.push({ geocode: endCoor, type: "end" });
  }

  //custom icon for the markers
  const customIcon = new Icon({
    iconUrl: require("./pin.png"),
    iconSize: [25, 25] 
  });

// --HTML-- //

  return (
    <div>
      <h1>Recommended ride:</h1>
      {ride ? (

      <div className="center-container">
        <strong>Driver ID:</strong> {ride.driver_id}<br />
        <strong>Ride ID:</strong> {ride.ride_id}<br />
        <br />
        <strong>Start Location:</strong> {ride.start_loc_name}<br />
        <strong>End Location:</strong> {ride.end_loc_name}<br />
        <strong>Time:</strong> {ride.ride_time}<br />
        <strong>Seats Available:</strong> {ride.seats}<br />

        {/* --MAP-- */}
        <MapContainer center={startCoor || [49.5055, 5.9500]} zoom={13}>
          <MapFitBounds startCoor={startCoor} endCoor={endCoor} />
          <TileLayer 
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' 
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {markers.map((marker) => (
            <Marker position={marker.geocode} icon={customIcon}>
              <Popup>{marker.type === "start" ? "Start" : "End"}</Popup>
            </Marker>
          ))}
          {route && (
            <Polyline positions={route} color="blue" weight={3} opacity={0.7} />
          )}
        </MapContainer>

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