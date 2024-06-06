import React from 'react';

const ChatHistory = ({ chats, onSelectChat }) => {
  return (
    <div className="chat-history">
      {chats.map((chat, index) => (
        <div key={index} className="chat-item" onClick={() => onSelectChat(chat.id)}>
          Chat {chat.id + 1}
        </div>
      ))}
    </div>
  );
};

export default ChatHistory;
