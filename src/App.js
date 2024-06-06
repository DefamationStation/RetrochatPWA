import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ChatHistory from './components/ChatHistory';
import ChatInput from './components/ChatInput';
import Settings from './components/Settings';
import './App.css';

const App = () => {
  const [messages, setMessages] = useState([]);
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [serverAddress, setServerAddress] = useState('http://127.0.0.1:8080');

  // Load chat history and server address from local storage
  useEffect(() => {
    const savedChats = localStorage.getItem('chats');
    const savedAddress = localStorage.getItem('serverAddress');
    if (savedChats) {
      const parsedChats = JSON.parse(savedChats);
      setChats(parsedChats);
      setCurrentChat(parsedChats.length > 0 ? 0 : null);
      setMessages(parsedChats.length > 0 ? parsedChats[0].messages : []);
    }
    if (savedAddress) {
      setServerAddress(savedAddress);
    }
  }, []);

  // Save chat history to local storage whenever it changes
  useEffect(() => {
    if (chats.length > 0) {
      localStorage.setItem('chats', JSON.stringify(chats));
    }
  }, [chats]);

  const getBotResponse = async (message) => {
    const fullChat = [...messages, { sender: 'user', text: message }].map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text
    }));

    const response = await axios.post(`${serverAddress}/v1/chat/completions`, {
      messages: fullChat,
    });

    return response.data.choices[0].message.content;
  };

  const handleSend = async (message) => {
    if (currentChat !== null) {
      let botMessage = '';
      try {
        botMessage = await getBotResponse(message);
      } catch (error) {
        console.error('Error communicating with the API:', error);
      }
  
      setChats((prevChats) => {
        const updatedChats = [...prevChats];
        const currentChatMessages = updatedChats[currentChat].messages;
        currentChatMessages.push({ sender: 'user', text: message });
        if (botMessage) {
          currentChatMessages.push({ sender: 'bot', text: botMessage });
        }
        return updatedChats;
      });
    }
  };
  
  useEffect(() => {
    if (currentChat !== null) {
      setMessages(chats[currentChat].messages);
    }
  }, [chats, currentChat]);

  const handleNewChat = () => {
    const newChat = { id: chats.length, messages: [] };
    setChats((prevChats) => [...prevChats, newChat]);
    setCurrentChat(newChat.id);
    setMessages([]);
  };

  const handleSelectChat = (chatId) => {
    setCurrentChat(chatId);
    setMessages(chats[chatId].messages);
  };

  return (
    <div className="app">
      <div className="sidebar">
        <button onClick={handleNewChat}>New Chat</button>
        <button onClick={() => setShowSettings(true)}>Settings</button>
        <ChatHistory chats={chats} onSelectChat={handleSelectChat} />
      </div>
      <div className="main">
        <div className="chat-window">
          {currentChat !== null && (
            <>
              {messages.map((message, index) => (
                <div key={index} className={`message ${message.sender}`}>
                  {message.text}
                </div>
              ))}
            </>
          )}
        </div>
        <ChatInput onSend={handleSend} />
      </div>
      {showSettings && (
        <Settings
          onClose={() => setShowSettings(false)}
          onSave={(newAddress) => setServerAddress(newAddress)}
        />
      )}
    </div>
  );
};

export default App;
