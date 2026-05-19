import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";

// --LOGIN FUNCTION-- //
export function Login() {

  //switch pages
  const navigate = useNavigate();

  //initialize the value for each component
  const [ID, setID] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');

  
  // --SUBMIT FUNCTION-- //
  const handleSubmit = async (e) => {
    e.preventDefault();

    //missing fields
    if (!ID || !password || !status) {
      alert("All fields are required.");
      return;
    }

    //authenticate the user
    const response = await axios.post("http://localhost:8080/checkUser", {
        user_id: ID,
        pass: password,
    });  

    //user is authenticated
    if (response.data) {
      if (status === 'driver') {
          navigate('/driver', { state: { ID } });
      } else if (status === 'passenger') {
          navigate('/passenger', { state: { ID } });
      }
    } 
    //user is not authenticated
    else {
        alert("Authentication failed. Please check your credentials.");
    }
  };


// --HTML-- //
  return (
    <div>
      <h1>Log in using your student ID and password</h1>
      <form onSubmit={handleSubmit}>

      {/* --CREDENTIALS--  */}
        <div>    
          {/* ID */}
          <label htmlFor="ID">Student ID: </label>
          <input 
            type="text" id="ID" name="ID" 
            value={ID} onChange={(e) => setID(e.target.value)}
          />
          {/* Password */}
          <label htmlFor="password">Password: </label>
          <input 
            type="password" id="password"
            value={password} onChange={(e) => setPassword(e.target.value)} 
          />
        </div>
        <br />

      {/* --ROLE-- */}
        <div>
          {/* Driver */}
          <input 
            type="radio" id="driver" name="status" 
            value="driver" onChange={(e) => setStatus(e.target.value)}
          />
          <label htmlFor="driver">Driver</label>
          {/* Passenger */}
          <input 
            type="radio" id="passenger" name="status" 
            value="passenger" onChange={(e) => setStatus(e.target.value)}
          />
          <label htmlFor="passenger">Passenger</label>
        </div>
        <br />

      {/* --SUBMIT BUTTON-- */}
        <div>
          <input type="submit" value="Log in" />
        </div>
      </form>
    </div>
  );
}

