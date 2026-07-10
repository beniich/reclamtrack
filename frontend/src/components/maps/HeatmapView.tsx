'use client';

'use client';


import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { Layers, Thermometer, Download } from 'lucide-react';

interface HeatmapDataPoint {
    lat: number;
    lng: number;
    intensity?: number;
    complaint?: {
        id: string;
        title: string;
        category: string;
        priority: string;
        status: string;
    };
}

interface HeatmapViewProps {
    data: HeatmapDataPoint[];
    center?: [number, number];
    zoom?: number;
    showClusters?: boolean;
    onMarkerClick?: (complaintId: string) => void;
    filterCategory?: string;
    filterPriority?: string;
}

const RABAT_CENTER: [number, number] = [34.0209, -6.8416];

export function HeatmapView({
    data,
    center = RABAT_CENTER,
    zoom = 12,
    showClusters = false,
    onMarkerClick,
    filterCategory,
    filterPriority,
}: HeatmapViewProps) {
    const mapRef = useRef<L.Map | null>(null);
    const heatLayerRef = useRef<any>(null);
    const markerClusterRef = useRef<L.MarkerClusterGroup | null>(null);
    const [mapMode, setMapMode] = useState<'heatmap' | 'clusters' | 'both'>('heatmap');
    const [intensityMultiplier, setIntensityMultiplier] = useState(1);

    // Initialize map
    useEffect(() => {
        if (!mapRef.current) {
            const map = L.map('heatmap-container', {
                center,
                zoom,
                zoomControl: true,
                preferCanvas: true,
            });

            // Add tile layer
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 19,
            }).addTo(map);

            mapRef.current = map;
        }

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Update heatmap data
    useEffect(() => {
        if (!mapRef.current || !data.length) return;

        const filteredData = data.filter((point) => {
            if (filterCategory && point.complaint?.category !== filterCategory) return false;
            if (filterPriority && point.complaint?.priority !== filterPriority) return false;
            return true;
        });

        // Remove existing heatmap
        if (heatLayerRef.current) {
            mapRef.current.removeLayer(heatLayerRef.current);
        }

        // Create heatmap layer
        if (mapMode === 'heatmap' || mapMode === 'both') {
            const heatData = filteredData.map((point) => [
                point.lat,
                point.lng,
                (point.intensity || 1) * intensityMultiplier,
            ]);

            heatLayerRef.current = (L as any).heatLayer(heatData, {
                radius: 25,
                blur: 15,
                maxZoom: 17,
                max: 1.0,
                gradient: {
                    0.0: '#3b82f6',
                    0.3: '#22c55e',
                    0.5: '#eab308',
                    0.7: '#f97316',
                    1.0: '#ef4444',
                },
            }).addTo(mapRef.current);
        }

        // Remove existing cluster layer
        if (markerClusterRef.current) {
            mapRef.current.removeLayer(markerClusterRef.current);
            markerClusterRef.current = null;
        }

        // Create cluster layer
        if ((mapMode === 'clusters' || mapMode === 'both') && showClusters) {
            markerClusterRef.current = new L.MarkerClusterGroup({
                maxClusterRadius: 60,
                spiderfyOnMaxZoom: true,
                showCoverageOnHover: false,
                zoomToBoundsOnClick: true,
                iconCreateFunction: (cluster) => {
                    const count = cluster.getChildCount();
                    let size = 'small';
                    let className = 'marker-cluster-small';

                    if (count > 50) {
                        size = 'large';
                        className = 'marker-cluster-large';
                    } else if (count > 10) {
                        size = 'medium';
                        className = 'marker-cluster-medium';
                    }

                    return L.divIcon({
                        html: `<div><span>${count}</span></div>`,
                        className: `marker-cluster ${className}`,
                        iconSize: L.point(40, 40),
                    });
                },
            });

            filteredData.forEach((point) => {
                if (!point.complaint) return;

                const priorityColors: Record<string, string> = {
                    low: '#22c55e',
                    medium: '#eab308',
                    high: '#f97316',
                    urgent: '#ef4444',
                };

                const color = priorityColors[point.complaint.priority] || '#3b82f6';

                const icon = L.divIcon({
                    html: `
            <div style="
              background: ${color};
              width: 24px;
              height: 24px;
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            "></div>
          `,
                    className: '',
                    iconSize: L.point(24, 24),
                });

                const marker = L.marker([point.lat, point.lng], { icon })
                    .bindPopup(`
            <div class="p-2">
              <h4 class="font-bold text-sm mb-1">${point.complaint.title}</h4>
              <p class="text-xs text-gray-600 mb-2">${point.complaint.category}</p>
              <div class="flex gap-2">
                <span class="px-2 py-1 text-xs rounded" style="background: ${color}20; color: ${color}">
                  ${point.complaint.priority}
                </span>
                <span class="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                  ${point.complaint.status}
                </span>
              </div>
            </div>
          `);

                if (onMarkerClick) {
                    marker.on('click', () => onMarkerClick(point.complaint!.id));
                }

                markerClusterRef.current!.addLayer(marker);
            });

            mapRef.current.addLayer(markerClusterRef.current);
        }
    }, [data, mapMode, intensityMultiplier, showClusters, filterCategory, filterPriority, onMarkerClick]);

    const exportHeatmapImage = () => {
        if (!mapRef.current) return;

        // @ts-expect-error: leaflet-image lacks typescript declarations
        import('leaflet-image').then((leafletImage) => {
            leafletImage.default(mapRef.current, (err: any, canvas: HTMLCanvasElement) => {
                if (err) {
                    console.error('Export error:', err);
                    return;
                }

                const link = document.createElement('a');
                link.download = `heatmap_${new Date().toISOString()}.png`;
                link.href = canvas.toDataURL();
                link.click();
            });
        });
    };

    return (
        <div className="relative w-full h-full">
            {/* Map Container */}
            <div id="heatmap-container" className="w-full h-full rounded-xl overflow-hidden" />

            {/* Controls */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 z-[1000]">
                {/* Layer Toggle */}
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-2 space-y-2">
                    <p className="text-xs font-bold text-slate-500 uppercase px-2">Vue</p>

                    <button type="button"
                        onClick={() => setMapMode('heatmap')}
                        className={`w-full px-3 py-2 rounded-md text-sm font-medium transition-colors ${mapMode === 'heatmap'
                                ? 'bg-primary text-white'
                                : 'text-slate-600 hover:bg-primary/8 dark:hover:bg-slate-700'
                            }`}
                    >
                        <Thermometer className="w-4 h-4 inline mr-2" />
                        Heatmap
                    </button>

                    {showClusters && (
                        <button type="button"
                            onClick={() => setMapMode('clusters')}
                            className={`w-full px-3 py-2 rounded-md text-sm font-medium transition-colors ${mapMode === 'clusters'
                                    ? 'bg-primary text-white'
                                    : 'text-slate-600 hover:bg-primary/8 dark:hover:bg-slate-700'
                                }`}
                        >
                            <Layers className="w-4 h-4 inline mr-2" />
                            Clusters
                        </button>
                    )}

                    {showClusters && (
                        <button type="button"
                            onClick={() => setMapMode('both')}
                            className={`w-full px-3 py-2 rounded-md text-sm font-medium transition-colors ${mapMode === 'both'
                                    ? 'bg-primary text-white'
                                    : 'text-slate-600 hover:bg-primary/8 dark:hover:bg-slate-700'
                                }`}
                        >
                            Les deux
                        </button>
                    )}
                </div>

                {/* Intensity Control */}
                {(mapMode === 'heatmap' || mapMode === 'both') && (
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-3">
                        <p className="text-xs font-bold text-slate-500 uppercase mb-2">Intensité</p>
                        <input
                            type="range"
                            min="0.5"
                            max="2"
                            step="0.1"
                            value={intensityMultiplier}
                            onChange={(e) => setIntensityMultiplier(parseFloat(e.target.value))}
                            className="w-full"
                        />
                        <p className="text-xs text-center text-slate-500 mt-1">
                            {intensityMultiplier.toFixed(1)}x
                        </p>
                    </div>
                )}

                {/* Export Button */}
                <button type="button"
                    onClick={exportHeatmapImage}
                    className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-3 hover:bg-primary/5 dark:hover:bg-slate-700 transition-colors"
                    title="Exporter l'image"
                >
                    <Download className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </button>
            </div>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-white dark:bg-slate-800 rounded-lg shadow-lg p-3 z-[1000]">
                <p className="text-xs font-bold text-slate-500 uppercase mb-2">Densité</p>
                <div className="flex items-center gap-2">
                    <div className="w-32 h-3 rounded-full" style={{
                        background: 'linear-gradient(to right, #3b82f6, #22c55e, #eab308, #f97316, #ef4444)'
                    }} />
                    <div className="flex justify-between text-xs text-slate-500 w-full">
                        <span>Faible</span>
                        <span>Élevée</span>
                    </div>
                </div>
            </div>

            {/* Data Count */}
            <div className="absolute top-4 left-4 bg-white dark:bg-slate-800 rounded-lg shadow-lg px-4 py-2 z-[1000]">
                <p className="text-sm">
                    <span className="font-bold text-primary">{data.length}</span>
                    <span className="text-slate-500 ml-1">points de données</span>
                </p>
            </div>

            {/* CSS for clusters */}
            <style jsx global>{`
        .marker-cluster-small {
          background-color: rgba(59, 130, 246, 0.6);
        }
        .marker-cluster-small div {
          background-color: rgba(59, 130, 246, 0.8);
          color: white;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          width: 100%;
          height: 100%;
        }
        
        .marker-cluster-medium {
          background-color: rgba(234, 179, 8, 0.6);
        }
        .marker-cluster-medium div {
          background-color: rgba(234, 179, 8, 0.8);
          color: white;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          width: 100%;
          height: 100%;
        }
        
        .marker-cluster-large {
          background-color: rgba(239, 68, 68, 0.6);
        }
        .marker-cluster-large div {
          background-color: rgba(239, 68, 68, 0.8);
          color: white;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          width: 100%;
          height: 100%;
        }
        
        .marker-cluster {
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }
      `}</style>
        </div>
    );
}
