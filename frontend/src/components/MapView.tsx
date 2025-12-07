import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from 'react-leaflet';
import { FiMapPin } from 'react-icons/fi';

interface MapLocationData {
  region: string;
  score: number;
  priority: 'High' | 'Medium' | 'Low';
  review_count: number;
  facility_count: number;
  action: string;
  coords: [number, number];
}

const MapView = ({ data }: { data: MapLocationData[] }) => {
  const defaultCenter: [number, number] = [-6.2088, 106.8456]; // Jakarta coordinates

  const getColor = (score: number) => {
    if (score > 0.7) return '#ef4444'; // Red-500
    if (score > 0.4) return '#f59e0b'; // Amber-500
    return '#22c55e'; // Green-500
  };

  return (
    <div className="glass-card-solid p-4 sm:p-6 h-full flex flex-col">
      <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2">
        <FiMapPin className="text-primary-400" />
        Needs Distribution Map
      </h3>
      <div className="rounded-xl overflow-hidden flex-1 min-h-[300px] relative z-0 border border-white/10 shadow-inner">
        <MapContainer 
          center={defaultCenter} 
          zoom={11} 
          style={{ height: '100%', width: '100%' }}
          attributionControl={false} // Hide default Leaflet attribution for custom placement
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
                weight: 2
              }}
              radius={10 + (loc.score * 15)}
            >
              <Tooltip direction="top" offset={[0, -10]} permanent={false}>
                <span className="font-bold">{loc.region}</span>
              </Tooltip>
              <Popup>
                <div className="text-center p-1">
                  <h4 className="font-bold text-slate-800 text-base">{loc.region}</h4>
                  <div className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold mt-1 uppercase tracking-wide ${
                    loc.priority === 'High' ? 'bg-red-100 text-red-600' :
                    loc.priority === 'Medium' ? 'bg-amber-100 text-amber-600' :
                    'bg-green-100 text-green-600'
                  }`}>
                    {loc.priority} Priority
                  </div>
                  <div className="mt-2 text-xs text-slate-600 grid grid-cols-2 gap-x-2 gap-y-1 text-left">
                    <span className="font-semibold">Score:</span> <span>{loc.score}</span>
                    <span className="font-semibold">Reviews:</span> <span>{loc.review_count}</span>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
      
      <div className="mt-4 flex flex-wrap justify-center gap-4 sm:gap-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
          <span className="text-slate-300 text-xs sm:text-sm">High Priority</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
          <span className="text-slate-300 text-xs sm:text-sm">Medium Priority</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
          <span className="text-slate-300 text-xs sm:text-sm">Low Priority</span>
        </div>
      </div>
    </div>
  );
};

export default MapView;