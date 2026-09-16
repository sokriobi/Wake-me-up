"use client";

import { useEffect, useState, useRef } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Circle, useMap, useMapEvents, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Self-contained SVG Icons for 100% offline reliability
const StartIcon = L.divIcon({
  className: "custom-start-icon",
  html: `<div style="position: relative; display: flex; align-items: center; justify-content: center;">
          <div style="width: 22px; height: 22px; background: #3b82f6; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 12px rgba(59,130,246,0.6);"></div>
        </div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

const DestinationIcon = L.divIcon({
  className: "custom-dest-icon",
  html: `<div style="position: relative; display: flex; align-items: center; justify-content: center;">
          <div style="width: 22px; height: 22px; background: #f43f5e; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 12px rgba(244,63,94,0.6);"></div>
        </div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

const UserIcon = L.divIcon({
  className: "custom-user-icon",
  html: `<div style="position: relative; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 32px; height: 32px; background: rgba(59,130,246,0.3); border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: relative; width: 18px; height: 18px; background: #2563eb; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.4);"></div>
        </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

interface MapProps {
  center: [number, number];
  destination?: [number, number] | null;
  userLocation?: [number, number] | null;
  startPoint?: [number, number] | null;
  radius?: number;
  onSelectDestination?: (lat: number, lng: number) => void;
  followUser?: boolean;
}

function MapUpdater({ 
  center, 
  followUser, 
  startPoint, 
  destination 
}: { 
  center: [number, number]; 
  followUser?: boolean;
  startPoint?: [number, number] | null;
  destination?: [number, number] | null;
}) {
  const map = useMap();
  const lastCenter = useRef<[number, number]>(center);

  useEffect(() => {
    if (followUser) {
      map.flyTo(center, Math.max(map.getZoom(), 15), {
        duration: 1.2,
        easeLinearity: 0.25
      });
    } else if (startPoint && destination && !followUser) {
      // Auto-fit bounds if both start & dest are present
      const bounds = L.latLngBounds([startPoint, destination]);
      map.fitBounds(bounds, { padding: [80, 80], maxZoom: 16 });
    } else if (center[0] !== lastCenter.current[0] || center[1] !== lastCenter.current[1]) {
      map.setView(center, map.getZoom());
    }
    lastCenter.current = center;
  }, [center, map, followUser, startPoint, destination]);

  return null;
}

function MapEvents({ onSelect }: { onSelect?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      if (onSelect) {
        onSelect(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

export default function Map({ 
  center, 
  destination, 
  userLocation, 
  startPoint, 
  radius, 
  onSelectDestination, 
  followUser 
}: MapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!isMounted) return <div className="w-full h-full bg-[#121212] animate-pulse" />;

  const routePoints = startPoint && destination ? [startPoint, destination] : [];

  return (
    <MapContainer
      center={center}
      zoom={14}
      style={{ height: "100%", width: "100%", background: "#121212" }}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />
      
      {/* User Live GPS Marker */}
      {userLocation && (
        <Marker position={userLocation} icon={UserIcon}>
          <Circle
            center={userLocation}
            radius={35}
            pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.15, weight: 1.5 }}
          />
        </Marker>
      )}

      {/* Start / Pick-up Point Marker */}
      {startPoint && (
        <Marker position={startPoint} icon={StartIcon}>
          <Circle
            center={startPoint}
            radius={25}
            pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.2, weight: 2 }}
          />
        </Marker>
      )}

      {/* Destination Marker with Alarm Radius */}
      {destination && (
        <>
          <Marker position={destination} icon={DestinationIcon} />
          {radius && (
            <Circle
              center={destination}
              radius={radius}
              pathOptions={{ 
                color: '#f43f5e', 
                fillColor: '#f43f5e', 
                fillOpacity: 0.1, 
                dashArray: '8, 8',
                weight: 2
              }}
            />
          )}
        </>
      )}

      {/* Connecting Route Line */}
      {routePoints.length > 0 && (
        <Polyline 
          positions={routePoints as [number, number][]} 
          pathOptions={{ color: '#3b82f6', weight: 4, opacity: 0.6, dashArray: '6, 10' }} 
        />
      )}

      <MapUpdater 
        center={center} 
        followUser={followUser} 
        startPoint={startPoint} 
        destination={destination} 
      />
      <MapEvents onSelect={onSelectDestination} />
    </MapContainer>
  );
}
