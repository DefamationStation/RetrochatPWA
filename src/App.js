import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import axios from 'axios';
import ChatHistory from './components/ChatHistory';
import ChatInput from './components/ChatInput';
import Settings from './components/Settings';
import { FaTrash } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './App.css';

const App = () => {
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [serverAddress, setServerAddress] = useState('http://127.0.0.1:8080');
  const chatWindowRef = useRef(null);
  const prevMessagesRef = useRef([]);
  const scrollPositionsRef = useRef({}); // To store scroll positions for each chat

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

  useLayoutEffect(() => {
    if (chatWindowRef.current && currentChatId !== null) {
      // Restore the scroll position for the current chat
      const savedScrollPosition = scrollPositionsRef.current[currentChatId];
      if (savedScrollPosition !== undefined) {
        chatWindowRef.current.scrollTop = savedScrollPosition;
      } else {
        chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
      }

      const currentMessages = chats[currentChatId]?.messages || [];
      prevMessagesRef.current = currentMessages;
    }
  }, [currentChatId, chats]);

  const handleDeleteChat = () => {
    if (currentChatId !== null) {
      setChats(prevChats => {
        const updatedChats = prevChats.filter(chat => chat.id !== currentChatId);
        localStorage.setItem('chats', JSON.stringify(updatedChats));
        return updatedChats;
      });
      setCurrentChatId(prevChats => (prevChats.length > 0 ? prevChats[0].id : null));
    }
  };

  const getBotResponse = async (message) => {
    if (currentChatId === null || !chats[currentChatId]) return;

    const fullChat = [
      ...chats[currentChatId].messages,
      { sender: 'user', text: message }
    ].map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text
    }));

    try {
      const response = await axios.post(`${serverAddress}/v1/chat/completions`, {
        messages: fullChat,
      });

      const botMessage = response.data.choices[0].message.content;

      setChats(prevChats => {
        const updatedChats = [...prevChats];
        const currentChat = updatedChats[currentChatId];

        const lastMessage = currentChat.messages.slice(-1)[0];
        if (lastMessage && lastMessage.text === botMessage && lastMessage.sender === 'bot') {
          return prevChats;
        }

        currentChat.messages.push({ sender: 'bot', text: botMessage });

        localStorage.setItem('chats', JSON.stringify(updatedChats));

        return updatedChats;
      });

    } catch (error) {
      console.error('Error communicating with the API:', error);
    }
  };

  const handleSend = async (message) => {
    if (currentChatId !== null && chats[currentChatId]) {
      setChats(prevChats => {
        const updatedChats = [...prevChats];
        updatedChats[currentChatId].messages.push({ sender: 'user', text: message });
        return updatedChats;
      });

      try {
        await getBotResponse(message);
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
    // Save the current scroll position before switching
    if (chatWindowRef.current) {
      scrollPositionsRef.current[currentChatId] = chatWindowRef.current.scrollTop;
    }
    setCurrentChatId(chatId);
  };

  return (
    <div className="app">
      <div className="sidebar">
        <button onClick={handleNewChat}>New Chat</button>
        <button onClick={() => setShowSettings(true)}>Settings</button>
        <FaTrash onClick={handleDeleteChat} />
        <ChatHistory chats={chats} onSelectChat={handleSelectChat} />
      </div>
      <div className="main">
        <div className="chat-window" ref={chatWindowRef}>
          {currentChatId !== null && chats[currentChatId] && (
            chats[currentChatId].messages.map((message, index) => (
              <div key={index} className={`message ${message.sender}`}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {message.text}
                </ReactMarkdown>
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
