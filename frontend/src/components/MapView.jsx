import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { FiMapPin } from 'react-icons/fi';

const MapView = ({ data }) => {
  const defaultCenter = [-6.22, 106.82];

  const getColor = (score) => {
    if (score > 0.7) return '#EF4444';
    if (score > 0.4) return '#F59E0B';
    return '#22C55E';
  };

  return (
    <div className="glass-card-solid p-4 sm:p-6 h-full">
      <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2">
        <FiMapPin className="text-primary-400" />
        Needs Distribution Map
      </h3>
      <div className="rounded-xl overflow-hidden h-56 sm:h-64">
        <MapContainer 
          center={defaultCenter} 
          zoom={11} 
          style={{ height: '100%', width: '100%' }}
          className="rounded-xl"
        >
          <TileLayer 
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          
          {data.map((loc, idx) => (
            <CircleMarker 
              key={idx} 
              center={loc.coords} 
              pathOptions={{ 
                color: getColor(loc.score),
                fillColor: getColor(loc.score),
                fillOpacity: 0.6,
                weight: 3
              }}
              radius={15 + (loc.score * 20)}
            >
              <Tooltip direction="top" offset={[0, -10]} permanent={false}>
                <span className="font-bold">{loc.region}</span>
              </Tooltip>
              <Popup>
                <div className="text-center p-2">
                  <h4 className="font-bold text-lg text-gray-800">{loc.region}</h4>
                  <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold mt-2 ${
                    loc.priority === 'High' ? 'bg-red-100 text-red-600' :
                    loc.priority === 'Medium' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-green-100 text-green-600'
                  }`}>
                    {loc.priority} Priority
                  </div>
                  <div className="mt-3 text-sm text-gray-600">
                    <p><strong>Score:</strong> {loc.score}</p>
                    <p><strong>Reviews:</strong> {loc.review_count}</p>
                    <p><strong>Facilities:</strong> {loc.facility_count}</p>
                  </div>
                  <p className="mt-2 text-xs text-gray-500 italic">{loc.action}</p>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
      
      <div className="mt-4 flex flex-wrap justify-center gap-4 sm:gap-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span className="text-white/60 text-xs sm:text-sm">High Priority</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <span className="text-white/60 text-xs sm:text-sm">Medium</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-white/60 text-xs sm:text-sm">Low</span>
        </div>
      </div>
    </div>
  );
};

export default MapView;
