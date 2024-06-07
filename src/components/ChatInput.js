import React, { useState } from 'react';
import './ChatInput.css'; // Import the CSS file for styling

const ChatInput = ({ onSend }) => {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim()) { // Avoid sending empty messages
      onSend(input);
      setInput('');
    }
  };

  return (
    <div className="chat-input">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        placeholder="Type your message..." // Placeholder text for the input
      />
      <button onClick={handleSend}>Send</button>
    </div>
  );
};

export default ChatInput;
