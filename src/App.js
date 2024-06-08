import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import ChatHistory from './components/ChatHistory';
import ChatInput from './components/ChatInput';
import Settings from './components/Settings';
import { FaTrash, FaEdit } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './App.css';

const renderMessage = (message) => (
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    components={{
      code({ node, inline, className, children, ...props }) {
        const match = /language-(\w+)/.exec(className || '')
        return !inline && match ? (
          <SyntaxHighlighter
            style={dracula}
            language={match[1]}
            PreTag="div"
            {...props}
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        ) : (
          <code className={className} {...props}>
            {children}
          </code>
        )
      }
    }}
  >
    {message.text}
  </ReactMarkdown>
);

const App = () => {
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [serverAddress, setServerAddress] = useState('http://127.0.0.1:8080');
  const [editChatNameId, setEditChatNameId] = useState(null);
  const [newChatName, setNewChatName] = useState('');
  const chatWindowRef = useRef(null);

  useEffect(() => {
    const savedChats = localStorage.getItem('chats');
    const savedAddress = localStorage.getItem('serverAddress');
    const savedCurrentChatId = localStorage.getItem('currentChatId');

    if (savedChats) {
      const parsedChats = JSON.parse(savedChats);
      setChats(parsedChats);

      if (savedCurrentChatId !== null) {
        const parsedChatId = JSON.parse(savedCurrentChatId);
        setCurrentChatId(parsedChatId);
      } else {
        setCurrentChatId(parsedChats.length > 0 ? parsedChats[0].id : null);
      }
    }

    if (savedAddress) {
      setServerAddress(savedAddress);
    }
  }, []);

  useEffect(() => {
    if (currentChatId !== null) {
      localStorage.setItem('currentChatId', JSON.stringify(currentChatId));
    }
  }, [currentChatId]);

  useLayoutEffect(() => {
    if (chatWindowRef.current && currentChatId !== null && chats.find(chat => chat.id === currentChatId)) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [chats, currentChatId]);

  const handleDeleteChat = (chatId) => {
    setChats(prevChats => {
      const updatedChats = prevChats.filter(chat => chat.id !== chatId);
      localStorage.setItem('chats', JSON.stringify(updatedChats));
      if (currentChatId === chatId) {
        setCurrentChatId(updatedChats.length > 0 ? updatedChats[0].id : null);
      }
      return updatedChats;
    });
  };

  const getBotResponse = async (message) => {
    if (currentChatId === null || !chats.find(chat => chat.id === currentChatId)) return;

    const currentChat = chats.find(chat => chat.id === currentChatId);
    const fullChat = [
      ...currentChat.messages,
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
        const updatedChats = prevChats.map(chat => {
          if (chat.id === currentChatId) {
            return {
              ...chat,
              messages: [
                ...chat.messages,
                { sender: 'bot', text: botMessage }
              ]
            };
          }
          return chat;
        });

        localStorage.setItem('chats', JSON.stringify(updatedChats));
        return updatedChats;
      });

      if (chatWindowRef.current) {
        setTimeout(() => {
          chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
        }, 0);
      }

    } catch (error) {
      console.error('Error communicating with the API:', error);
    }
  };

  const handleSend = async (message) => {
    if (currentChatId !== null && chats.find(chat => chat.id === currentChatId)) {
      setChats(prevChats => {
        const updatedChats = prevChats.map(chat => {
          if (chat.id === currentChatId) {
            return {
              ...chat,
              messages: [...chat.messages, { sender: 'user', text: message }]
            };
          }
          return chat;
        });
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
    const newChat = { id: uuidv4(), name: `Chat ${chats.length + 1}`, messages: [] };
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

  const handleRenameChat = (chatId) => {
    const chat = chats.find(chat => chat.id === chatId);
    if (chat) {
      setEditChatNameId(chatId);
      setNewChatName(chat.name);
    }
  };

  const handleSaveChatName = () => {
    setChats(prevChats => {
      const updatedChats = prevChats.map(chat => {
        if (chat.id === editChatNameId) {
          return { ...chat, name: newChatName };
        }
        return chat;
      });
      localStorage.setItem('chats', JSON.stringify(updatedChats));
      return updatedChats;
    });
    setEditChatNameId(null);
    setNewChatName('');
  };

  const handleCancelRename = () => {
    setEditChatNameId(null);
    setNewChatName('');
  };

  return (
    <div className="app">
      <div className="sidebar">
        <button onClick={handleNewChat}>New Chat</button>
        <button onClick={() => setShowSettings(true)}>Settings</button>
        <FaTrash onClick={() => handleDeleteChat(currentChatId)} /> {/* Delete button in sidebar */}
        <ChatHistory
          chats={chats}
          onSelectChat={handleSelectChat}
          currentChatId={currentChatId}
          onRenameChat={handleRenameChat}
          onDeleteChat={handleDeleteChat} // Pass the delete handler to ChatHistory
        />
      </div>
      <div className="main">
        <div className="chat-window" ref={chatWindowRef}>
          {currentChatId !== null && chats.find(chat => chat.id === currentChatId) && (
            chats.find(chat => chat.id === currentChatId).messages.map((message, index) => (
              <div key={index} className={`message ${message.sender}`}>
                {renderMessage(message)}
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
      {editChatNameId !== null && (
        <div className="rename-modal">
          <input
            type="text"
            value={newChatName}
            onChange={(e) => setNewChatName(e.target.value)}
          />
          <button onClick={handleSaveChatName}>Save</button>
          <button onClick={handleCancelRename}>Cancel</button>
        </div>
      )}
    </div>
  );
};

export default App;
