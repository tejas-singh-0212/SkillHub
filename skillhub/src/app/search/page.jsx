"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { searchNearbySkills, searchBySkillName } from "@/lib/search";
import { getCurrentLocation } from "@/lib/location";
import { SKILL_CATEGORIES } from "@/lib/users";
import { useAuth } from "@/components/AuthProvider";
import UserCard from "@/components/UserCard";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Suspense } from "react";

const DynamicMap = dynamic(() => import("@/components/Map/DynamicMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] bg-gray-100 rounded-xl flex items-center justify-center">
      <p className="text-gray-500">🗺️ Loading map...</p>
    </div>
  ),
});

const PAGE_SIZE = 12;

function SearchContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [viewMode, setViewMode] = useState("list");
  const [userLocation, setUserLocation] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searched, setSearched] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);

  const [queryText, setQueryText] = useState("");
  const [category, setCategory] = useState(
    searchParams.get("category") || ""
  );
  const [radius, setRadius] = useState(25);
  const [priceType, setPriceType] = useState("");
  const [minRating, setMinRating] = useState(0);

  useEffect(() => {
    getCurrentLocation()
      .then((loc) => setUserLocation(loc))
      .catch(() => {
        console.log("Location access denied — using default");
      });
  }, []);

  useEffect(() => {
    if (category && userLocation) {
      handleSearch();
    }
  }, [userLocation]);

  const handleSearch = async (isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setResults([]);
      setLastDoc(null);
      setHasMore(false);
    }
    setSearched(true);

    try {
      let data = [];

      // Nearby search
      if (userLocation) {
        const nearbyResults = await searchNearbySkills(
          userLocation.lat,
          userLocation.lng,
          radius,
          category,
          priceType,
          minRating,
          PAGE_SIZE,
          isLoadMore ? results : []
        );
        data = nearbyResults;
      }

      // Text search
      if (queryText.trim()) {
        const textResult = await searchBySkillName(
          queryText,
          minRating,
          isLoadMore ? lastDoc : null,
          PAGE_SIZE
        );

        for (const tr of textResult.results) {
          if (!data.find((d) => d.id === tr.id)) {
            data.push(tr);
          }
        }

        setLastDoc(textResult.lastDoc);
        setHasMore(textResult.hasMore);
      }

      // Exclude self
      if (user) {
        data = data.filter((d) => d.id !== user.uid);
      }

      if (isLoadMore) {
        setResults((prev) => {
          const existingIds = new Set(prev.map((r) => r.id));
          const newResults = data.filter((d) => !existingIds.has(d.id));
          return [...prev, ...newResults];
        });
      } else {
        setResults(data);
      }
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const mapResults = results
    .filter((r) => r.location?.latitude && r.location?.longitude)
    .map((r) => ({
      id: r.id,
      name: r.name,
      avatar: r.avatar,
      lat: r.location.latitude,
      lng: r.location.longitude,
      skills: r.skillsOffered?.map((s) => s.name) || [],
      rating: r.averageRating || 0,
      distance: r.distance,
    }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <h1 className="text-3xl font-bold mb-6">🔍 Find Skills Near You</h1>

      {/* Location Status */}
      {!userLocation && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
          <p className="text-yellow-700 text-sm">
            📍 Location not detected. Allow location access for better results,
            or search by skill name below.
          </p>
          <button
            onClick={() =>
              getCurrentLocation()
                .then(setUserLocation)
                .catch(() => {})
            }
            className="text-yellow-700 underline text-sm mt-1"
          >
            Try again
          </button>
        </div>
      )}

      {userLocation && (
        <p className="text-sm text-gray-500 mb-4">
          📍 Searching near:{" "}
          {userLocation.area
            ? `${userLocation.area}, ${userLocation.city}`
            : userLocation.city ||
              `${userLocation.lat.toFixed(2)}, ${userLocation.lng.toFixed(2)}`}
        </p>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border p-4 mb-6">
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Search skills (e.g., guitar, cooking)..."
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="flex-1 min-w-[200px] border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border rounded-lg px-3 py-2"
          >
            <option value="">All Categories</option>
            {SKILL_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.label}
              </option>
            ))}
          </select>

          <select
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="border rounded-lg px-3 py-2"
          >
            <option value={5}>Within 5 km</option>
            <option value={10}>Within 10 km</option>
            <option value={25}>Within 25 km</option>
            <option value={50}>Within 50 km</option>
          </select>

          <select
            value={priceType}
            onChange={(e) => setPriceType(e.target.value)}
            className="border rounded-lg px-3 py-2"
          >
            <option value="">Any Price</option>
            <option value="free">Free</option>
            <option value="barter">Barter</option>
            <option value="paid">Paid</option>
          </select>

           {/* rating Filter */}
          <select
            value={minRating}
            onChange={(e) => setMinRating(Number(e.target.value))}
            className="border rounded-lg px-3 py-2"
          >
            <option value={0}>Any Rating</option>
            <option value={4.5}>⭐ 4.5 & up</option>
            <option value={4.0}>⭐ 4.0 & up</option>
            <option value={3.0}>⭐ 3.0 & up</option>
          </select>

          <button
            onClick={() => handleSearch()}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </div>

      {/* View Toggle */}
      {searched && results.length > 0 && (
        <div className="flex justify-between items-center mb-4">
          <p className="text-gray-600">
            {results.length} result{results.length !== 1 ? "s" : ""} found
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("list")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                viewMode === "list"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              📋 List
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                viewMode === "map"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              🗺️ Map
            </button>
          </div>
        </div>
      )}

      {/* Map View */}
      {viewMode === "map" && searched && (
        <div className="mb-6">
          <DynamicMap
            userLocation={userLocation}
            searchResults={mapResults}
            radiusInKm={radius}
            onMarkerClick={(person) => router.push(`/profile/${person.id}`)}
          />
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && searched && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((person) => (
              <UserCard key={person.id} user={person} />
            ))}
          </div>

          {/* ✅ Load More Button */}
          {hasMore && (
            <div className="text-center mt-8">
              <button
                onClick={() => handleSearch(true)}
                disabled={loadingMore}
                className="bg-white border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-blue-50 transition disabled:opacity-50"
              >
                {loadingMore ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">🔄</span> Loading more...
                  </span>
                ) : (
                  "Load More Results"
                )}
              </button>
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {searched && !loading && results.length === 0 && (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">🔍</p>
          <h3 className="text-xl font-bold mb-2">No results found</h3>
          <p className="text-gray-600">
            Try a different search term, category, or increase the distance.
          </p>
        </div>
      )}

      {/* Initial State */}
      {!searched && (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">🌟</p>
          <h3 className="text-xl font-bold mb-2">
            Search for skills near you
          </h3>
          <p className="text-gray-600">
            Use the filters above and click Search to find skilled people nearby.
          </p>
        </div>
      )}

      {/* Browse by Category */}
      {!searched && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Browse by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {SKILL_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setCategory(cat.id);
                }}
                className="bg-white rounded-xl p-4 text-center hover:shadow-md transition border hover:border-blue-300"
              >
                <div className="text-2xl mb-1">{cat.icon}</div>
                <p className="text-xs font-medium text-gray-700">
                  {cat.label}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading search...
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}