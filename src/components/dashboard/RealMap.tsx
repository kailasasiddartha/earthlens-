import { useState, useCallback, useMemo, useEffect } from "react";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from "@react-google-maps/api";
import { motion } from "framer-motion";
import { Construction, Trash2, Droplet, Loader2, AlertTriangle } from "lucide-react";
import { subscribeToVerifiedReports, subscribeToAllReports, Report } from "@/services/reportsService";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

export interface MarkerData {
  id: string;
  lat: number;
  lng: number;
  category: "pothole" | "waste" | "water" | "other";
  title: string;
  confidence: number;
  timestamp: string;
  imageUrl?: string;
  status?: string;
}

const categoryConfig = {
  pothole: {
    icon: Construction,
    color: "#F59E0B",
    label: "Pothole"
  },
  waste: {
    icon: Trash2,
    color: "#22C55E",
    label: "Waste"
  },
  water: {
    icon: Droplet,
    color: "#3B82F6",
    label: "Water"
  },
  other: {
    icon: AlertTriangle,
    color: "#EF4444",
    label: "Other"
  },
};

// Create custom marker icons with category-specific designs
const createMarkerUrl = (category: string, color: string): string => {
  let iconPath = "";

  switch (category) {
    case "pothole":
      // Road/construction icon
      iconPath = `<path d="M8 6h8v2H8zM6 10h12v2H6zM8 14h8v2H8z" fill="${color}"/>`;
      break;
    case "waste":
      // Trash bin icon
      iconPath = `<path d="M9 4v1H6v2h12V5h-3V4H9zm-2 4v10h10V8H7zm3 2h2v6h-2v-6zm4 0h2v6h-2v-6z" fill="${color}"/>`;
      break;
    case "water":
      // Water droplet icon
      iconPath = `<path d="M12 4C9.5 7.5 7 10.5 7 13.5c0 2.8 2.2 5 5 5s5-2.2 5-5c0-3-2.5-6-5-9.5z" fill="${color}"/>`;
      break;
    default:
      // Warning triangle
      iconPath = `<path d="M12 5L4 19h16L12 5zm0 4l5.5 9.5h-11L12 9zm-1 3v4h2v-4h-2zm0 5v2h2v-2h-2z" fill="${color}"/>`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="56" viewBox="0 0 48 56">
    <defs>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#000" flood-opacity="0.4"/>
      </filter>
    </defs>
    <g filter="url(#shadow)">
      <path d="M24 2C12 2 4 10 4 20c0 14 20 32 20 32s20-18 20-32c0-10-8-18-20-18z" fill="${color}"/>
      <circle cx="24" cy="18" r="12" fill="white"/>
      <g transform="translate(12, 6)">${iconPath}</g>
    </g>
  </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

const defaultCenter = {
  lat: 19.076,
  lng: 72.8777,
};

const darkMapStyles = [
  { elementType: "geometry", stylers: [{ color: "#1a1a2e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1a1a2e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8b8b8b" }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#2d2d44" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#2d2d44" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#1a1a2e" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#3d3d5c" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0c4a6e" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#1e1e36" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#1e1e36" }] },
];

interface RealMapProps {
  filter: string;
  onMarkerClick: (marker: MarkerData) => void;
  isAdmin?: boolean;
}

// Helper function to format time ago
const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
};

const RealMap = ({ filter, onMarkerClick, isAdmin = false }: RealMapProps) => {
  const [selectedMarker, setSelectedMarker] = useState<MarkerData | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [reports, setReports] = useState<Report[]>([]);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  // Subscribe to real-time reports - admin sees all, users see only verified
  useEffect(() => {
    const unsubscribe = isAdmin
      ? subscribeToAllReports((newReports) => {
        setReports(newReports);
      })
      : subscribeToVerifiedReports((newReports) => {
        setReports(newReports);
      });
    return () => unsubscribe();
  }, [isAdmin]);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Convert reports to markers
  const markers: MarkerData[] = useMemo(() => {
    return reports.map((report) => ({
      id: report.id,
      lat: report.latitude,
      lng: report.longitude,
      category: report.category as "pothole" | "waste" | "water" | "other",
      title: report.title,
      confidence: report.confidence,
      timestamp: formatTimeAgo(report.createdAt),
      imageUrl: report.imageUrl,
      status: "verified",
    }));
  }, [reports]);

  const filteredMarkers = useMemo(() => {
    return filter === "all"
      ? markers
      : markers.filter(m => m.category === filter);
  }, [filter, markers]);

  const mapOptions = useMemo(() => ({
    styles: darkMapStyles,
    disableDefaultUI: true,
    zoomControl: true,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
  }), []);

  if (loadError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-background">
        <div className="text-center p-8 glass rounded-xl max-w-md">
          <p className="text-destructive font-medium mb-2">Map failed to load</p>
          <p className="text-sm text-muted-foreground">
            Please check your Google Maps API key configuration.
          </p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
          <p className="text-muted-foreground">Loading map...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={defaultCenter}
      zoom={14}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={mapOptions}
    >
      {filteredMarkers.map((marker) => {
        const config = categoryConfig[marker.category];

        return (
          <Marker
            key={marker.id}
            position={{ lat: marker.lat, lng: marker.lng }}
            onClick={() => {
              setSelectedMarker(marker);
              onMarkerClick(marker);
            }}
            icon={{
              url: createMarkerUrl(marker.category, config.color),
              scaledSize: new google.maps.Size(48, 56),
              anchor: new google.maps.Point(24, 56),
            }}
            animation={google.maps.Animation.DROP}
          />
        );
      })}

      {selectedMarker && (
        <InfoWindow
          position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
          onCloseClick={() => setSelectedMarker(null)}
        >
          <div className="p-2 min-w-[200px]">
            <h3 className="font-semibold text-foreground">{selectedMarker.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {categoryConfig[selectedMarker.category]?.label || 'Other'} • {selectedMarker.confidence}% confidence
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-success/20 text-success">
                ✓ Verified
              </span>
              <span className="text-xs text-muted-foreground">{selectedMarker.timestamp}</span>
            </div>
            {selectedMarker.imageUrl && (
              <img
                src={selectedMarker.imageUrl}
                alt={selectedMarker.title}
                className="mt-2 w-full h-24 object-cover rounded"
              />
            )}
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
};

export default RealMap;
