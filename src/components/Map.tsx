"use client";

import { useEffect, useState, useRef } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Circle, useMap, useMapEvents, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icon in Leaflet + Next.js
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const DestinationIcon = L.divIcon({
  className: "custom-div-icon",
  html: `<div style="background-color: #ef4444; width: 15px; height: 15px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>`,
  iconSize: [15, 15],
  iconAnchor: [7.5, 7.5],
});

const UserIcon = L.divIcon({
  className: "user-location-icon",
  html: `<div class="relative flex items-center justify-center">
          <div class="absolute w-6 h-6 bg-blue-500 rounded-full animate-ping opacity-25"></div>
          <div class="relative w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg"></div>
        </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapProps {
  center: [number, number];
  destination?: [number, number] | null;
  userLocation?: [number, number] | null;
  startPoint?: [number, number] | null;
  radius?: number;
  onSelectDestination?: (lat: number, lng: number) => void;
  followUser?: boolean;
}

function MapUpdater({ center, followUser }: { center: [number, number], followUser?: boolean }) {
  const map = useMap();
  const lastCenter = useRef<[number, number]>(center);

  useEffect(() => {
    if (followUser) {
      map.flyTo(center, map.getZoom(), {
        duration: 1.5,
        easeLinearity: 0.25
      });
    } else if (center[0] !== lastCenter.current[0] || center[1] !== lastCenter.current[1]) {
      map.setView(center);
    }
    lastCenter.current = center;
  }, [center, map, followUser]);

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

export default function Map({ center, destination, userLocation, startPoint, radius, onSelectDestination, followUser }: MapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!isMounted) return <div className="w-full h-full bg-[#1a1a1a] animate-pulse" />;

  const routePoints = startPoint && destination ? [startPoint, destination] : [];

  return (
    <MapContainer
      center={center}
      zoom={15}
      style={{ height: "100%", width: "100%", background: "#1a1a1a" }}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      
      {userLocation && (
        <Marker position={userLocation} icon={UserIcon}>
          <Circle
            center={userLocation}
            radius={40}
            pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.1, weight: 1 }}
          />
        </Marker>
      )}

      {destination && (
        <>
          <Marker position={destination} icon={DestinationIcon} />
          {radius && (
            <Circle
              center={destination}
              radius={radius}
              pathOptions={{ 
                color: '#ef4444', 
                fillColor: '#ef4444', 
                fillOpacity: 0.05, 
                dashArray: '10, 10',
                weight: 2
              }}
            />
          )}
        </>
      )}

      {startPoint && (
        <Marker position={startPoint}>
           <Circle
            center={startPoint}
            radius={15}
            pathOptions={{ color: '#3b82f6', fillColor: 'white', fillOpacity: 1, weight: 4 }}
          />
        </Marker>
      )}

      {routePoints.length > 0 && (
        <Polyline 
          positions={routePoints as [number, number][]} 
          pathOptions={{ color: '#3b82f6', weight: 4, opacity: 0.5, dashArray: '5, 10' }} 
        />
      )}

      <MapUpdater center={center} followUser={followUser} />
      <MapEvents onSelect={onSelectDestination} />
    </MapContainer>
  );
}

