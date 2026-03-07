"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import {
  updateProfile,
  updateLocation,
  addSkillOffered,
  addSkillNeeded,
  removeSkillOffered,
  removeSkillNeeded,
  SKILL_CATEGORIES,
  PROFICIENCY_LEVELS,
  PRICE_TYPES,
} from "@/lib/users";
import { getCurrentLocation, toClientLocation, formatLocationDisplay } from "@/lib/location";
import dynamic from "next/dynamic";

const LocationPicker = dynamic(
  () => import("@/components/Map/LocationPicker"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] bg-gray-100 rounded-xl flex items-center justify-center">
        <p className="text-gray-500">🗺️ Loading map...</p>
      </div>
    ),
  }
);

export default function ProfileEditPage() {
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState(null);
  const [detectingLocation, setDetectingLocation] = useState(false);

  const [showAddOffered, setShowAddOffered] = useState(false);
  const [newOffered, setNewOffered] = useState({
    name: "",
    category: "",
    level: "intermediate",
    description: "",
    priceType: "free",
    price: 0,
    perUnit: "hour",
  });

  const [showAddNeeded, setShowAddNeeded] = useState(false);
  const [newNeeded, setNewNeeded] = useState({
    name: "",
    category: "",
    description: "",
  });

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setBio(profile.bio || "");
      setPhone(profile.phone || "");
      // FIXED: Use helper to convert Firestore location to client format
      if (profile.location) {
        setLocation(toClientLocation(profile.location));
      }
    }
  }, [profile]);

  const handleSaveBasic = async () => {
    setSaving(true);
    try {
      await updateProfile(user.uid, { name, bio, phone });
      // FIXED: Pass location directly — updateLocation handles conversion
      if (location) {
        await updateLocation(user.uid, location);
      }
      await refreshProfile();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert("Error saving: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAutoDetect = async () => {
    setDetectingLocation(true);
    try {
      const loc = await getCurrentLocation();
      setLocation(loc);
    } catch {
      alert("Could not detect location.");
    } finally {
      setDetectingLocation(false);
    }
  };

  const handleAddOffered = async () => {
    if (!newOffered.name || !newOffered.category) return;
    try {
      await addSkillOffered(user.uid, newOffered);
      await refreshProfile();
      setNewOffered({
        name: "",
        category: "",
        level: "intermediate",
        description: "",
        priceType: "free",
        price: 0,
        perUnit: "hour",
      });
      setShowAddOffered(false);
    } catch (err) {
      alert("Error adding skill: " + err.message);
    }
  };

  const handleRemoveOffered = async (skill) => {
    try {
      await removeSkillOffered(user.uid, skill);
      await refreshProfile();
    } catch (err) {
      alert("Error removing skill: " + err.message);
    }
  };

  const handleAddNeeded = async () => {
    if (!newNeeded.name || !newNeeded.category) return;
    try {
      await addSkillNeeded(user.uid, newNeeded);
      await refreshProfile();
      setNewNeeded({ name: "", category: "", description: "" });
      setShowAddNeeded(false);
    } catch (err) {
      alert("Error adding skill: " + err.message);
    }
  };

  const handleRemoveNeeded = async (skill) => {
    try {
      await removeSkillNeeded(user.uid, skill);
      await refreshProfile();
    } catch (err) {
      alert("Error removing skill: " + err.message);
    }
  };

  if (authLoading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-bold mb-8">⚙️ Edit Profile</h1>

      {saved && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
          <p className="text-green-700 font-medium">✅ Profile saved!</p>
        </div>
      )}

      {/* Basic Info */}
      <div className="bg-white rounded-2xl border p-6 mb-6">
        <h2 className="text-lg font-bold mb-4">👤 Basic Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="bg-white rounded-2xl border p-6 mb-6">
        <h2 className="text-lg font-bold mb-4">📍 Location</h2>
        <button
          onClick={handleAutoDetect}
          disabled={detectingLocation}
          className="w-full border-2 border-dashed border-blue-300 rounded-xl py-3 text-blue-600 font-medium hover:bg-blue-50 transition disabled:opacity-50 mb-4"
        >
          {detectingLocation ? "Detecting..." : "📍 Auto-Detect Location"}
        </button>

        {/* FIXED: Always pass { lat, lng } format */}
        <LocationPicker
          onLocationSelect={(loc) => setLocation(loc)}
          initialLocation={location}
        />

        {/* FIXED: Use helper for display */}
        {location && (
          <p className="text-sm text-green-600 mt-2">
            {formatLocationDisplay(location)}
          </p>
        )}
      </div>

      {/* Save Button */}
      <button
        onClick={handleSaveBasic}
        disabled={saving}
        className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50 mb-8"
      >
        {saving ? "Saving..." : "💾 Save Changes"}
      </button>

      {/* Skills Offered */}
      <div className="bg-white rounded-2xl border p-6 mb-6">
        <h2 className="text-lg font-bold mb-4">🎯 Skills Offered</h2>
        <div className="space-y-3 mb-4">
          {profile.skillsOffered?.map((skill, i) => (
            <div
              key={i}
              className="flex items-center justify-between bg-blue-50 rounded-xl p-4"
            >
              <div>
                <p className="font-semibold">{skill.name}</p>
                <p className="text-sm text-gray-600">
                  {skill.category} • {skill.level} •{" "}
                  {skill.priceType === "free"
                    ? "Free"
                    : skill.priceType === "barter"
                    ? "Barter"
                    : `₹${skill.price}/${skill.perUnit}`}
                </p>
              </div>
              <button
                onClick={() => handleRemoveOffered(skill)}
                className="text-red-500 hover:text-red-700 text-lg"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {showAddOffered ? (
          <div className="border-2 border-blue-200 rounded-xl p-4 space-y-3">
            <input
              type="text"
              placeholder="Skill name"
              value={newOffered.name}
              onChange={(e) =>
                setNewOffered({ ...newOffered, name: e.target.value })
              }
              className="w-full border rounded-lg px-4 py-2 outline-none"
            />
            <select
              value={newOffered.category}
              onChange={(e) =>
                setNewOffered({ ...newOffered, category: e.target.value })
              }
              className="w-full border rounded-lg px-4 py-2"
            >
              <option value="">Select Category</option>
              {SKILL_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.label}
                </option>
              ))}
            </select>
            <select
              value={newOffered.level}
              onChange={(e) =>
                setNewOffered({ ...newOffered, level: e.target.value })
              }
              className="w-full border rounded-lg px-4 py-2"
            >
              {PROFICIENCY_LEVELS.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.label}
                </option>
              ))}
            </select>
            <div className="grid grid-cols-3 gap-2">
              {PRICE_TYPES.map((pt) => (
                <button
                  key={pt.id}
                  type="button"
                  onClick={() =>
                    setNewOffered({ ...newOffered, priceType: pt.id })
                  }
                  className={`p-2 rounded-lg border-2 text-sm font-medium ${
                    newOffered.priceType === pt.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200"
                  }`}
                >
                  {pt.label}
                </button>
              ))}
            </div>
            {newOffered.priceType === "paid" && (
              <input
                type="number"
                placeholder="Price (₹)"
                value={newOffered.price || ""}
                onChange={(e) =>
                  setNewOffered({
                    ...newOffered,
                    price: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full border rounded-lg px-4 py-2"
              />
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddOffered(false)}
                className="flex-1 border py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleAddOffered}
                disabled={!newOffered.name || !newOffered.category}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg disabled:opacity-50"
              >
                Add
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAddOffered(true)}
            className="w-full border-2 border-dashed border-gray-300 rounded-xl py-3 text-gray-600 hover:border-blue-400 hover:text-blue-600 transition"
          >
            + Add Skill Offered
          </button>
        )}
      </div>

      {/* Skills Needed */}
      <div className="bg-white rounded-2xl border p-6 mb-6">
        <h2 className="text-lg font-bold mb-4">🔍 Skills Needed</h2>
        <div className="space-y-3 mb-4">
          {profile.skillsNeeded?.map((skill, i) => (
            <div
              key={i}
              className="flex items-center justify-between bg-green-50 rounded-xl p-4"
            >
              <div>
                <p className="font-semibold">{skill.name}</p>
                <p className="text-sm text-gray-600">{skill.category}</p>
              </div>
              <button
                onClick={() => handleRemoveNeeded(skill)}
                className="text-red-500 hover:text-red-700 text-lg"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {showAddNeeded ? (
          <div className="border-2 border-green-200 rounded-xl p-4 space-y-3">
            <input
              type="text"
              placeholder="Skill you need"
              value={newNeeded.name}
              onChange={(e) =>
                setNewNeeded({ ...newNeeded, name: e.target.value })
              }
              className="w-full border rounded-lg px-4 py-2 outline-none"
            />
            <select
              value={newNeeded.category}
              onChange={(e) =>
                setNewNeeded({ ...newNeeded, category: e.target.value })
              }
              className="w-full border rounded-lg px-4 py-2"
            >
              <option value="">Select Category</option>
              {SKILL_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.label}
                </option>
              ))}
            </select>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddNeeded(false)}
                className="flex-1 border py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleAddNeeded}
                disabled={!newNeeded.name || !newNeeded.category}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg disabled:opacity-50"
              >
                Add
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAddNeeded(true)}
            className="w-full border-2 border-dashed border-gray-300 rounded-xl py-3 text-gray-600 hover:border-green-400 hover:text-green-600 transition"
          >
            + Add Skill Needed
          </button>
        )}
      </div>

      {/* View Profile Link */}
      <div className="text-center">
        <button
          onClick={() => router.push(`/profile/${user.uid}`)}
          className="text-blue-600 font-medium hover:underline"
        >
          👁️ View My Public Profile →
        </button>
      </div>
    </div>
  );
}