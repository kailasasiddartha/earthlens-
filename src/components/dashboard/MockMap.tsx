import { motion } from "framer-motion";
import { useState } from "react";
import { MapPin, AlertTriangle, Droplet, Trash2, Construction } from "lucide-react";

interface MarkerData {
  id: string;
  lat: number;
  lng: number;
  category: "pothole" | "waste" | "water";
  title: string;
  confidence: number;
  timestamp: string;
}

const mockMarkers: MarkerData[] = [
  { id: "1", lat: 45, lng: 25, category: "pothole", title: "Severe road damage", confidence: 98, timestamp: "2 min ago" },
  { id: "2", lat: 35, lng: 55, category: "waste", title: "Illegal dump site", confidence: 95, timestamp: "15 min ago" },
  { id: "3", lat: 60, lng: 40, category: "water", title: "Water contamination", confidence: 92, timestamp: "1 hour ago" },
  { id: "4", lat: 25, lng: 70, category: "pothole", title: "Road hazard detected", confidence: 97, timestamp: "3 hours ago" },
  { id: "5", lat: 70, lng: 20, category: "waste", title: "Waste accumulation", confidence: 89, timestamp: "5 hours ago" },
  { id: "6", lat: 50, lng: 75, category: "water", title: "Coastal pollution", confidence: 94, timestamp: "8 hours ago" },
];

const categoryConfig = {
  pothole: { icon: Construction, color: "bg-secondary", borderColor: "border-secondary" },
  waste: { icon: Trash2, color: "bg-earth", borderColor: "border-earth" },
  water: { icon: Droplet, color: "bg-water", borderColor: "border-water" },
};

interface MockMapProps {
  filter: string;
  onMarkerClick: (marker: MarkerData) => void;
}

const MockMap = ({ filter, onMarkerClick }: MockMapProps) => {
  const [hoveredMarker, setHoveredMarker] = useState<string | null>(null);

  const filteredMarkers = filter === "all" 
    ? mockMarkers 
    : mockMarkers.filter(m => m.category === filter);

  return (
    <div className="relative w-full h-full bg-background overflow-hidden rounded-xl">
      {/* Grid Background */}
      <div className="absolute inset-0 animate-grid opacity-20" />
      
      {/* Map Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      
      {/* Continent Shapes (Simplified) */}
      <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d="M20,30 Q30,20 40,25 T60,30 Q70,35 65,45 T55,55 Q45,60 35,55 T20,45 Q15,40 20,30Z" fill="hsl(var(--accent))" />
        <path d="M60,40 Q70,35 80,42 T85,55 Q80,65 70,60 T60,50 Q55,45 60,40Z" fill="hsl(var(--accent))" />
        <path d="M25,60 Q35,55 45,62 T50,75 Q40,80 30,75 T25,65 Q22,62 25,60Z" fill="hsl(var(--accent))" />
      </svg>

      {/* Markers */}
      {filteredMarkers.map((marker) => {
        const config = categoryConfig[marker.category];
        const Icon = config.icon;
        
        return (
          <motion.div
            key={marker.id}
            className="absolute cursor-pointer"
            style={{ left: `${marker.lng}%`, top: `${marker.lat}%` }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, delay: Math.random() * 0.3 }}
            onMouseEnter={() => setHoveredMarker(marker.id)}
            onMouseLeave={() => setHoveredMarker(null)}
            onClick={() => onMarkerClick(marker)}
          >
            {/* Pulse Ring */}
            <motion.div 
              className={`absolute -inset-4 rounded-full ${config.color} opacity-20`}
              animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            
            {/* Marker */}
            <div className={`relative w-10 h-10 rounded-full ${config.color} flex items-center justify-center border-2 ${config.borderColor} shadow-lg`}>
              <Icon className="w-5 h-5 text-foreground" />
            </div>

            {/* Tooltip */}
            {hoveredMarker === marker.id && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 glass-strong rounded-lg whitespace-nowrap z-50"
              >
                <p className="text-sm font-medium">{marker.title}</p>
                <p className="text-xs text-muted-foreground">{marker.confidence}% confidence • {marker.timestamp}</p>
              </motion.div>
            )}
          </motion.div>
        );
      })}

      {/* Map Controls Hint */}
      <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-2 glass rounded-lg text-xs text-muted-foreground">
        <MapPin className="w-3 h-3" />
        <span>Click markers for details</span>
      </div>
    </div>
  );
};

export default MockMap;