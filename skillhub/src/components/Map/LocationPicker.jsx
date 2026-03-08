"use client";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { useState, useEffect, useRef } from "react";
import { searchAddress } from "@/lib/location";

const markerIcon = L.icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// map click handler
function ClickHandler({ onSelect }) {
  useMapEvents({
    click(e) {
      e.originalEvent.preventDefault();
      e.originalEvent.stopPropagation();
      onSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

// fly to location when selected
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
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);
  const debounceTimer = useRef(null);

  // close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // debounced address search
  const handleSearchInput = (value) => {
    setSearchQuery(value);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (value.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    debounceTimer.current = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchAddress(value);
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
      } catch (err) {
        console.error("Search error:", err);
        setSuggestions([]);
      } finally {
        setSearching(false);
      }
    }, 500);
  };

  // handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    const enriched = {
      lat: suggestion.lat,
      lng: suggestion.lng,
      city: suggestion.city || "",
      area: suggestion.area || "",
      fullAddress: suggestion.displayName || "",
    };

    setSelected(enriched);
    setSearchQuery(suggestion.displayName || "");
    setSuggestions([]);
    setShowSuggestions(false);
    onLocationSelect(enriched);
  };

  // handle search button
  const handleSearchSubmit = async () => {
    if (searchQuery.length < 3) return;

    setSearching(true);
    try {
      const results = await searchAddress(searchQuery);
      if (results.length > 0) {
        handleSuggestionClick(results[0]);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setSearching(false);
    }
  };

  // handle map click — reverse geocode the clicked point
  const handleMapClick = async (coords) => {
    // immediately set marker at clicked position
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

      setSelected(enriched);
      setSearchQuery(data.display_name || "");
      onLocationSelect(enriched);
    } catch {
      // if reverse geocoding fails, still set the location with coords
      const fallback = {
        lat: coords.lat,
        lng: coords.lng,
        city: "",
        area: "",
        fullAddress: "",
      };
      setSelected(fallback);
      onLocationSelect(fallback);
    }
  };

  // handle clear
  const handleClear = () => {
    setSelected(null);
    setSearchQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const center = initialLocation || { lat: 20.5937, lng: 78.9629 };

  return (
    <div>
      {/* Search Bar */}
      <div className="relative mb-3" ref={searchRef} style={{ zIndex: 10 }}>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="🔍 Search city, area, or address..."
              value={searchQuery}
              onChange={(e) => handleSearchInput(e.target.value)}
              onFocus={() => {
                if (suggestions.length > 0) setShowSuggestions(true);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSearchSubmit();
                }
              }}
              className="w-full border rounded-xl px-4 py-3 pr-10 outline-none focus:ring-2 focus:ring-blue-500"
            />

            {searching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <span className="text-gray-400 animate-spin inline-block">🔄</span>
              </div>
            )}
          </div>

          <button
            onClick={handleSearchSubmit}
            disabled={searchQuery.length < 3 || searching}
            className="bg-blue-600 text-white px-4 py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-50 shrink-0"
          >
            Search
          </button>
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute w-full mt-1 bg-white border rounded-xl shadow-lg max-h-60 overflow-y-auto" style={{ zIndex: 20 }}>
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0 transition"
              >
                <div className="flex items-start gap-2">
                  <span className="text-gray-400 mt-0.5">📍</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {suggestion.city
                        ? `${suggestion.area ? suggestion.area + ", " : ""}${suggestion.city}`
                        : `${suggestion.lat.toFixed(4)}, ${suggestion.lng.toFixed(4)}`}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {suggestion.displayName}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No results */}
        {showSuggestions && suggestions.length === 0 && !searching && searchQuery.length >= 3 && (
          <div className="absolute w-full mt-1 bg-white border rounded-xl shadow-lg p-4 text-center text-gray-500 text-sm" style={{ zIndex: 20 }}>
            No locations found. Try a different search term.
          </div>
        )}
      </div>

      {/* Helper Text */}
      <p className="text-sm text-gray-500 mb-2">
        👆 Search above or click anywhere on the map to set your location
      </p>

      {/* map — z-index set to 1, pointer events enabled */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <MapContainer
          center={[center.lat, center.lng]}
          zoom={initialLocation ? 15 : 5}
          className="h-[300px] w-full rounded-xl border"
          style={{ zIndex: 1, cursor: "crosshair" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* map click handler — must be inside MapContainer */}
          <ClickHandler onSelect={handleMapClick} />
          
          {/* marker + fly animation */}
          {selected && selected.lat && selected.lng && (
            <>
              <Marker
                position={[selected.lat, selected.lng]}
                icon={markerIcon}
              />
              <FlyToLocation lat={selected.lat} lng={selected.lng} />
            </>
          )}
        </MapContainer>
      </div>

      {/* Selected Location Info */}
      {selected && selected.lat && selected.lng && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 mt-3">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-green-700 font-medium text-sm">
                ✅ Location set
              </p>
              <p className="text-green-600 text-sm mt-0.5 truncate">
                {selected.fullAddress
                  ? selected.fullAddress.length > 80
                    ? selected.fullAddress.substring(0, 80) + "..."
                    : selected.fullAddress
                  : selected.city
                  ? `${selected.area ? selected.area + ", " : ""}${selected.city}`
                  : `${selected.lat.toFixed(4)}, ${selected.lng.toFixed(4)}`}
              </p>
            </div>
            <button
              onClick={handleClear}
              className="text-gray-400 hover:text-red-500 text-lg ml-3 shrink-0"
              title="Clear location"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}