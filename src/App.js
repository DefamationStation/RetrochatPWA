import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ChatHistory from './components/ChatHistory';
import ChatInput from './components/ChatInput';
import Settings from './components/Settings';
import './App.css';

const App = () => {
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [serverAddress, setServerAddress] = useState('http://127.0.0.1:8080');

  // Load chat history and server address from local storage
  useEffect(() => {
    const savedChats = localStorage.getItem('chats');
    const savedAddress = localStorage.getItem('serverAddress');
    if (savedChats) {
      const parsedChats = JSON.parse(savedChats);
      setChats(parsedChats);
      setCurrentChatId(parsedChats.length > 0 ? 0 : null);
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
    const fullChat = [
      ...chats[currentChatId].messages,
      { sender: 'user', text: message }
    ].map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text
    }));

    const response = await axios.post(`${serverAddress}/v1/chat/completions`, {
      messages: fullChat,
    });

    return response.data.choices[0].message.content;
  };

  const handleSend = async (message) => {
    if (currentChatId !== null) {
        // Immediately update the UI to show the user's message
        setChats(prevChats => {
            const updatedChats = [...prevChats];
            updatedChats[currentChatId].messages.push({ sender: 'user', text: message });
            return updatedChats;
        });

        try {
            // Get the response from the bot
            const botMessage = await getBotResponse(message);

            // Update the UI to show the bot's response, ensuring we do not add it if already added
            setChats(prevChats => {
                // Check to ensure no duplicate responses
                const lastMessage = prevChats[currentChatId].messages.slice(-1)[0];
                if (lastMessage && lastMessage.text === botMessage && lastMessage.sender === 'bot') {
                    return prevChats;
                }

                const updatedChats = [...prevChats];
                updatedChats[currentChatId].messages.push({ sender: 'bot', text: botMessage });
                return updatedChats;
            });
        } catch (error) {
            console.error('Error communicating with the API:', error);
        }
    }
};


  const handleNewChat = () => {
    const newChat = { id: chats.length, messages: [] };
    setChats((prevChats) => {
      const updatedChats = [...prevChats, newChat];
      localStorage.setItem('chats', JSON.stringify(updatedChats));
      return updatedChats;
    });
    setCurrentChatId(newChat.id);
  };

  const handleSelectChat = (chatId) => {
    setCurrentChatId(chatId);
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
          {currentChatId !== null && (
            chats[currentChatId].messages.map((message, index) => (
              <div key={index} className={`message ${message.sender}`}>
                {message.text}
              </div>
            ))
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
