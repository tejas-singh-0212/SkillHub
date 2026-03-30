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
import type { ClientLocation, AddressSearchResult } from "@/types";

const markerIcon = L.icon({
 iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
 shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
 iconSize: [25, 41],
 iconAnchor: [12, 41],
 popupAnchor: [1, -34],
});

function ClickHandler({ onSelect }: { onSelect: (coords: { lat: number; lng: number }) => void }) {
 useMapEvents({
 click(e) {
 e.originalEvent.preventDefault();
 e.originalEvent.stopPropagation();
 onSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
 },
 });
 return null;
}

function FlyToLocation({ lat, lng }: { lat: number; lng: number }) {
 const map = useMap();
 useEffect(() => {
 if (lat && lng) {
 map.flyTo([lat, lng], 15, { duration: 1.5 });
 }
 }, [lat, lng, map]);
 return null;
}

interface LocationPickerProps {
 onLocationSelect: (location: ClientLocation) => void;
 initialLocation?: ClientLocation | null;
}

export default function LocationPicker({ onLocationSelect, initialLocation }: LocationPickerProps) {
 const [selected, setSelected] = useState<ClientLocation | null>(initialLocation || null);
 const [searchQuery, setSearchQuery] = useState("");
 const [suggestions, setSuggestions] = useState<AddressSearchResult[]>([]);
 const [searching, setSearching] = useState(false);
 const [showSuggestions, setShowSuggestions] = useState(false);
 const searchRef = useRef<HTMLDivElement>(null);
 const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

 useEffect(() => {
 const handleClickOutside = (e: MouseEvent) => {
 if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
 setShowSuggestions(false);
 }
 };
 document.addEventListener("mousedown", handleClickOutside);
 return () => document.removeEventListener("mousedown", handleClickOutside);
 }, []);

 const handleSearchInput = (value: string) => {
 setSearchQuery(value);
 if (debounceTimer.current) clearTimeout(debounceTimer.current);
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

 const handleSuggestionClick = (suggestion: AddressSearchResult) => {
 const enriched: ClientLocation = {
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

 const handleMapClick = async (coords: { lat: number; lng: number }) => {
 setSelected(coords as ClientLocation);
 try {
 const res = await fetch(
 `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}&zoom=16`
 );
 const data = await res.json();
 const enriched: ClientLocation = {
 lat: coords.lat,
 lng: coords.lng,
 city: data.address?.city || data.address?.town || data.address?.village || "",
 area: data.address?.suburb || data.address?.neighbourhood || "",
 fullAddress: data.display_name || "",
 };
 setSelected(enriched);
 setSearchQuery(data.display_name || "");
 onLocationSelect(enriched);
 } catch {
 const fallback: ClientLocation = { lat: coords.lat, lng: coords.lng, city: "", area: "", fullAddress: "" };
 setSelected(fallback);
 onLocationSelect(fallback);
 }
 };

 const handleClear = () => {
 setSelected(null);
 setSearchQuery("");
 setSuggestions([]);
 setShowSuggestions(false);
 };

 const center = initialLocation || { lat: 20.5937, lng: 78.9629 };

 return (
 <div>
 <div className="relative mb-3" ref={searchRef} style={{ zIndex: 10 }}>
 <div className="flex gap-2">
 <div className="relative flex-1">
 <input
 type="text"
 placeholder="🔍 Search city, area, or address..."
 value={searchQuery}
 onChange={(e) => handleSearchInput(e.target.value)}
 onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
 onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSearchSubmit(); } }}
 className="w-full border dark:border-gray-700 rounded-xl px-4 py-3 pr-10 outline-none focus:ring-2 focus:ring-blue-500"
 />
 {searching && (
 <div className="absolute right-3 top-1/2 -translate-y-1/2">
 <span className="text-gray-400 animate-spin inline-block">🔄</span>
 </div>
 )}
 </div>
 <button onClick={handleSearchSubmit} disabled={searchQuery.length < 3 || searching} className="bg-blue-600 text-white px-4 py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-50 shrink-0">
 Search
 </button>
 </div>
 {showSuggestions && suggestions.length > 0 && (
 <div className="absolute w-full mt-1 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl shadow-lg dark:shadow-none max-h-60 overflow-y-auto" style={{ zIndex: 20 }}>
 {suggestions.map((suggestion, index) => (
 <div key={index} onClick={() => handleSuggestionClick(suggestion)} className="px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/30 cursor-pointer border-b dark:border-gray-700 last:border-b-0 transition">
 <div className="flex items-start gap-2">
 <span className="text-gray-400 mt-0.5">📍</span>
 <div className="flex-1 min-w-0">
 <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
 {suggestion.city
 ? `${suggestion.area ? suggestion.area + ", " : ""}${suggestion.city}`
 : `${suggestion.lat.toFixed(4)}, ${suggestion.lng.toFixed(4)}`}
 </p>
 <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{suggestion.displayName}</p>
 </div>
 </div>
 </div>
 ))}
 </div>
 )}
 {showSuggestions && suggestions.length === 0 && !searching && searchQuery.length >= 3 && (
 <div className="absolute w-full mt-1 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl shadow-lg dark:shadow-none p-4 text-center text-gray-500 dark:text-gray-400 text-sm" style={{ zIndex: 20 }}>
 No locations found. Try a different search term.
 </div>
 )}
 </div>
 <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Search above</p>
 <div style={{ position: "relative", zIndex: 1 }}>
 <MapContainer
 center={[center.lat, center.lng]}
 zoom={initialLocation ? 15 : 5}
 className="h-[300px] w-full rounded-xl border dark:border-gray-700"
 style={{ zIndex: 1, cursor: "crosshair" }}
 >
 <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
 <ClickHandler onSelect={handleMapClick} />
 {selected && selected.lat && selected.lng && (
 <>
 <Marker position={[selected.lat, selected.lng]} icon={markerIcon} />
 <FlyToLocation lat={selected.lat} lng={selected.lng} />
 </>
 )}
 </MapContainer>
 </div>
 {selected && selected.lat && selected.lng && (
 <div className="bg-green-50 dark:bg-green-900/30 border dark:border-gray-700 border-green-200 rounded-xl p-3 mt-3">
 <div className="flex items-center justify-between">
 <div className="flex-1 min-w-0">
 <p className="text-green-700 dark:text-green-300 font-medium text-sm">✅ Location set</p>
 <p className="text-green-600 dark:text-green-400 text-sm mt-0.5 truncate">
 {selected.fullAddress
 ? selected.fullAddress.length > 80 ? selected.fullAddress.substring(0, 80) + "..." : selected.fullAddress
 : selected.city
 ? `${selected.area ? selected.area + ", " : ""}${selected.city}`
 : `${selected.lat.toFixed(4)}, ${selected.lng.toFixed(4)}`}
 </p>
 </div>
 <button onClick={handleClear} className="text-gray-400 hover:text-red-500 text-lg ml-3 shrink-0" title="Clear location">✕</button>
 </div>
 </div>
 )}
 </div>
 );
}
