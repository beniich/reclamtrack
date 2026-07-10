'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Truck, MapPin } from 'lucide-react';
import { renderToString } from 'react-dom/server';

// Correction des icônes par défaut de Leaflet
if (typeof window !== 'undefined') {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
}

// Composant pour créer dynamiquement l'icône Lucide compatible Leaflet
const createCustomIcon = (IconComponent: any, color: string) => {
  if (typeof window === 'undefined') return null;
  return L.divIcon({
    html: renderToString(
      <div style={{ color: color, filter: `drop-shadow(0 0 8px ${color}80)` }}>
        <IconComponent size={28} fill={color} fillOpacity={0.2} strokeWidth={2.5} />
      </div>
    ),
    className: 'custom-leaflet-icon',
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  });
};

const teamIcon = (color: string) => createCustomIcon(Truck, color || '#4f46e5');
const complaintIcon = (priority: string) => {
  const color = priority === 'urgent' ? '#ef4444' : priority === 'high' ? '#f97316' : '#3b82f6';
  return createCustomIcon(MapPin, color);
};

interface LeafletMapProps {
  teams: any[];
  complaints: any[];
  center?: [number, number];
  zoom?: number;
}

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center);
  }, [center, map]);
  return null;
}

export default function LeafletMap({ teams, complaints, center = [33.5731, -7.5898], zoom = 12 }: LeafletMapProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return (
    <div className="h-full w-full bg-surface-dark flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
            <div className="size-12 border-4 border-primary/20 border-t-indigo-500 rounded-full animate-spin"></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Initialisation Grid Map...</span>
        </div>
    </div>
  );

  return (
    <div className="h-full w-full relative z-0">
      <MapContainer 
        center={center} 
        zoom={zoom} 
        scrollWheelZoom={true} 
        className="h-full w-full z-0"
        style={{ background: '#0f172a' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        <MapUpdater center={center} />

        {/* Équipes (Techniciens en mouvement) */}
        {teams.map((team) => {
          const lat = team.location?.lat || team.baseLocation?.latitude;
          const lng = team.location?.lng || team.baseLocation?.longitude;
          
          if (!lat || !lng) return null;

          const icon = teamIcon(team.color);
          if (!icon) return null;

          return (
            <Marker key={team._id} position={[lat, lng]} icon={icon}>
              <Popup className="custom-popup">
                <div className="p-1">
                  <h3 className="font-bold text-sm uppercase mb-1 text-slate-900 border-b border-slate-100 pb-1">{team.name}</h3>
                  <div className="flex items-center gap-2 my-2">
                    <div className={`size-2 rounded-full ${team.status === 'intervention' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></div>
                    <span className="text-[9px] font-black uppercase tracking-tight text-slate-600">{team.status}</span>
                  </div>
                  <p className="text-[9px] text-slate-500 font-medium italic">Spécialité : {team.specialization || 'Maintenance Générale'}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Réclamations (Interventions à faire) */}
        {complaints.filter(c => c.status !== 'fermée' && c.status !== 'résolue').map((complaint) => {
          const lat = complaint.latitude || complaint.location?.latitude;
          const lng = complaint.longitude || complaint.location?.longitude;

          if (!lat || !lng) return null;

          const icon = complaintIcon(complaint.priority);
          if (!icon) return null;

          return (
            <Marker key={complaint._id} position={[lat, lng]} icon={icon}>
              <Popup className="custom-popup">
                <div className="p-1 min-w-[160px]">
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <span className="text-[9px] font-black text-primary px-2 py-0.5 bg-indigo-50 rounded">#{complaint.number || complaint._id.slice(-6)}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase text-white ${
                      complaint.priority === 'urgent' ? 'bg-red-500' : 'bg-primary'
                    }`}>
                      {complaint.priority}
                    </span>
                  </div>
                  <h4 className="text-[11px] font-black text-slate-800 leading-tight mb-2 line-clamp-1 uppercase italic">{complaint.title}</h4>
                  <p className="text-[9px] text-slate-500 mb-3 line-clamp-2 leading-relaxed">{complaint.description}</p>
                  <button type="button" onClick={() => router.push(`/complaints/${complaint._id}`)} className="w-full py-2 bg-surface-dark text-white text-[9px] font-black rounded-lg uppercase tracking-widest hover:bg-primary transition-colors">
                    Ouvrir Détails
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Control Overlay Custom UI Overlay (Légende) */}
      <div className="absolute top-4 right-4 z-[500] pointer-events-none">
        <div className="bg-surface-dark/80 backdrop-blur-md p-4 rounded-[2rem] shadow-2xl border border-white/10 pointer-events-auto min-w-[140px]">
          <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-3 ml-1">Grid Alpha 7</h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="size-2.5 rounded-full bg-primary shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
              <span className="text-[9px] font-black text-white uppercase tracking-wider">Unité Mobile</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="size-2.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
              <span className="text-[9px] font-black text-white uppercase tracking-wider">Urgence S1</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="size-2.5 rounded-full bg-primary shadow-[0_0_10px_rgba(249,115,22,0.5)]"></div>
              <span className="text-[9px] font-black text-white uppercase tracking-wider">Standard S2</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
