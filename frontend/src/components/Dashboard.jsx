import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FiMapPin, FiUsers, FiAlertTriangle, FiCheckCircle, FiTrendingUp, FiRefreshCw } from 'react-icons/fi';
import MapView from './MapView';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

// Fallback data if backend is not running
const MOCK_DATA = [
  { region: 'Central District', score: 0.85, priority: 'High', review_count: 150, facility_count: 45, action: 'Immediate road repair needed', coords: [-6.2088, 106.8456] },
  { region: 'North Bay', score: 0.65, priority: 'Medium', review_count: 89, facility_count: 30, action: 'Improve drainage system', coords: [-6.1214, 106.7612] },
  { region: 'West Hills', score: 0.3, priority: 'Low', review_count: 45, facility_count: 60, action: 'Maintain public parks', coords: [-6.1554, 106.7321] },
  { region: 'East Industrial', score: 0.78, priority: 'High', review_count: 210, facility_count: 25, action: 'Add more street lighting', coords: [-6.1921, 106.9123] },
  { region: 'South Suburbs', score: 0.45, priority: 'Medium', review_count: 120, facility_count: 55, action: 'Expand bus routes', coords: [-6.2615, 106.8106] },
];

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/dashboard/stats', { timeout: 3000 });
      setData(response.data);
    } catch (err) {
      console.warn('Backend API failed, using mock data:', err);
      setData(MOCK_DATA);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    fetchData();
  };

  const highPriority = data.filter(d => d.priority === 'High').length;
  const mediumPriority = data.filter(d => d.priority === 'Medium').length;
  const lowPriority = data.filter(d => d.priority === 'Low').length;
  const totalReviews = data.reduce((sum, d) => sum + d.review_count, 0);
  const totalFacilities = data.reduce((sum, d) => sum + d.facility_count, 0);

  const barChartData = useMemo(() => ({
    labels: data.map(d => d.region),
    datasets: [
      {
        label: 'Need Score',
        data: data.map(d => d.score),
        backgroundColor: data.map(d => 
          d.score > 0.7 ? 'rgba(239, 68, 68, 0.8)' : 
          d.score > 0.4 ? 'rgba(245, 158, 11, 0.8)' : 
          'rgba(34, 197, 94, 0.8)'
        ),
        barThickness: 32,
        borderRadius: 4,
      }
    ],
  }), [data]);

  const doughnutData = useMemo(() => ({
    labels: ['High', 'Medium', 'Low'],
    datasets: [{
      data: [highPriority, mediumPriority, lowPriority],
      backgroundColor: ['#ef4444', '#f59e0b', '#22c55e'],
      borderWidth: 0,
    }],
  }), [highPriority, mediumPriority, lowPriority]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#fff',
        bodyColor: '#cbd5e1',
        padding: 10,
        cornerRadius: 8,
      }
    },
    scales: {
      x: {
        ticks: { color: '#94a3b8', font: { size: 10 } },
        grid: { display: false }
      },
      y: {
        ticks: { color: '#94a3b8', font: { size: 10 } },
        grid: { color: '#334155' }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'bottom',
            labels: { color: '#cbd5e1', padding: 20, font: { size: 11 }, usePointStyle: true }
        }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 text-sm tracking-wide">Analysing urban data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div 
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Analysis Dashboard</h2>
          <p className="text-slate-400 text-sm">Real-time monitoring of regional development needs</p>
        </div>
        <button onClick={handleRefresh} className="btn-secondary flex items-center justify-center gap-2 w-full sm:w-auto text-sm px-4 py-2 bg-slate-800 border border-white/10 rounded-xl hover:bg-slate-700 transition-colors">
          <FiRefreshCw size={16} /> Refresh
        </button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Total Regions', value: data.length, icon: FiMapPin, color: 'from-blue-500 to-cyan-500' },
          { label: 'Total Reviews', value: totalReviews, icon: FiUsers, color: 'from-purple-500 to-pink-500' },
          { label: 'Facilities', value: totalFacilities, icon: FiCheckCircle, color: 'from-green-500 to-emerald-500' },
          { label: 'High Priority', value: highPriority, icon: FiAlertTriangle, color: 'from-red-500 to-orange-500' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            className="stat-card-solid"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3 shadow-lg`}>
              <stat.icon className="text-white text-lg" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</p>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wide mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Map Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="h-[400px]"
        >
          <MapView data={data} />
        </motion.div>

        {/* Bar Chart Section */}
        <motion.div
          className="glass-card-solid p-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FiTrendingUp className="text-primary-400" />
                Need Score by Region
            </h3>
          </div>
          <div className="h-[300px] w-full">
            <Bar data={barChartData} options={chartOptions} />
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Doughnut Chart */}
        <motion.div
          className="glass-card-solid p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-lg font-bold text-white mb-6">Priority Distribution</h3>
          <div className="h-[200px] flex items-center justify-center">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </motion.div>

        {/* Recommendations List */}
        <motion.div
          className="glass-card-solid p-6 lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-lg font-bold text-white mb-4">Action Recommendations</h3>
          <div className="space-y-3 max-h-[220px] overflow-y-auto custom-scrollbar pr-2">
            {data.sort((a, b) => b.score - a.score).map((item, index) => (
              <div 
                key={index}
                className="p-4 rounded-xl bg-slate-800/50 border border-white/5 hover:bg-slate-800 transition-colors flex items-center justify-between group"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-2 h-2 rounded-full ${
                        item.priority === 'High' ? 'bg-red-500' : item.priority === 'Medium' ? 'bg-amber-500' : 'bg-green-500'
                    }`}></span>
                    <p className="font-semibold text-white text-sm">{item.region}</p>
                  </div>
                  <p className="text-xs text-slate-400">{item.action}</p>
                </div>
                <div className="text-right">
                    <div className="text-xs font-mono text-slate-500">Score</div>
                    <div className={`font-bold ${
                        item.score > 0.7 ? 'text-red-400' : 'text-slate-200'
                    }`}>{item.score.toFixed(2)}</div>
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