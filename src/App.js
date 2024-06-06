import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ChatHistory from './components/ChatHistory';
import ChatInput from './components/ChatInput';
import './App.css';

const App = () => {
  const [messages, setMessages] = useState([]);
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);

  // Load chat history from local storage
  useEffect(() => {
    const savedChats = localStorage.getItem('chats');
    if (savedChats) {
      const parsedChats = JSON.parse(savedChats);
      setChats(parsedChats);
      setCurrentChat(parsedChats.length > 0 ? 0 : null);
      setMessages(parsedChats.length > 0 ? parsedChats[0].messages : []);
    }
  }, []);

  // Save chat history to local storage whenever it changes
  useEffect(() => {
    if (chats.length > 0) {
      localStorage.setItem('chats', JSON.stringify(chats));
    }
  }, [chats]);

  const handleSend = async (message) => {
    if (currentChat !== null) {
      setChats((prevChats) => {
        const updatedChats = [...prevChats];
        updatedChats[currentChat].messages.push({ sender: 'user', text: message });
        return updatedChats;
      });

      setMessages((prevMessages) => [...prevMessages, { sender: 'user', text: message }]);

      try {
        const fullChat = [...messages, { sender: 'user', text: message }].map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        }));

        const response = await axios.post('http://127.0.0.1:8080/v1/chat/completions', {
          messages: fullChat,
        });

        const botMessage = response.data.choices[0].message.content;
        setChats((prevChats) => {
          const updatedChats = [...prevChats];
          updatedChats[currentChat].messages.push({ sender: 'bot', text: botMessage });
          return updatedChats;
        });

        setMessages((prevMessages) => [...prevMessages, { sender: 'bot', text: botMessage }]);
      } catch (error) {
        console.error('Error communicating with the API:', error);
      }
    }
  };

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
    </div>
  );
};

export default App;
