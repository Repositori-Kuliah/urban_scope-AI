import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiCheck, FiLoader, FiMessageSquare, FiHash } from 'react-icons/fi';
import { GoogleGenAI, Type } from "@google/genai";

const InputForm = () => {
  const [regionId, setRegionId] = useState('');
  const [text, setText] = useState('');
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | null>(null);
  const [result, setResult] = useState<any>(null);
  
  const regions = [
      { id: 1, name: 'Central District' },
      { id: 2, name: 'North Bay' },
      { id: 3, name: 'West Hills' },
      { id: 4, name: 'East Industrial' },
      { id: 5, name: 'South Suburbs' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
        if (!process.env.API_KEY) {
             // Fallback mock for demo if no key
             setTimeout(() => {
                setResult({
                    sentiment: 'Negative',
                    topic: 'Infrastructure',
                    priority: 'High'
                });
                setStatus('success');
                setTimeout(() => { setText(''); setRegionId(''); setStatus(null); setResult(null); }, 6000);
            }, 2000);
            return;
        }

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Analyze this citizen report regarding urban issues.
            Report: "${text}"
            
            Determine the sentiment, a general topic (e.g., Infrastructure, Health, Safety, Transport), and a priority level (High, Medium, Low).`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        sentiment: { type: Type.STRING, description: "Positive, Negative, or Neutral" },
                        topic: { type: Type.STRING },
                        priority: { type: Type.STRING, description: "High, Medium, or Low" }
                    }
                }
            }
        });

        if (response.text) {
            setResult(JSON.parse(response.text));
            setStatus('success');
            setTimeout(() => { setText(''); setRegionId(''); setStatus(null); setResult(null); }, 6000);
        } else {
            throw new Error("No response from AI");
        }

    } catch (error) {
        console.error("AI Analysis Failed:", error);
        setStatus('error');
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6">
        
      {/* Main Card Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
      >
        {/* Background Glow Effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

        {/* Header Section */}
        <div className="text-center mb-8 relative z-10">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-primary-500/25">
            <FiMessageSquare className="text-white text-3xl" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Submit Citizen Report</h2>
          <p className="text-slate-400 text-sm sm:text-base">Report issues or provide feedback for your region</p>
        </div>

        {/* Success/Analysis Result Panel */}
        <AnimatePresence>
          {status === 'success' && result && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-slate-800/80 border border-primary-500/30 rounded-2xl p-5 mb-6 overflow-hidden relative"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary-500 to-accent-500"></div>
              <div className="flex items-start gap-4">
                <div className="bg-green-500/20 p-2 rounded-full mt-1">
                    <FiCheck className="text-green-400 text-lg" />
                </div>
                <div>
                  <p className="text-white font-semibold text-lg">Analysis Complete</p>
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div className="bg-slate-900/50 p-2 rounded-lg border border-white/5">
                        <span className="text-slate-400 block text-xs uppercase">Sentiment</span>
                        <span className={`font-bold ${result.sentiment === 'Negative' ? 'text-red-400' : 'text-green-400'}`}>{result.sentiment}</span>
                    </div>
                    <div className="bg-slate-900/50 p-2 rounded-lg border border-white/5">
                        <span className="text-slate-400 block text-xs uppercase">Topic</span>
                        <span className="text-primary-400 font-bold">{result.topic}</span>
                    </div>
                    <div className="bg-slate-900/50 p-2 rounded-lg border border-white/5">
                        <span className="text-slate-400 block text-xs uppercase">Priority</span>
                        <span className="text-yellow-400 font-bold">{result.priority}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          
          {/* Region Select */}
          <div>
            <label className="flex items-center gap-2 text-primary-400 font-semibold mb-2 text-sm uppercase tracking-wide">
              <FiHash /> Select Region
            </label>
            <div className="relative">
                <select
                 value={regionId}
                 onChange={(e) => setRegionId(e.target.value)}
                 className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3.5 text-white appearance-none focus:outline-none focus:border-primary-500 transition-colors"
                 required
                >
                  <option value="" className="text-slate-500">-- Select --</option>
                  {regions.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                </div>
            </div>
          </div>

          {/* Report Text Area */}
          <div>
            <label className="flex items-center gap-2 text-primary-400 font-semibold mb-2 text-sm uppercase tracking-wide">
              <FiMessageSquare /> Report Details
            </label>
            <textarea 
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-primary-500 transition-colors h-32 resize-none"
              placeholder="Describe the issue or feedback..."
              required
            />
          </div>

          <motion.button 
            type="submit" 
            disabled={status === 'loading'}
            className="w-full bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {status === 'loading' ? (
              <>
                <FiLoader className="animate-spin" /> Analyzing...
              </>
            ) : (
              <>
                <FiSend /> Submit Report
              </>
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default InputForm;