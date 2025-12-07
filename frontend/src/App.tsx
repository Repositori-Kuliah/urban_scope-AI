import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMap, FiFileText, FiBarChart2, FiActivity, FiMenu, FiX, FiMessageCircle } from 'react-icons/fi';
import Dashboard from './components/Dashboard';
import InputForm from './components/InputForm';
import Analytics from './components/Analytics';
import AIChat from './components/AIChat';
import FacilitySearch from './components/FacilitySearch';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FiMap },
    { id: 'input', label: 'Submit Report', icon: FiFileText },
    { id: 'analytics', label: 'Analytics', icon: FiBarChart2 },
  ];

  return (
    <div className="min-h-screen pb-20 relative bg-slate-900 text-white font-sans selection:bg-primary-500/30">
      {/* Navbar Fixed Top */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-white/10 h-16 sm:h-20 transition-all">
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          
          {/* Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:shadow-primary-500/40 transition-shadow">
              <FiActivity className="text-white text-lg sm:text-xl" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent tracking-tight leading-tight">UrbanScope AI</h1>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">Smart Urban Analysis</p>
            </div>
          </div>

          {/* Search Bar - Center (Hidden on Mobile) */}
          <div className="hidden md:block flex-1 max-w-md mx-6">
            <FacilitySearch />
          </div>

          {/* Navigation Items (Desktop) */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 text-sm font-medium ${
                  activeTab === item.id
                    ? 'bg-primary-500/10 text-primary-400 border border-primary-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <item.icon className="text-lg" />
                {item.label}
              </button>
            ))}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-3">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-slate-900 border-b border-white/10 overflow-hidden absolute w-full"
            >
              <div className="p-4 space-y-4">
                <div className="mb-4">
                    <FacilitySearch />
                </div>
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all ${
                      activeTab === item.id
                        ? 'bg-primary-500/20 text-white border border-primary-500/30'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <item.icon className="text-lg" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main Content Area */}
      <main className="container mx-auto px-4 pt-20 sm:pt-24 z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'input' && <InputForm />}
            {activeTab === 'analytics' && <Analytics />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Chat Floating Action Button */}
      <motion.button
        onClick={() => setChatOpen(!chatOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 transition-all z-40 text-white"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {chatOpen ? <FiX size={24} /> : <FiMessageCircle size={28} />}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {chatOpen && <AIChat onClose={() => setChatOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}

export default App;