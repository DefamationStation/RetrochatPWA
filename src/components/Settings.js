// Settings.js
import React, { useState, useEffect } from 'react';
import './Settings.css';

const Settings = ({ onClose, onSave }) => {
  const [serverAddress, setServerAddress] = useState('');
  const [temperature, setTemperature] = useState(1.0);
  const [repetitionPenalty, setRepetitionPenalty] = useState(1.0);

  useEffect(() => {
    const savedAddress = localStorage.getItem('serverAddress');
    const savedTemperature = localStorage.getItem('temperature');
    const savedRepetitionPenalty = localStorage.getItem('repetitionPenalty');

    if (savedAddress) setServerAddress(savedAddress);
    if (savedTemperature) setTemperature(parseFloat(savedTemperature));
    if (savedRepetitionPenalty) setRepetitionPenalty(parseFloat(savedRepetitionPenalty));
  }, []);

  const handleSave = () => {
    localStorage.setItem('serverAddress', serverAddress);
    localStorage.setItem('temperature', temperature);
    localStorage.setItem('repetitionPenalty', repetitionPenalty);
    onSave({ serverAddress, temperature, repetitionPenalty });
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
      <label>
        Temperature:
        <input
          type="number"
          value={temperature}
          step="0.1"
          min="0"
          max="2"
          onChange={(e) => setTemperature(parseFloat(e.target.value))}
        />
      </label>
      <label>
        Repetition Penalty:
        <input
          type="number"
          value={repetitionPenalty}
          step="0.1"
          min="0.1"
          max="2"
          onChange={(e) => setRepetitionPenalty(parseFloat(e.target.value))}
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
