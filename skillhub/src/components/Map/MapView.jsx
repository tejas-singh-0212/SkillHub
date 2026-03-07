"use client";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";

const userIcon = L.icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const providerIcon = L.icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});


function RecenterMap({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], 13);
    }
  }, [lat, lng, map]);
  return null;
}

export default function MapView({
  userLocation,
  searchResults,
  radiusInKm,
  onMarkerClick,
}) {
  const center = userLocation || { lat: 20.5937, lng: 78.9629 };

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={userLocation ? 13 : 5}
      className="h-[400px] w-full rounded-xl"
      style={{ zIndex: 1 }}
    >
      {/* FREE map tiles from OpenStreetMap — no API key needed */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <RecenterMap lat={center.lat} lng={center.lng} />

      {/* Search radius circle */}
      {userLocation && radiusInKm && (
        <Circle
          center={[userLocation.lat, userLocation.lng]}
          radius={radiusInKm * 1000}
          pathOptions={{
            color: "#3B82F6",
            fillColor: "#3B82F6",
            fillOpacity: 0.08,
            weight: 2,
          }}
        />
      )}

      {/* YOUR location marker (blue) */}
      {userLocation && (
        <Marker
          position={[userLocation.lat, userLocation.lng]}
          icon={userIcon}
        >
          <Popup>
            <div className="text-center font-semibold">📍 You are here</div>
          </Popup>
        </Marker>
      )}

      {/* SEARCH RESULTS markers (red) */}
      {searchResults?.map((person) => (
        <Marker
          key={person.id}
          position={[person.lat, person.lng]}
          icon={providerIcon}
          eventHandlers={{
            click: () => onMarkerClick?.(person),
          }}
        >
          <Popup>
            <div className="min-w-[180px]">
              <div className="flex items-center gap-2 mb-1">
                <img
                  src={
                    person.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      person.name || "U"
                    )}&background=random&size=40`
                  }
                  className="w-8 h-8 rounded-full object-cover"
                  alt=""
                />
                <div>
                  <p className="font-bold text-sm">{person.name}</p>
                  <p className="text-xs text-gray-500">
                    📍 {person.distance} km away
                  </p>
                </div>
              </div>

              <div className="text-xs space-y-1 mt-2">
                {person.skills?.slice(0, 2).map((skill, i) => (
                  <span
                    key={i}
                    className="inline-block bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full mr-1"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              <div className="flex justify-between items-center mt-2">
                <span className="text-xs">⭐ {person.rating || "New"}</span>
                <button
                  onClick={() => onMarkerClick?.(person)}
                  className="text-xs bg-blue-500 text-white px-3 py-1 rounded-full hover:bg-blue-600"
                >
                  View Profile
                </button>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}