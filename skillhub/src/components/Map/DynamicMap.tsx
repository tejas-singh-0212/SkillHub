"use client";
import dynamic from "next/dynamic";

const DynamicMap = dynamic(() => import("./MapView"), {
 ssr: false,
 loading: () => (
 <div className="h-[400px] bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
 <div className="text-center">
 <p className="text-4xl mb-2">🗺️</p>
 <p className="text-gray-500 dark:text-gray-400">Loading map...</p>
 </div>
 </div>
 ),
});

export default DynamicMap;
