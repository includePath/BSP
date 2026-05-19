import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// --ADMIN FUNCTION-- //
export function Admin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [numUsers, setNumUsers] = useState(100);
  const [numLocations, setNumLocations] = useState(5);

  // Handle database deletion
  const handleDeleteDatabase = async () => {
    const confirmDelete = window.confirm('Are you sure you want to clear the database? This action cannot be undone.');
    if (!confirmDelete) return;

    setLoading(true);
    setMessage('Deleting database...');

    try {
      const response = await axios.post('http://localhost:8080/clearDatabase');
      setMessage(response.data.message);
      alert('Database cleared successfully!');
    } catch (error) {
      console.error('Error deleting database:', error);
      setMessage('Error deleting database');
      alert('Failed to delete database. Check the console for details.');
    } finally {
      setLoading(false);
    }
  };

  // Handle database population
  const handlePopulateDatabase = async () => {
    setLoading(true);
    setMessage('Populating database...');

    try {
      const response = await axios.post('http://localhost:8080/populateDatabase', {
        numUsers: parseInt(numUsers),
        numLocations: parseInt(numLocations),
      });
      setMessage(response.data.message);
      alert('Database populated successfully!');
    } catch (error) {
      console.error('Error populating database:', error);
      setMessage('Error populating database');
      alert('Failed to populate database. Check the console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-content">
        <h1>Admin Panel</h1>
        
        <div className="admin-section">
          <h2>Database Management</h2>
          
          <div>
            <label htmlFor="numUsers">Number of Users: </label>
            <input 
              type="number" 
              id="numUsers" 
              value={numUsers} 
              onChange={(e) => setNumUsers(e.target.value)}
              min="1"
            />
          </div>

          <div>
            <label htmlFor="numLocations">Number of Locations: </label>
            <input 
              type="number" 
              id="numLocations" 
              value={numLocations} 
              onChange={(e) => setNumLocations(e.target.value)}
              min="1"
            />
          </div>

          <div className="admin-buttons">
            <button 
              onClick={handleDeleteDatabase} 
              disabled={loading}
              style={{ backgroundColor: '#ff6b6b', color: 'white', padding: '10px 15px' }}
            >
              {loading ? 'Clear...' : 'Clear Database'}
            </button>

            <button 
              onClick={handlePopulateDatabase} 
              disabled={loading}
              style={{ backgroundColor: '#4CAF50', color: 'white', padding: '10px 15px' }}
            >
              {loading ? 'Populating...' : 'Populate Database'}
            </button>
          </div>

          {message && <p><strong>{message}</strong></p>}
        </div>

        <div>
          <button onClick={() => navigate('/')}>Back to Login</button>
        </div>
      </div>
    </div>
  );
}
