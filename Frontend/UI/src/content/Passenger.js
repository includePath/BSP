import React, {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon } from "leaflet";
import { useLocation } from 'react-router-dom';
import axios from "axios";

// --PASSENGER FUNCTION-- //
export function Passenger() {

  // switch pages
  const navigate = useNavigate();

  //get id from login
  const location = useLocation(); 
  const { ID } = location.state || {};

  //initialize the value for each component
  const [start, setStart] = useState('University Of Luxembourg');
  const [end, setEnd] = useState('University Of Luxembourg');
  const [time, setTime] = useState('');
  const [need, setNeed] = useState('');


  // --SUBMIT FUNCTION-- //
  const handleSubmit = async (e) => {
    e.preventDefault();

    //missing fields
    if (!start || !end || !time || !need) {
      alert("All fields are required.");
      return;
    }

    //at least one location needs to be the University Of Luxembourg
    if (start !== "University Of Luxembourg" && end !== "University Of Luxembourg") {
      alert("At least one location needs to be the University Of Luxembourg");
      return;
    }

    //check if the entered location is valid (=has a geocode)
    const startValid = await axios.post("http://localhost:8080/isValidLocation", {
      location: start,
    });
    if (!startValid.data.valid) {
      alert("The start location is not valid. Please enter a valid location.");
      return;
    }
    const endValid = await axios.post("http://localhost:8080/isValidLocation", {
      location: end,
    });
    if (!endValid.data.valid) {
      alert("The end location is not valid. Please enter a valid location.");
      return;
    }

    //check if the distance between the two locations is valid
    const distanceValid = await axios.post("http://localhost:8080/isValidDistance", {
      loc1: start,
      loc2: end,
    });
    if (!distanceValid.data.valid) {
      alert("The distance between the two locations is not valid. Please enter closer locations.");
      return;
    }

    try {
      await axios.post("http://localhost:8080/createPassenger", {
        passenger_id: ID,
      });

      await axios.post("http://localhost:8080/createRequest", {
        passenger_id: ID,
        start_loc: start,
        end_loc: end, 
        ride_time: time, 
        needs: need === "yes" ? 1 : 0
      });

      navigate('/rides', { state: { ID } });
    } catch (err) {
      console.error(err);
      alert("An error occurred while submitting the form. Please try again.");
      return;
    }
  };

  //not logged in
  if (!ID) {
    return (
      <div className="center-container">
        <p>You didn't login on the home page!</p>
        <button onClick={() => navigate('/')}>Go to Home</button>
      </div>
    );
  }

  //markers for map
  const markers = [ { geocode: [49.5055, 5.9500] } ];
  const customIcon = new Icon({
    iconUrl: require("./pin.png"),
    iconSize: [45, 45] 
  });

// --HTML-- //
    return (
      <div>
        <h1>Passenger</h1>
        <form onSubmit={handleSubmit}>
        {/* User details button on right top corner */}
          <div style={{ position: 'absolute', top: 10, right: 10 }}>
            <button onClick={() => navigate('/user', { state: { ID, role: "passenger" } })}>
              User Details
            </button>
        </div>
      
        {/* --DETAILS-- */}
          <div>
          {/* start location */}
          <label htmlFor="start">Start location: </label>
          <input 
              type="text" id="start"
              value={start}
              onChange={(e) => setStart(e.target.value)}
          />
          {/* end location */}
          <label htmlFor="end">End location: </label>
          <input 
              type="text" id="end" 
              value={end}
              onChange={(e) => setEnd(e.target.value)}
          />
          <br></br>
          {/* time */}
          <label htmlFor="time">Time: </label>
          <input 
            type="time" id="time" 
            value={time} 
            onChange={(e) => setTime(e.target.value)}
          />
          <br></br>
          <b>Do you have special needs?</b>
          <div>
            {/* Yes */}
            <input 
              type="radio" id="yes" name="need" 
              value="yes" 
              onChange={(e) => setNeed(e.target.value)}
            />
            <label htmlFor="yes">Yes</label>
            {/* No */}
            <input 
              type="radio" id="no" name="need" 
              value="no" 
              onChange={(e) => setNeed(e.target.value)}
            />
            <label htmlFor="no">No</label>
          </div>
          <br />

        {/* --MAP-- */}
          <MapContainer center={[49.5055, 5.9500]} zoom={16}>
            <TileLayer 
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' 
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {markers.map((marker) => (
              <Marker position={marker.geocode} icon={customIcon}>
                <Popup>Start location</Popup>
              </Marker>
            ))}
          </MapContainer> 
          </div>
          <br/>

        {/* --SUBMIT BUTTON */}
          <input type="submit" value="Search rides" />
        </form> 
      </div>
    );
  }