import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiX, FiFilter, FiMapPin, FiStar, FiWifi, FiMonitor, FiInfo, FiActivity } from 'react-icons/fi';
import { FaHospital, FaSchool, FaShieldAlt, FaBuilding } from 'react-icons/fa';

// Mock Data for Facilities
const MOCK_FACILITIES = [
    { id: 1, name: 'Cilandak Green Police Station', type: 'Police', region: 'Cilandak Green', rating: 4.2, description: 'Main district police station providing 24/7 security services, community outreach programs, and emergency response units.', technology: ['CCTV', 'Digital Reporting'], stats: { beds: 0, chairs: 45, complaints: 2, reports: 120 } },
    { id: 2, name: 'Cilandak Green School', type: 'School', region: 'Cilandak Green', rating: 3.6, description: 'Public elementary school focusing on environmental awareness.', technology: ['WiFi', 'Smart Boards'], stats: { beds: 5, chairs: 400, complaints: 5, reports: 12 } },
    { id: 3, name: 'Kebayoran Tech Fire Station', type: 'Fire Station', region: 'Kebayoran Tech', rating: 4.6, description: 'Advanced fire response unit equipped with drone technology.', technology: ['Drones', 'Heat Sensors'], stats: { beds: 20, chairs: 15, complaints: 0, reports: 45 } },
    { id: 4, name: 'Kebayoran Tech Hospital', type: 'Hospital', region: 'Kebayoran Tech', rating: 4.7, description: 'State-of-the-art medical facility with specialized trauma center.', technology: ['MRI', 'AI Diagnostics', 'Telemedicine'], stats: { beds: 250, chairs: 500, complaints: 12, reports: 890 } },
    { id: 5, name: 'Kemang Urban Hospital', type: 'Hospital', region: 'Kemang Urban', rating: 4.1, description: 'General hospital serving the greater Kemang area.', technology: ['X-Ray', 'Online Booking'], stats: { beds: 120, chairs: 200, complaints: 23, reports: 450 } },
];

const FacilitySearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<any>(null);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle Search
  useEffect(() => {
    if (query.length > 0) {
      const filtered = MOCK_FACILITIES.filter(f => 
        f.name.toLowerCase().includes(query.toLowerCase()) || 
        f.type.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered);
      setShowDropdown(true);
    } else {
      setResults([]);
      setShowDropdown(false);
    }
  }, [query]);

  // Handle Outside Click for Dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lock Body Scroll when Modal is Open
  useEffect(() => {
    if (selectedFacility) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedFacility]);

  const handleSelect = (facility: any) => {
    setSelectedFacility(facility);
    setShowDropdown(false);
    setQuery('');
  };

  const getIcon = (type: string) => {
    if (type === 'Police') return <FaShieldAlt />;
    if (type === 'Hospital') return <FaHospital />;
    if (type === 'School') return <FaSchool />;
    return <FaBuilding />;
  };

  const getColor = (type: string) => {
    if (type === 'Police') return 'from-indigo-500 to-blue-500';
    if (type === 'Hospital') return 'from-red-500 to-pink-500';
    if (type === 'School') return 'from-green-500 to-emerald-500';
    return 'from-orange-500 to-yellow-500';
  };

  return (
    <>
      <div className="relative w-full" ref={dropdownRef}>
        <div className="relative group">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-400 transition-colors" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search facilities..."
            className="w-full bg-slate-800/50 border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 focus:bg-slate-800 transition-all text-sm"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <FiX />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        <AnimatePresence>
          {showDropdown && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="absolute top-full left-0 right-0 mt-2 bg-slate-800/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
            >
              <div className="p-2 text-xs font-medium text-slate-500 border-b border-white/5">
                Found {results.length} results
              </div>
              <div className="max-h-60 overflow-y-auto custom-scrollbar">
                {results.length > 0 ? results.map(facility => (
                  <button
                    key={facility.id}
                    onClick={() => handleSelect(facility)}
                    className="w-full text-left p-3 hover:bg-white/5 transition-colors flex items-center gap-3 border-b border-white/5 last:border-0"
                  >
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getColor(facility.type)} flex items-center justify-center text-white text-sm shadow-lg`}>
                      {getIcon(facility.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{facility.name}</p>
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <FiMapPin size={10} /> {facility.region}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 bg-green-500/10 px-1.5 py-0.5 rounded text-xs text-green-400 font-bold border border-green-500/20">
                      <FiStar size={10} /> {facility.rating}
                    </div>
                  </button>
                )) : (
                  <div className="p-4 text-center text-slate-500 text-sm">No facilities found.</div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Facility Detail Modal */}
      <AnimatePresence>
        {selectedFacility && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setSelectedFacility(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col relative z-10"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b border-white/10 flex items-start justify-between bg-slate-800/50">
                <div className="flex gap-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getColor(selectedFacility.type)} flex items-center justify-center text-white text-2xl shadow-xl shadow-black/20`}>
                    {getIcon(selectedFacility.type)}
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight">{selectedFacility.name}</h2>
                    <p className="text-slate-400 text-sm mt-1">{selectedFacility.type} • {selectedFacility.region}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedFacility(null)}
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                >
                  <FiX size={20} />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-900">
                
                {/* Description */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
                    {selectedFacility.description}
                  </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: 'Beds', value: selectedFacility.stats.beds, color: 'text-blue-400' },
                      { label: 'Chairs', value: selectedFacility.stats.chairs, color: 'text-purple-400' },
                      { label: 'BPS Complaints', value: selectedFacility.stats.complaints, color: 'text-yellow-400' },
                      { label: 'User Reports', value: selectedFacility.stats.reports, color: 'text-red-400' }
                    ].map((stat, i) => (
                      <div key={i} className="bg-slate-800 p-3 rounded-xl border border-white/5 text-center">
                        <div className={`text-xl sm:text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                        <div className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wide mt-1">{stat.label}</div>
                      </div>
                    ))}
                </div>

                {/* Technology Tags */}
                <div>
                  <h4 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
                    <FiMonitor /> Available Technology
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedFacility.technology.map((tech: string, i: number) => (
                      <span key={i} className="px-3 py-1.5 bg-primary-500/10 border border-primary-500/20 rounded-lg text-primary-400 text-xs font-medium flex items-center gap-1.5">
                        <FiWifi size={12} /> {tech}
                      </span>
                    ))}
                    <span className="px-3 py-1.5 bg-accent-500/10 border border-accent-500/20 rounded-lg text-accent-400 text-xs font-medium flex items-center gap-1.5">
                        <FiActivity size={12} /> Live Monitoring
                    </span>
                  </div>
                </div>

                {/* User Reports Section Mockup */}
                <div>
                    <h4 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
                        <FiInfo /> User Reports
                    </h4>
                    <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5">
                        <div className="flex items-start gap-3 mb-3 pb-3 border-b border-white/5">
                            <div className="px-2 py-0.5 rounded bg-green-500/20 text-green-400 text-xs font-bold">Positive</div>
                            <div className="flex-1">
                                <p className="text-sm text-slate-300">"Public services are responsive and efficient in this facility."</p>
                                <p className="text-xs text-slate-500 mt-1">Infrastructure • 2 hours ago</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="px-2 py-0.5 rounded bg-green-500/20 text-green-400 text-xs font-bold">Positive</div>
                            <div className="flex-1">
                                <p className="text-sm text-slate-300">"Government really takes care of this area, clean and safe."</p>
                                <p className="text-xs text-slate-500 mt-1">General • 5 hours ago</p>
                            </div>
                        </div>
                    </div>
                </div>

              </div>

              {/* Footer */}
              <div className="p-4 border-t border-white/10 bg-slate-800/50 flex justify-end">
                <button 
                  onClick={() => setSelectedFacility(null)}
                  className="px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors text-sm shadow-lg shadow-primary-500/20"
                >
                  Close Details
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FacilitySearch;