import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiX, FiFilter, FiMapPin, FiStar, FiWifi, FiMonitor, FiAlertCircle } from 'react-icons/fi';
import { FaHospital, FaSchool, FaBuilding, FaShieldAlt, FaFireExtinguisher, FaClinicMedical, FaUniversity, FaCity } from 'react-icons/fa';
import axios from 'axios';

const FacilitySearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const searchTimeout = useRef(null);

  const debounceSearch = useCallback((searchQuery) => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    searchTimeout.current = setTimeout(async () => {
      if (searchQuery.length > 0) {
        setLoading(true);
        try {
          const response = await axios.get(`/api/facilities/search`, {
            params: { q: searchQuery, sort_by: sortBy, limit: 20 }
          });
          setResults(response.data);
          setShowDropdown(true);
        } catch (error) {
          console.error('Search error:', error);
          setResults([]);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
        setShowDropdown(false);
      }
    }, 200);
  }, [sortBy]);

  useEffect(() => {
    debounceSearch(query);
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [query, debounceSearch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (showDetailPanel) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showDetailPanel]);

  const fetchFacilityDetail = async (facilityId) => {
    try {
      const response = await axios.get(`/api/facilities/${facilityId}`);
      setSelectedFacility(response.data);
      setShowDetailPanel(true);
      setShowDropdown(false);
      setQuery('');
      setResults([]);
    } catch (error) {
      console.error('Failed to fetch facility details:', error);
    }
  };

  const handleSelectFacility = (facility) => {
    fetchFacilityDetail(facility.id);
  };

  const closeDetailPanel = () => {
    setShowDetailPanel(false);
    setSelectedFacility(null);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  const getFacilityIcon = (type) => {
    const typeLower = type?.toLowerCase() || '';
    if (typeLower.includes('hospital')) return <FaHospital className="text-red-400" size={18} />;
    if (typeLower.includes('school')) return <FaSchool className="text-blue-400" size={18} />;
    if (typeLower.includes('police')) return <FaShieldAlt className="text-indigo-400" size={18} />;
    if (typeLower.includes('fire')) return <FaFireExtinguisher className="text-orange-400" size={18} />;
    if (typeLower.includes('clinic') || typeLower.includes('health')) return <FaClinicMedical className="text-green-400" size={18} />;
    if (typeLower.includes('university') || typeLower.includes('college')) return <FaUniversity className="text-purple-400" size={18} />;
    if (typeLower.includes('office')) return <FaBuilding className="text-cyan-400" size={18} />;
    if (typeLower.includes('government') || typeLower.includes('city')) return <FaCity className="text-yellow-400" size={18} />;
    return <FaBuilding className="text-primary-400" size={18} />;
  };

  const getFacilityIconBg = (type) => {
    const typeLower = type?.toLowerCase() || '';
    if (typeLower.includes('hospital')) return 'from-red-500/30 to-red-600/20';
    if (typeLower.includes('school')) return 'from-blue-500/30 to-blue-600/20';
    if (typeLower.includes('police')) return 'from-indigo-500/30 to-indigo-600/20';
    if (typeLower.includes('fire')) return 'from-orange-500/30 to-orange-600/20';
    if (typeLower.includes('clinic') || typeLower.includes('health')) return 'from-green-500/30 to-green-600/20';
    if (typeLower.includes('university') || typeLower.includes('college')) return 'from-purple-500/30 to-purple-600/20';
    if (typeLower.includes('office')) return 'from-cyan-500/30 to-cyan-600/20';
    if (typeLower.includes('government') || typeLower.includes('city')) return 'from-yellow-500/30 to-yellow-600/20';
    return 'from-primary-500/30 to-accent-500/30';
  };

  const getTechIcon = (tech) => {
    if (tech.includes('WiFi')) return <FiWifi className="text-primary-400" />;
    if (tech.includes('CCTV') || tech.includes('Display')) return <FiMonitor className="text-accent-400" />;
    return <FiStar className="text-yellow-400" />;
  };

  return (
    <>
      <div className="relative w-full lg:w-80" ref={dropdownRef}>
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.length > 0 && setShowDropdown(true)}
            placeholder="Search facilities..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-20 py-2.5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-sm"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {query && (
              <button
                onClick={clearSearch}
                className="p-1.5 text-white/40 hover:text-white transition-colors"
              >
                <FiX size={16} />
              </button>
            )}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-1.5 transition-colors ${showFilters ? 'text-primary-400' : 'text-white/40 hover:text-white'}`}
            >
              <FiFilter size={16} />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full mt-2 right-0 search-dropdown-solid rounded-xl p-3 z-[70] w-48"
            >
              <p className="text-white/60 text-xs mb-2">Sort by:</p>
              <div className="space-y-1">
                {[
                  { value: 'name', label: 'Name' },
                  { value: 'rating', label: 'Rating' },
                  { value: 'complaints', label: 'Least Complaints' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSortBy(option.value);
                      setShowFilters(false);
                      if (query) debounceSearch(query);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      sortBy === option.value
                        ? 'bg-primary-500/30 text-white'
                        : 'text-white/70 hover:bg-white/10'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showDropdown && !showDetailPanel && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full mt-2 left-0 w-full sm:w-[400px] max-h-[60vh] search-dropdown-solid rounded-2xl overflow-hidden z-[60]"
            >
              <div className="p-3 border-b border-white/10">
                <p className="text-white/60 text-sm">
                  {loading ? 'Searching...' : `Found ${results.length} results`}
                </p>
              </div>
              
              <div className="max-h-[50vh] overflow-y-auto custom-scrollbar">
                {results.length === 0 && !loading ? (
                  <div className="p-6 text-center text-white/50">
                    No facilities found
                  </div>
                ) : (
                  <div className="p-2">
                    {results.map((facility) => (
                      <motion.button
                        key={facility.id}
                        onClick={() => handleSelectFacility(facility)}
                        className="w-full text-left p-3 rounded-xl mb-2 transition-all hover:bg-white/5"
                        whileHover={{ x: 4 }}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getFacilityIconBg(facility.type)} flex items-center justify-center flex-shrink-0`}>
                            {getFacilityIcon(facility.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white font-medium text-sm truncate">{facility.name}</h4>
                            <p className="text-white/50 text-xs flex items-center gap-1 mt-0.5">
                              <FiMapPin size={10} /> {facility.region_name}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 bg-green-500/20 px-2 py-1 rounded-lg">
                            <FiStar className="text-green-400" size={12} />
                            <span className="text-green-400 text-xs font-bold">{facility.rating}</span>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showDetailPanel && selectedFacility && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60"
              onClick={closeDetailPanel}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-[600px] max-h-[85vh] overflow-y-auto search-dropdown-solid rounded-2xl custom-scrollbar flex flex-col"
            >
              <div className="p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-5 flex-1 overflow-y-auto">
                <div className="flex items-start justify-between gap-3 sm:gap-4">
                  <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br ${getFacilityIconBg(selectedFacility.type)} flex items-center justify-center flex-shrink-0`}>
                      {getFacilityIcon(selectedFacility.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-white font-bold text-base sm:text-lg md:text-xl break-words">{selectedFacility.name}</h2>
                      <p className="text-white/50 text-xs sm:text-sm mt-1">{selectedFacility.type} in {selectedFacility.region_name}</p>
                    </div>
                  </div>
                  <button
                    onClick={closeDetailPanel}
                    className="p-2 rounded-lg bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
                  >
                    <FiX size={18} className="sm:w-5 sm:h-5" />
                  </button>
                </div>

                <div className="bg-white/5 rounded-xl p-3 sm:p-4">
                  <p className="text-white/80 text-xs sm:text-sm leading-relaxed">{selectedFacility.description}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
                  <div className="bg-white/5 rounded-xl p-3 sm:p-4 text-center">
                    <p className="text-lg sm:text-xl md:text-2xl font-bold text-primary-400">{selectedFacility.bed_count || 0}</p>
                    <p className="text-white/50 text-[10px] sm:text-xs mt-1">Beds</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 sm:p-4 text-center">
                    <p className="text-lg sm:text-xl md:text-2xl font-bold text-accent-400">{selectedFacility.chair_count || 0}</p>
                    <p className="text-white/50 text-[10px] sm:text-xs mt-1">Chairs</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 sm:p-4 text-center">
                    <p className="text-lg sm:text-xl md:text-2xl font-bold text-yellow-400">{selectedFacility.bps_complaints || 0}</p>
                    <p className="text-white/50 text-[10px] sm:text-xs mt-1">BPS Complaints</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 sm:p-4 text-center">
                    <p className="text-lg sm:text-xl md:text-2xl font-bold text-red-400">{selectedFacility.user_complaints || 0}</p>
                    <p className="text-white/50 text-[10px] sm:text-xs mt-1">User Reports</p>
                  </div>
                </div>

                {selectedFacility.available_technology?.length > 0 && (
                  <div>
                    <p className="text-white/60 text-xs sm:text-sm mb-2 sm:mb-3 flex items-center gap-2">
                      <FiWifi size={12} className="sm:w-3.5 sm:h-3.5" /> Available Technology
                    </p>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {selectedFacility.available_technology.map((tech, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 sm:gap-2 bg-primary-500/20 text-primary-300 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm"
                        >
                          {getTechIcon(tech)}
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedFacility.recent_reviews?.length > 0 && (
                  <div>
                    <p className="text-white/60 text-xs sm:text-sm mb-2 sm:mb-3 flex items-center gap-2">
                      <FiAlertCircle size={12} className="sm:w-3.5 sm:h-3.5" /> User Reports
                    </p>
                    <div className="space-y-2 max-h-32 sm:max-h-40 overflow-y-auto custom-scrollbar">
                      {selectedFacility.recent_reviews.slice(0, 5).map((review, idx) => (
                        <div key={idx} className="bg-white/5 rounded-xl p-2 sm:p-3">
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                            <span className={`px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs font-medium ${
                              review.sentiment === 'Positive' ? 'bg-green-500/20 text-green-400' :
                              review.sentiment === 'Negative' ? 'bg-red-500/20 text-red-400' :
                              'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {review.sentiment}
                            </span>
                            <span className="text-white/40 text-[10px] sm:text-xs">{review.topic}</span>
                          </div>
                          <p className="text-white/70 text-xs sm:text-sm">{review.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={closeDetailPanel}
                  className="w-full py-2.5 sm:py-3 bg-primary-500/20 hover:bg-primary-500/30 text-primary-400 font-medium rounded-xl transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <FiX size={14} className="sm:w-4 sm:h-4" />
                  Close
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
