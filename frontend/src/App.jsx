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

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'input':
        return <InputForm />;
      case 'analytics':
        return <Analytics />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen">
      <nav className="glass-card-solid fixed top-0 left-0 right-0 z-50 rounded-none">
        <div className="container mx-auto px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center gap-2 sm:gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
                <FiActivity className="text-white text-lg sm:text-xl" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold gradient-text">UrbanScope AI</h1>
                <p className="text-[10px] sm:text-xs text-white/50">Smart Urban Analysis</p>
              </div>
            </motion.div>

            <div className="hidden lg:flex items-center gap-1">
              <FacilitySearch />
            </div>

            <div className="hidden md:flex items-center gap-2">
              {navItems.map((item, index) => (
                <motion.button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 lg:px-4 py-2 rounded-xl transition-all duration-300 ${
                    activeTab === item.id
                      ? 'bg-gradient-to-r from-primary-500/30 to-accent-500/30 text-white border border-primary-500/50'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <item.icon className="text-lg" />
                  <span className="font-medium text-sm lg:text-base">{item.label}</span>
                </motion.button>
              ))}
            </div>

            <button 
              className="md:hidden text-white p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>

          <div className="lg:hidden mt-3">
            <FacilitySearch />
          </div>

          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden mt-4 pt-4 border-t border-white/10"
              >
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl mb-2 transition-all ${
                      activeTab === item.id
                        ? 'bg-gradient-to-r from-primary-500/30 to-accent-500/30 text-white'
                        : 'text-white/70 hover:bg-white/10'
                    }`}
                  >
                    <item.icon className="text-lg" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      <main className="container mx-auto px-2 sm:px-4 pb-8 pt-20 sm:pt-24 lg:pt-28">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      <motion.button
        onClick={() => setChatOpen(!chatOpen)}
        className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center shadow-lg hover:shadow-primary-500/30 transition-all z-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <FiMessageCircle className="text-white text-xl sm:text-2xl" />
      </motion.button>

      <AnimatePresence>
        {chatOpen && <AIChat onClose={() => setChatOpen(false)} />}
      </AnimatePresence>

      <footer className="text-center py-4 sm:py-6 text-white/30 text-xs sm:text-sm">
        <p>UrbanScope AI - Powered by Advanced Analytics</p>
      </footer>
    </div>
  );
}

export default App;
