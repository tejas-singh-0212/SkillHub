"use client";

import { useEffect } from "react";
import Link from "next/link";

interface ErrorProps {
 error: Error & { digest?: string };
 reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
 useEffect(() => {
 console.error("Caught by Error Boundary:", error);
 }, [error]);

 return (
 <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center">
 <div className="bg-red-50 p-6 rounded-full mb-6">
 <span className="text-6xl">🛠️</span>
 </div>
 <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Oops! Something went wrong</h1>
 <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto leading-relaxed">We hit a minor snag while trying to load this page. Don&apos;t worry, your data is safe.</p>
 <div className="flex flex-col sm:flex-row gap-4 justify-center">
 <button onClick={() => reset()} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition shadow-md dark:shadow-none flex items-center justify-center gap-2">
 <span>🔄</span> Try Again
 </button>
 <Link href="/dashboard" className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-2 border-gray-200 dark:border-gray-700 px-8 py-3 rounded-xl font-semibold hover:bg-gray-50 dark:bg-gray-900 transition flex items-center justify-center gap-2">
 <span>📊</span> Go to Dashboard
 </Link>
 </div>
 <p className="mt-12 text-xs text-gray-400">Error code: {error.message?.slice(0, 50) || "Unknown error"}</p>
 </div>
 );
}
