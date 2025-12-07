import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiPieChart, FiActivity, FiRefreshCw } from 'react-icons/fi';
import { Radar, PolarArea } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, RadialLinearScale, Filler, ArcElement } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, RadialLinearScale, Filler, ArcElement);

const MOCK_DATA = [
  { region: 'Central District', score: 0.85, priority: 'High', review_count: 150, facility_count: 45, action: 'Immediate road repair needed' },
  { region: 'North Bay', score: 0.65, priority: 'Medium', review_count: 89, facility_count: 30, action: 'Improve drainage system' },
  { region: 'West Hills', score: 0.3, priority: 'Low', review_count: 45, facility_count: 60, action: 'Maintain public parks' },
  { region: 'East Industrial', score: 0.78, priority: 'High', review_count: 210, facility_count: 25, action: 'Add more street lighting' },
  { region: 'South Suburbs', score: 0.45, priority: 'Medium', review_count: 120, facility_count: 55, action: 'Expand bus routes' },
];

const Analytics = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    setTimeout(() => {
        setData(MOCK_DATA);
        setLoading(false);
    }, 800);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const radarData = useMemo(() => ({
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
        label: 'Facilities (Norm.)',
        data: data.map(d => Math.min(1, d.facility_count / 100)),
        backgroundColor: 'rgba(217, 70, 239, 0.2)',
        borderColor: 'rgb(217, 70, 239)',
        pointBackgroundColor: 'rgb(217, 70, 239)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(217, 70, 239)',
      }
    ]
  }), [data]);

  const polarData = useMemo(() => ({
    labels: data.map(d => d.region),
    datasets: [{
      data: data.map(d => d.review_count),
      backgroundColor: [
        'rgba(239, 68, 68, 0.7)',
        'rgba(245, 158, 11, 0.7)',
        'rgba(34, 197, 94, 0.7)',
        'rgba(14, 165, 233, 0.7)',
        'rgba(217, 70, 239, 0.7)',
      ],
      borderWidth: 1,
      borderColor: '#1e293b'
    }]
  }), [data]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'nearest' as const,
      intersect: false,
    },
    scales: {
      r: {
        angleLines: { color: 'rgba(255,255,255,0.1)' },
        grid: { color: 'rgba(255,255,255,0.1)' },
        pointLabels: { color: 'rgba(255,255,255,0.7)', font: { size: 11 } },
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
  }), []);

  const polarOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { color: 'rgba(255,255,255,0.7)', padding: 10, font: { size: 11 } }
      }
    },
    scales: {
        r: {
          grid: { color: 'rgba(255,255,255,0.1)' },
          ticks: { 
            backdropColor: 'transparent',
            color: 'rgba(255,255,255,0.5)'
          }
        }
    }
  }), []);

  const avgScore = data.length > 0 ? (data.reduce((sum, d) => sum + d.score, 0) / data.length).toFixed(2) : '0';
  const mostUrgent = [...data].sort((a, b) => b.score - a.score)[0];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 text-lg font-light tracking-wide">Loading Analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div 
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1">Analytics Dashboard</h2>
          <p className="text-slate-400 text-sm">In-depth visualization of regional analysis data</p>
        </div>
        <button onClick={fetchData} className="btn-secondary flex items-center justify-center gap-2 w-full sm:w-auto py-2 px-4 bg-slate-800 border border-white/10 rounded-xl hover:bg-slate-700 transition-colors">
          <FiRefreshCw /> Refresh
        </button>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          className="stat-card-solid"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center mb-3">
            <FiActivity className="text-white text-xl" />
          </div>
          <p className="text-3xl font-bold text-white">{avgScore}</p>
          <p className="text-slate-400 text-sm">Average Need Score</p>
        </motion.div>

        <motion.div
          className="stat-card-solid"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center mb-3">
            <FiTrendingUp className="text-white text-xl" />
          </div>
          <p className="text-xl font-bold text-white truncate">{mostUrgent?.region || '-'}</p>
          <p className="text-slate-400 text-sm">Most Urgent Region</p>
        </motion.div>

        <motion.div
          className="stat-card-solid"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-3">
            <FiPieChart className="text-white text-xl" />
          </div>
          <p className="text-3xl font-bold text-white">{data.length}</p>
          <p className="text-slate-400 text-sm">Monitored Regions</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          className="glass-card-solid p-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <FiActivity className="text-sky-400" />
            Regional Analysis Radar
          </h3>
          <div className="h-[350px]">
            <Radar data={radarData} options={chartOptions} />
          </div>
        </motion.div>

        <motion.div
          className="glass-card-solid p-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <FiPieChart className="text-purple-400" />
            Review Distribution by Region
          </h3>
          <div className="h-[350px]">
            <PolarArea data={polarData} options={polarOptions} />
          </div>
        </motion.div>
      </div>

      <motion.div
        className="glass-card-solid p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="text-xl font-bold text-white mb-4">Detailed Regional Analysis</h3>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Region</th>
                <th className="text-center py-3 px-4 text-slate-400 font-medium text-sm">Score</th>
                <th className="text-center py-3 px-4 text-slate-400 font-medium text-sm">Priority</th>
                <th className="text-center py-3 px-4 text-slate-400 font-medium text-sm">Reviews</th>
                <th className="text-center py-3 px-4 text-slate-400 font-medium text-sm">Facilities</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Recommendation</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 text-white font-medium text-sm">{item.region}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`font-bold text-sm ${
                      item.score > 0.7 ? 'text-red-400' :
                      item.score > 0.4 ? 'text-amber-400' :
                      'text-green-400'
                    }`}>{item.score}</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      item.priority === 'High' ? 'bg-red-500/20 text-red-400' :
                      item.priority === 'Medium' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {item.priority}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center text-slate-300 text-sm">{item.review_count}</td>
                  <td className="py-3 px-4 text-center text-slate-300 text-sm">{item.facility_count}</td>
                  <td className="py-3 px-4 text-slate-400 text-sm">{item.action}</td>
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