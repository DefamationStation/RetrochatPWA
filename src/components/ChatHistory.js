import React from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa'; // Import both icons
import './ChatHistory.css'; // Import the CSS file for styling

const ChatHistory = ({ chats, onSelectChat, currentChatId, onRenameChat, onDeleteChat }) => {
  return (
    <div className="chat-history">
      {chats.map((chat, index) => (
        <div 
          key={index} 
          className={`chat-item ${chat.id === currentChatId ? 'active' : ''}`} 
          onClick={() => onSelectChat(chat.id)}
        >
          <span className="chat-name">
            {chat.name}
          </span>
          <div className="chat-actions">
            <FaEdit className="action-icon" onClick={(e) => { e.stopPropagation(); onRenameChat(chat.id); }} />
            <FaTrash className="action-icon" onClick={(e) => { e.stopPropagation(); onDeleteChat(chat.id); }} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatHistory;
