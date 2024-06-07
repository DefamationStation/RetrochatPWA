import React, { useState, useEffect } from 'react';
import './Settings.css'; // Import the CSS file for styling

const Settings = ({ onClose, onSave }) => {
  const [serverAddress, setServerAddress] = useState('');

  useEffect(() => {
    const savedAddress = localStorage.getItem('serverAddress');
    if (savedAddress) {
      setServerAddress(savedAddress);
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('serverAddress', serverAddress);
    onSave(serverAddress);
    onClose();
  };

  return (
    <div className="settings">
      <h2>Settings</h2>
      <label>
        Server Address:
        <input
          type="text"
          value={serverAddress}
          onChange={(e) => setServerAddress(e.target.value)}
          placeholder="http://127.0.0.1:8080"
        />
      </label>
      <div className="settings-buttons">
        <button onClick={handleSave}>Save</button>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default Settings;
