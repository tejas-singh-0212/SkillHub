"use client";
import dynamic from "next/dynamic";

const MapComponent = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] bg-gray-100 rounded-xl flex items-center justify-center">
      <div className="text-center">
        <p className="text-4xl mb-2">🗺️</p>
        <p className="text-gray-500">Loading map...</p>
      </div>
    </div>
  ),
});

export default MapComponent;