import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiCheck, FiAlertCircle, FiLoader, FiMessageSquare, FiHash } from 'react-icons/fi';

const InputForm = () => {
  const [regionId, setRegionId] = useState('');
  const [text, setText] = useState('');
  const [status, setStatus] = useState(null);
  const [result, setResult] = useState(null);
  const [regions, setRegions] = useState([]);

  useEffect(() => {
    axios.get('/api/dashboard/stats')
      .then(res => {
        setRegions(res.data.map((r) => ({ id: r.id, name: r.region })));
      })
      .catch(err => console.error(err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const response = await axios.post('/api/reviews/', {
        region_id: parseInt(regionId),
        text: text
      });

      setResult(response.data);
      setStatus('success');
      setTimeout(() => {
        setText('');
        setRegionId('');
        setStatus(null);
        setResult(null);
      }, 5000);
    } catch (error) {
      console.error("Failed to submit report:", error);
      setStatus('error');
      setTimeout(() => setStatus(null), 3000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-2 sm:px-0 pt-2">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card-solid p-4 sm:p-8"
      >
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <FiMessageSquare className="text-white text-xl sm:text-2xl" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Submit Citizen Report</h2>
          <p className="text-white/60 text-sm sm:text-base">Report issues or provide feedback for your region</p>
        </div>

        <AnimatePresence>
          {status === 'success' && result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-green-500/20 border border-green-500/30 rounded-xl p-4 mb-6"
            >
              <div className="flex items-start gap-3">
                <FiCheck className="text-green-400 text-xl flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-green-400 font-semibold">Report successfully analyzed by AI!</p>
                  <div className="mt-2 text-white/70 text-sm">
                    <p>Sentiment: <span className={`font-bold ${
                      result.sentiment === 'Positive' ? 'text-green-400' :
                      result.sentiment === 'Negative' ? 'text-red-400' :
                      'text-yellow-400'
                    }`}>{result.sentiment}</span></p>
                    <p>Topic: <span className="font-bold text-primary-400">{result.topic}</span></p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-6"
            >
              <div className="flex items-center gap-3">
                <FiAlertCircle className="text-red-400 text-xl" />
                <p className="text-red-400 text-sm sm:text-base">Failed to submit data. Please ensure the backend is running.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          <div>
            <label className="flex items-center gap-2 text-white/80 font-medium mb-2 sm:mb-3 text-sm sm:text-base">
              <FiHash className="text-primary-400" />
              Select Region
            </label>
            <select
              value={regionId}
              onChange={(e) => setRegionId(e.target.value)}
              className="input-field text-sm sm:text-base"
              required
            >
              <option value="" className="bg-slate-800">-- Select Region --</option>
              {regions.map((r) => (
                <option key={r.id} value={r.id} className="bg-slate-800">
                  {r.id}. {r.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-white/40 mt-2">Select the region where the issue is located</p>
          </div>

          <div>
            <label className="flex items-center gap-2 text-white/80 font-medium mb-2 sm:mb-3 text-sm sm:text-base">
              <FiMessageSquare className="text-primary-400" />
              Report / Feedback
            </label>
            <textarea 
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="input-field h-28 sm:h-32 resize-none text-sm sm:text-base"
              placeholder="Example: The road in front of the market is severely damaged and often congested during rush hour..."
              required
            />
            <p className="text-xs text-white/40 mt-2">Describe the issue in detail for more accurate analysis</p>
          </div>

          <motion.button 
            type="submit" 
            disabled={status === 'loading'}
            className="btn-primary w-full flex items-center justify-center gap-2 text-sm sm:text-base"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {status === 'loading' ? (
              <>
                <FiLoader className="animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <FiSend />
                Submit Report
              </>
            )}
          </motion.button>
        </form>

        <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-white/5 rounded-xl border border-white/10">
          <h4 className="text-white/80 font-medium mb-2 text-sm sm:text-base">How Does AI Analyze?</h4>
          <ul className="text-white/50 text-xs sm:text-sm space-y-1">
            <li>1. Sentiment analysis to detect urgency level</li>
            <li>2. Automatic topic extraction (Infrastructure, Health, Education)</li>
            <li>3. Priority score calculation based on multi-criteria</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
};

export default InputForm;
