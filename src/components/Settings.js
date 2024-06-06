import React, { useState, useEffect } from 'react';

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
        />
      </label>
      <button onClick={handleSave}>Save</button>
      <button onClick={onClose}>Close</button>
    </div>
  );
};

export default Settings;
