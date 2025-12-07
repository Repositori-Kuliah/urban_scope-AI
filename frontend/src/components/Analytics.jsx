import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiPieChart, FiActivity, FiRefreshCw } from 'react-icons/fi';
import { Radar, PolarArea } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, RadialLinearScale, Filler, ArcElement } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, RadialLinearScale, Filler, ArcElement);

const Analytics = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const response = await axios.get('/api/dashboard/stats');
      setData(response.data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/70 text-lg">Loading Analytics...</p>
        </div>
      </div>
    );
  }

  const radarData = {
    labels: data.map(d => d.region),
    datasets: [
      {
        label: 'Need Score',
        data: data.map(d => d.score),
        backgroundColor: 'rgba(14, 165, 233, 0.2)',
        borderColor: 'rgb(14, 165, 233)',
        pointBackgroundColor: 'rgb(14, 165, 233)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(14, 165, 233)',
      },
      {
        label: 'Facilities (Normalized)',
        data: data.map(d => Math.min(1, d.facility_count / 10)),
        backgroundColor: 'rgba(217, 70, 239, 0.2)',
        borderColor: 'rgb(217, 70, 239)',
        pointBackgroundColor: 'rgb(217, 70, 239)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(217, 70, 239)',
      }
    ]
  };

  const polarData = {
    labels: data.map(d => d.region),
    datasets: [{
      data: data.map(d => d.review_count),
      backgroundColor: [
        'rgba(239, 68, 68, 0.7)',
        'rgba(251, 191, 36, 0.7)',
        'rgba(34, 197, 94, 0.7)',
        'rgba(14, 165, 233, 0.7)',
        'rgba(217, 70, 239, 0.7)',
      ],
      borderColor: [
        'rgb(239, 68, 68)',
        'rgb(251, 191, 36)',
        'rgb(34, 197, 94)',
        'rgb(14, 165, 233)',
        'rgb(217, 70, 239)',
      ],
      borderWidth: 2,
    }]
  };

  const avgScore = (data.reduce((sum, d) => sum + d.score, 0) / data.length).toFixed(2);
  const mostUrgent = [...data].sort((a, b) => b.score - a.score)[0];

  return (
    <div className="space-y-4 sm:space-y-6 pt-2">
      <motion.div 
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">Analytics Dashboard</h2>
          <p className="text-white/60 text-sm sm:text-base">In-depth visualization of regional analysis data</p>
        </div>
        <button onClick={fetchData} className="btn-secondary flex items-center justify-center gap-2 w-full sm:w-auto">
          <FiRefreshCw /> Refresh
        </button>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <motion.div
          className="stat-card-solid"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary-500 to-cyan-500 flex items-center justify-center mb-2 sm:mb-3">
            <FiActivity className="text-white text-lg sm:text-xl" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white">{avgScore}</p>
          <p className="text-white/50 text-xs sm:text-sm">Average Need Score</p>
        </motion.div>

        <motion.div
          className="stat-card-solid"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center mb-2 sm:mb-3">
            <FiTrendingUp className="text-white text-lg sm:text-xl" />
          </div>
          <p className="text-lg sm:text-xl font-bold text-white truncate">{mostUrgent?.region || '-'}</p>
          <p className="text-white/50 text-xs sm:text-sm">Most Urgent Region</p>
        </motion.div>

        <motion.div
          className="stat-card-solid"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-2 sm:mb-3">
            <FiPieChart className="text-white text-lg sm:text-xl" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white">{data.length}</p>
          <p className="text-white/50 text-xs sm:text-sm">Monitored Regions</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <motion.div
          className="glass-card-solid p-4 sm:p-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FiActivity className="text-primary-400" />
            Regional Analysis Radar
          </h3>
          <div className="h-64 sm:h-72">
            <Radar 
              data={radarData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  r: {
                    angleLines: { color: 'rgba(255,255,255,0.1)' },
                    grid: { color: 'rgba(255,255,255,0.1)' },
                    pointLabels: { color: 'rgba(255,255,255,0.7)', font: { size: 10 } },
                    ticks: { 
                      backdropColor: 'transparent',
                      color: 'rgba(255,255,255,0.5)'
                    }
                  }
                },
                plugins: {
                  legend: {
                    labels: { color: 'rgba(255,255,255,0.7)', font: { size: 11 } }
                  }
                }
              }}
            />
          </div>
        </motion.div>

        <motion.div
          className="glass-card-solid p-4 sm:p-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FiPieChart className="text-accent-400" />
            Review Distribution by Region
          </h3>
          <div className="h-64 sm:h-72">
            <PolarArea 
              data={polarData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  r: {
                    grid: { color: 'rgba(255,255,255,0.1)' },
                    ticks: { 
                      backdropColor: 'transparent',
                      color: 'rgba(255,255,255,0.5)'
                    }
                  }
                },
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: { color: 'rgba(255,255,255,0.7)', padding: 10, font: { size: 10 } }
                  }
                }
              }}
            />
          </div>
        </motion.div>
      </div>

      <motion.div
        className="glass-card-solid p-4 sm:p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="text-lg sm:text-xl font-bold text-white mb-4">Detailed Regional Analysis</h3>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-3 sm:px-4 text-white/70 font-medium text-sm">Region</th>
                <th className="text-center py-3 px-3 sm:px-4 text-white/70 font-medium text-sm">Score</th>
                <th className="text-center py-3 px-3 sm:px-4 text-white/70 font-medium text-sm">Priority</th>
                <th className="text-center py-3 px-3 sm:px-4 text-white/70 font-medium text-sm">Reviews</th>
                <th className="text-center py-3 px-3 sm:px-4 text-white/70 font-medium text-sm">Facilities</th>
                <th className="text-left py-3 px-3 sm:px-4 text-white/70 font-medium text-sm">Recommendation</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-3 sm:px-4 text-white font-medium text-sm">{item.region}</td>
                  <td className="py-3 px-3 sm:px-4 text-center">
                    <span className={`font-bold text-sm ${
                      item.score > 0.7 ? 'text-red-400' :
                      item.score > 0.4 ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>{item.score}</span>
                  </td>
                  <td className="py-3 px-3 sm:px-4 text-center">
                    <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-bold ${
                      item.priority === 'High' ? 'bg-red-500/20 text-red-400' :
                      item.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {item.priority}
                    </span>
                  </td>
                  <td className="py-3 px-3 sm:px-4 text-center text-white/70 text-sm">{item.review_count}</td>
                  <td className="py-3 px-3 sm:px-4 text-center text-white/70 text-sm">{item.facility_count}</td>
                  <td className="py-3 px-3 sm:px-4 text-white/60 text-xs sm:text-sm">{item.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default Analytics;
