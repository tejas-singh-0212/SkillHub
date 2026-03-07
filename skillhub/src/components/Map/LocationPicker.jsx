"use client";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { useState, useEffect } from "react";

const markerIcon = L.icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Detects clicks on the map
function ClickHandler({ onSelect }) {
  useMapEvents({
    click(e) {
      onSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}


function FlyToLocation({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.flyTo([lat, lng], 15, { duration: 1.5 });
    }
  }, [lat, lng, map]);
  return null;
}

export default function LocationPicker({ onLocationSelect, initialLocation }) {
  const [selected, setSelected] = useState(initialLocation || null);

  const handleSelect = async (coords) => {
    setSelected(coords);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?` +
          `format=json&lat=${coords.lat}&lon=${coords.lng}&zoom=16`
      );
      const data = await res.json();

      const enriched = {
        lat: coords.lat,
        lng: coords.lng,
        city:
          data.address?.city ||
          data.address?.town ||
          data.address?.village ||
          "",
        area:
          data.address?.suburb ||
          data.address?.neighbourhood ||
          "",
        fullAddress: data.display_name || "",
      };

      onLocationSelect(enriched);
    } catch {
      onLocationSelect(coords);
    }
  };


  const center = initialLocation || { lat: 20.5937, lng: 78.9629 };

  return (
    <div>
      <p className="text-sm text-gray-500 mb-2">
        👆 Click anywhere on the map to set your location
      </p>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={initialLocation ? 15 : 5}
        className="h-[300px] w-full rounded-xl border"
        style={{ zIndex: 1 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onSelect={handleSelect} />
        {selected && (
          <>
            <Marker
              position={[selected.lat, selected.lng]}
              icon={markerIcon}
            />
            <FlyToLocation lat={selected.lat} lng={selected.lng} />
          </>
        )}
      </MapContainer>

      {selected && (
        <p className="text-sm text-green-600 mt-2">
          ✅ Location set
          {selected.city ? `: ${selected.area ? selected.area + ", " : ""}${selected.city}` : `: ${selected.lat.toFixed(4)}, ${selected.lng.toFixed(4)}`}
        </p>
      )}
    </div>
  );
}