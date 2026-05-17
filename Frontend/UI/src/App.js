import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'
import {Login} from './content/Login'
import {Driver} from './content/Driver'
import {Passenger} from './content/Passenger'
import {Rides} from './content/Rides'
import { User } from './content/User';
import { Admin } from './content/Admin';


function App() {
    return (
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />            
          <Route path="/driver" element={<Driver />} />
          <Route path="/passenger" element={<Passenger />} />  
          <Route path="/rides" element={<Rides />} /> 
          <Route path="/user" element={<User />} />
          <Route path="/admin" element={<Admin />} />   
        </Routes>
      </Router>
    );
  }
  
  export default App;