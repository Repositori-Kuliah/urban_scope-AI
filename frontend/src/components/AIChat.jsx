import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiX, FiSend, FiMessageCircle, FiLoader } from 'react-icons/fi';
import { GoogleGenAI } from "@google/genai";

const AIChat = ({ onClose }) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I am UrbanScope AI. I can help analyze urban data, provide insights on city facilities, or assist with your reports.'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      // Gunakan API Key dari environment variable
      if (process.env.API_KEY) {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [
            {
              role: 'user',
              parts: [{
                text: `You are UrbanScope AI, an expert urban planning assistant for a smart city dashboard. 
                Keep your responses concise, professional, and helpful.
                Context: The user is asking about urban facilities, analytics, or reporting issues.
                
                User Query: ${userMessage}`
              }]
            }
          ]
        });

        const reply = response.text || "I apologize, I couldn't generate a response.";
        setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
      } else {
        // Fallback jika API Key tidak ada (untuk demo/dev tanpa key)
        await new Promise(r => setTimeout(r, 1000));
        setMessages(prev => [...prev, { role: 'assistant', content: "I am in demo mode (No API Key). Please configure VITE_API_KEY to enable live AI responses." }]);
      }
    } catch (error) {
      console.error("Gemini Error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered a connection error. Please try again later." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.95 }}
      className="fixed bottom-24 right-4 sm:right-6 w-[calc(100%-32px)] sm:w-96 h-[500px] max-h-[70vh] glass-card-solid rounded-2xl flex flex-col z-50 overflow-hidden border border-white/20 shadow-2xl"
    >
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-slate-800/90 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-lg">
            <FiMessageCircle className="text-white text-lg" />
          </div>
          <div>
            <h3 className="text-white font-bold">UrbanScope AI</h3>
            <p className="text-primary-300 text-xs font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Online
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <FiX size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-900/50">
        {messages.map((msg, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-md ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-br-sm'
                  : 'bg-slate-700/90 text-slate-100 rounded-bl-sm border border-white/5'
              }`}
            >
              {msg.content}
            </div>
          </motion.div>
        ))}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-slate-700/80 p-3 rounded-2xl rounded-bl-sm border border-white/5">
              <div className="flex items-center gap-2 text-slate-400">
                <FiLoader className="animate-spin" />
                <span className="text-xs font-medium">Thinking...</span>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="p-3 border-t border-white/10 bg-slate-800/90">
        <div className="flex gap-2 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-slate-900/80 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-sm"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="absolute right-2 top-1.5 bottom-1.5 w-10 bg-primary-500 text-white rounded-lg flex items-center justify-center hover:bg-primary-400 transition-colors disabled:opacity-50 disabled:bg-slate-600"
          >
            <FiSend size={16} />
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default AIChat;