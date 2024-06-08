import React from 'react';
import './ChatHistory.css';

const ChatHistory = ({ chats, onSelectChat, currentChatId }) => {
  return (
    <div className="chat-history">
      {chats.map((chat, index) => (
        <div 
          key={index} 
          className={`chat-item ${chat.id === currentChatId ? 'active' : ''}`} 
          onClick={() => onSelectChat(chat.id)}
        >
          {chat.id === currentChatId ? '' : ''} Chat {chat.id + 1}
        </div>
      ))}
    </div>
  );
};

export default ChatHistory;
