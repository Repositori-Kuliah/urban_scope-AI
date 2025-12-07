import React, { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FiMapPin, FiUsers, FiAlertTriangle, FiCheckCircle, FiTrendingUp, FiRefreshCw } from 'react-icons/fi';
import MapView from './MapView';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const retryCountRef = useRef(0);
  const retryTimeoutRef = useRef(null);
  const maxRetries = 3;

  const fetchData = useCallback(async (isRetry = false) => {
    if (!isRetry) {
      setLoading(true);
      retryCountRef.current = 0;
    }
    
    try {
      const response = await axios.get('/api/dashboard/stats', {
        timeout: 10000
      });
      setData(response.data);
      setError(null);
      retryCountRef.current = 0;
    } catch (err) {
      console.error('Error fetching data:', err);
      
      retryCountRef.current += 1;
      if (retryCountRef.current < maxRetries) {
        const delay = 2000 * retryCountRef.current;
        retryTimeoutRef.current = setTimeout(() => fetchData(true), delay);
        return;
      }
      
      let errorMessage = 'Failed to load data.';
      if (err.code === 'ECONNABORTED') {
        errorMessage = 'Request timed out. Please check your connection.';
      } else if (err.response) {
        errorMessage = `Server error: ${err.response.status}. Please try again.`;
      } else if (err.request) {
        errorMessage = 'Unable to connect to server. Please ensure the backend is running.';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRefresh = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    retryCountRef.current = 0;
    setError(null);
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/70 text-lg">Loading AI Analysis...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card-solid p-8 text-center">
        <FiAlertTriangle className="text-5xl text-red-400 mx-auto mb-4" />
        <p className="text-white/70 text-lg mb-4">{error}</p>
        <button onClick={handleRefresh} className="btn-primary">
          <FiRefreshCw className="inline mr-2" /> Try Again
        </button>
      </div>
    );
  }

  const highPriority = data.filter(d => d.priority === 'High').length;
  const mediumPriority = data.filter(d => d.priority === 'Medium').length;
  const lowPriority = data.filter(d => d.priority === 'Low').length;
  const totalReviews = data.reduce((sum, d) => sum + d.review_count, 0);
  const totalFacilities = data.reduce((sum, d) => sum + d.facility_count, 0);

  const barChartData = {
    labels: data.map(d => d.region),
    datasets: [
      {
        label: 'Need Score',
        data: data.map(d => d.score),
        backgroundColor: data.map(d => 
          d.score > 0.7 ? 'rgba(239, 68, 68, 0.7)' : 
          d.score > 0.4 ? 'rgba(251, 191, 36, 0.7)' : 
          'rgba(34, 197, 94, 0.7)'
        ),
        borderColor: data.map(d => 
          d.score > 0.7 ? 'rgb(239, 68, 68)' : 
          d.score > 0.4 ? 'rgb(251, 191, 36)' : 
          'rgb(34, 197, 94)'
        ),
        borderWidth: 2,
        borderRadius: 8,
      }
    ],
  };

  const doughnutData = {
    labels: ['High Priority', 'Medium Priority', 'Low Priority'],
    datasets: [{
      data: [highPriority, mediumPriority, lowPriority],
      backgroundColor: [
        'rgba(239, 68, 68, 0.8)',
        'rgba(251, 191, 36, 0.8)',
        'rgba(34, 197, 94, 0.8)',
      ],
      borderColor: [
        'rgb(239, 68, 68)',
        'rgb(251, 191, 36)',
        'rgb(34, 197, 94)',
      ],
      borderWidth: 2,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: 'rgba(255,255,255,0.7)' }
      }
    },
    scales: {
      x: {
        ticks: { color: 'rgba(255,255,255,0.7)' },
        grid: { color: 'rgba(255,255,255,0.1)' }
      },
      y: {
        ticks: { color: 'rgba(255,255,255,0.7)' },
        grid: { color: 'rgba(255,255,255,0.1)' }
      }
    }
  };

  const stats = [
    { label: 'Total Regions', value: data.length, icon: FiMapPin, color: 'from-blue-500 to-cyan-500' },
    { label: 'Total Reviews', value: totalReviews, icon: FiUsers, color: 'from-purple-500 to-pink-500' },
    { label: 'Facilities', value: totalFacilities, icon: FiCheckCircle, color: 'from-green-500 to-emerald-500' },
    { label: 'High Priority', value: highPriority, icon: FiAlertTriangle, color: 'from-red-500 to-orange-500' },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 pt-2">
      <motion.div 
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">Analysis Dashboard</h2>
          <p className="text-white/60 text-sm sm:text-base">Real-time monitoring of regional development needs</p>
        </div>
        <button onClick={handleRefresh} className="btn-secondary flex items-center justify-center gap-2 w-full sm:w-auto">
          <FiRefreshCw /> Refresh
        </button>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            className="stat-card-solid"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-2 sm:mb-3`}>
              <stat.icon className="text-white text-lg sm:text-xl" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</p>
            <p className="text-white/50 text-xs sm:text-sm">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <MapView data={data} />
        </motion.div>

        <motion.div
          className="glass-card-solid p-4 sm:p-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FiTrendingUp className="text-primary-400" />
            Need Score by Region
          </h3>
          <div className="h-56 sm:h-64">
            <Bar data={barChartData} options={chartOptions} />
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <motion.div
          className="glass-card-solid p-4 sm:p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-base sm:text-lg font-bold text-white mb-4">Priority Distribution</h3>
          <div className="h-44 sm:h-48">
            <Doughnut 
              data={doughnutData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: { color: 'rgba(255,255,255,0.7)', padding: 15, font: { size: 11 } }
                  }
                }
              }} 
            />
          </div>
        </motion.div>

        <motion.div
          className="glass-card-solid p-4 sm:p-6 lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="text-base sm:text-lg font-bold text-white mb-4">Action Recommendations</h3>
          <div className="space-y-3 max-h-56 sm:max-h-64 overflow-y-auto custom-scrollbar">
            {data.sort((a, b) => b.score - a.score).map((item, index) => (
              <div 
                key={index}
                className={`p-3 sm:p-4 rounded-xl border-l-4 ${
                  item.priority === 'High' ? 'bg-red-500/10 border-red-500' :
                  item.priority === 'Medium' ? 'bg-yellow-500/10 border-yellow-500' :
                  'bg-green-500/10 border-green-500'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-white text-sm sm:text-base">{item.region}</p>
                    <p className="text-xs sm:text-sm text-white/60">{item.action}</p>
                  </div>
                  <div className="flex items-center gap-2 sm:text-right">
                    <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-bold ${
                      item.priority === 'High' ? 'bg-red-500/20 text-red-400' :
                      item.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {item.priority}
                    </span>
                    <p className="text-white/50 text-xs sm:text-sm">Score: {item.score}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
