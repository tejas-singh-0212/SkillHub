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
  updateSkillOffered,
  updateSkillNeeded,
  uploadProfilePicture,
  SKILL_CATEGORIES,
  PROFICIENCY_LEVELS,
  PRICE_TYPES,
  PER_UNIT_OPTIONS,
} from "@/lib/users";
import { getCurrentLocation, toClientLocation, formatLocationDisplay } from "@/lib/location";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";

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
const [uploadingImage, setUploadingImage] = useState(false);

  
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState(null);
  const [detectingLocation, setDetectingLocation] = useState(false);

  // Add Offered Skill
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

  // Edit Offered Skill
  const [editingOffered, setEditingOffered] = useState(null);
  const [editOfferedData, setEditOfferedData] = useState({
    name: "",
    category: "",
    level: "intermediate",
    description: "",
    priceType: "free",
    price: 0,
    perUnit: "hour",
  });

  // Add Needed Skill
  const [showAddNeeded, setShowAddNeeded] = useState(false);
  const [newNeeded, setNewNeeded] = useState({
    name: "",
    category: "",
    description: "",
  });

  // Edit Needed Skill
  const [editingNeeded, setEditingNeeded] = useState(null);
  const [editNeededData, setEditNeededData] = useState({
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
      if (profile.location) {
        setLocation(toClientLocation(profile.location));
      }
    }
  }, [profile]);

  // Basic Info Handlers
  const handleSaveBasic = async () => {
    setSaving(true);
    try {
      await updateProfile(user.uid, { name, bio, phone });
      if (location) {
        await updateLocation(user.uid, location);
      }
      await refreshProfile();
      toast.success("Profile updated successfully!"); 
    } catch (err) {
      toast.error("Error saving: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAutoDetect = async () => {
    setDetectingLocation(true);
    try {
      const loc = await getCurrentLocation();
      setLocation(loc);
      toast.success("Location detected!"); 
    } catch {
      toast.error("Could not detect location. Please check browser permissions."); 
    } finally {
      setDetectingLocation(false);
    }
  };

  // Offered Skill Handlers
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
      toast.success("Skill added!");
    } catch (err) {
      toast.error("Error adding skill: " + err.message);
    }
  };

  const handleRemoveOffered = async (skill) => {
    if (!confirm(`Remove "${skill.name}" from your offered skills?`)) return;
    try {
      await removeSkillOffered(user.uid, skill);
      await refreshProfile();
      toast.success("Skill removed");
    } catch (err) {
      toast.error("Error removing skill: " + err.message); 
    }
  };

  const handleStartEditOffered = (skill) => {
    setEditingOffered(skill.id);
    setEditOfferedData({
      name: skill.name,
      category: skill.category,
      level: skill.level || "intermediate",
      description: skill.description || "",
      priceType: skill.priceType || "free",
      price: skill.price || 0,
      perUnit: skill.perUnit || "hour",
    });
    setShowAddOffered(false);
  };

  const handleSaveEditOffered = async () => {
    if (!editOfferedData.name || !editOfferedData.category) return;
    try {
      await updateSkillOffered(user.uid, editingOffered, editOfferedData);
      await refreshProfile();
      setEditingOffered(null);
      toast.success("Skill updated!"); 
    } catch (err) {
      toast.error("Error updating skill: " + err.message); 
    }
  };

  // Needed Skill Handlers
  const handleAddNeeded = async () => {
    if (!newNeeded.name || !newNeeded.category) return;
    try {
      await addSkillNeeded(user.uid, newNeeded);
      await refreshProfile();
      setNewNeeded({ name: "", category: "", description: "" });
      setShowAddNeeded(false);
      toast.success("Skill added!");
    } catch (err) {
      toast.error("Error adding skill: " + err.message); 
    }
  };

  const handleRemoveNeeded = async (skill) => {
    if (!confirm(`Remove "${skill.name}" from your needed skills?`)) return;
    try {
      await removeSkillNeeded(user.uid, skill);
      await refreshProfile();
      toast.success("Skill removed"); 
    } catch (err) {
      toast.error("Error removing skill: " + err.message); 
    }
  };

  const handleStartEditNeeded = (skill) => {
    setEditingNeeded(skill.id);
    setEditNeededData({
      name: skill.name,
      category: skill.category,
      description: skill.description || "",
    });
    setShowAddNeeded(false);
  };

  const handleSaveEditNeeded = async () => {
    if (!editNeededData.name || !editNeededData.category) return;
    try {
      await updateSkillNeeded(user.uid, editingNeeded, editNeededData);
      await refreshProfile();
      setEditingNeeded(null);
      toast.success("Skill updated!"); 
    } catch (err) {
      toast.error("Error updating skill: " + err.message); 
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
      

      {/* Basic Info */}
      <div className="bg-white rounded-2xl border p-6 mb-6">
        <h2 className="text-lg font-bold mb-4">👤 Basic Information</h2>
                {/* profile picture upload */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-6 pb-6 border-b">
          <img
            src={
              profile.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "U")}&background=random`
            }
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover border-4 border-gray-100"
          />
          <div>
            <p className="font-medium mb-1">Profile Picture</p>
            <label className={`cursor-pointer bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition inline-block ${uploadingImage ? 'opacity-50 pointer-events-none' : ''}`}>
              {uploadingImage ? "Uploading..." : "📷 Change Photo"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  
                  if (file.size > 5 * 1024 * 1024) {
                    toast.error("Image must be smaller than 5MB");
                    return;
                  }

                  setUploadingImage(true);
                  try {
                    await uploadProfilePicture(user.uid, file);
                    await refreshProfile();
                    toast.success("Profile picture updated!");
                  } catch (err) {
                    toast.error("Failed to upload picture");
                  } finally {
                    setUploadingImage(false);
                  }
                }}
              />
            </label>
            <p className="text-xs text-gray-500 mt-2">JPG, PNG or GIF (Max 5MB)</p>
          </div>
        </div>
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

        <LocationPicker
          onLocationSelect={(loc) => setLocation(loc)}
          initialLocation={location}
        />

        {location && (
          <p className="text-sm text-green-600 mt-2">
            ✅ {formatLocationDisplay(location)}
          </p>
        )}
      </div>

      {/* Save Basic Info */}
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
            <div key={skill.id || i}>
              {/* Edit Mode */}
              {editingOffered === skill.id ? (
                <div className="border-2 border-blue-400 rounded-xl p-4 space-y-3 bg-blue-50">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-blue-700">✏️ Editing Skill</p>
                  </div>

                  <input
                    type="text"
                    placeholder="Skill name"
                    value={editOfferedData.name}
                    onChange={(e) =>
                      setEditOfferedData({ ...editOfferedData, name: e.target.value })
                    }
                    className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  <select
                    value={editOfferedData.category}
                    onChange={(e) =>
                      setEditOfferedData({ ...editOfferedData, category: e.target.value })
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
                    value={editOfferedData.level}
                    onChange={(e) =>
                      setEditOfferedData({ ...editOfferedData, level: e.target.value })
                    }
                    className="w-full border rounded-lg px-4 py-2"
                  >
                    {PROFICIENCY_LEVELS.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.label}
                      </option>
                    ))}
                  </select>

                  <textarea
                    placeholder="Brief description (optional)"
                    value={editOfferedData.description}
                    onChange={(e) =>
                      setEditOfferedData({ ...editOfferedData, description: e.target.value })
                    }
                    rows={2}
                    className="w-full border rounded-lg px-4 py-2 resize-none outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  <div className="grid grid-cols-3 gap-2">
                    {PRICE_TYPES.map((pt) => (
                      <button
                        key={pt.id}
                        type="button"
                        onClick={() =>
                          setEditOfferedData({ ...editOfferedData, priceType: pt.id })
                        }
                        className={`p-2 rounded-lg border-2 text-sm font-medium ${
                          editOfferedData.priceType === pt.id
                            ? "border-blue-500 bg-white"
                            : "border-gray-200"
                        }`}
                      >
                        {pt.label}
                      </button>
                    ))}
                  </div>

                  {editOfferedData.priceType === "paid" && (
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <input
                          type="number"
                          placeholder="Price (₹)"
                          value={editOfferedData.price || ""}
                          onChange={(e) =>
                            setEditOfferedData({
                              ...editOfferedData,
                              price: parseInt(e.target.value) || 0,
                            })
                          }
                          className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <select
                        value={editOfferedData.perUnit}
                        onChange={(e) =>
                          setEditOfferedData({
                            ...editOfferedData,
                            perUnit: e.target.value,
                          })
                        }
                        className="border rounded-lg px-4 py-2"
                      >
                        {PER_UNIT_OPTIONS.map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => setEditingOffered(null)}
                      className="flex-1 border py-2 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveEditOffered}
                      disabled={!editOfferedData.name || !editOfferedData.category}
                      className="flex-1 bg-blue-600 text-white py-2 rounded-lg disabled:opacity-50 hover:bg-blue-700"
                    >
                      💾 Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                /* Display Mode */
                <div className="flex items-start justify-between bg-blue-50 rounded-xl p-4">
                  <div className="flex-1 min-w-0 mr-3">
                    <p className="font-semibold">{skill.name}</p>
                    <p className="text-sm text-gray-600">
                      {skill.category} • {skill.level} •{" "}
                      {skill.priceType === "free"
                        ? "Free"
                        : skill.priceType === "barter"
                        ? "Barter"
                        : `₹${skill.price} ${PER_UNIT_OPTIONS.find((o) => o.id === skill.perUnit)?.label || skill.perUnit}`}
                    </p>
                    {skill.description && (
                      <p className="text-sm text-gray-500 mt-1 italic">
                        "{skill.description}"
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleStartEditOffered(skill)}
                      className="text-blue-500 hover:text-blue-700 text-sm font-medium px-2 py-1 rounded-lg hover:bg-blue-100 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleRemoveOffered(skill)}
                      className="text-red-400 hover:text-red-600 text-lg"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add New Offered Skill */}
        {showAddOffered ? (
          <div className="border-2 border-blue-200 rounded-xl p-4 space-y-3">
            <input
              type="text"
              placeholder="Skill name (e.g., Guitar Lessons)"
              value={newOffered.name}
              onChange={(e) =>
                setNewOffered({ ...newOffered, name: e.target.value })
              }
              className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
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

            <textarea
              placeholder="Brief description — what exactly do you offer? (optional)"
              value={newOffered.description}
              onChange={(e) =>
                setNewOffered({ ...newOffered, description: e.target.value })
              }
              rows={2}
              className="w-full border rounded-lg px-4 py-2 resize-none outline-none focus:ring-2 focus:ring-blue-500"
            />

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
              <div className="flex gap-3">
                <div className="flex-1">
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
                    className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <select
                  value={newOffered.perUnit}
                  onChange={(e) =>
                    setNewOffered({ ...newOffered, perUnit: e.target.value })
                  }
                  className="border rounded-lg px-4 py-2"
                >
                  {PER_UNIT_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
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
            onClick={() => {
              setShowAddOffered(true);
              setEditingOffered(null);
            }}
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
            <div key={skill.id || i}>
              {/* Edit Mode */}
              {editingNeeded === skill.id ? (
                <div className="border-2 border-green-400 rounded-xl p-4 space-y-3 bg-green-50">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-green-700">✏️ Editing Skill</p>
                  </div>

                  <input
                    type="text"
                    placeholder="Skill you need"
                    value={editNeededData.name}
                    onChange={(e) =>
                      setEditNeededData({ ...editNeededData, name: e.target.value })
                    }
                    className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-green-500"
                  />

                  <select
                    value={editNeededData.category}
                    onChange={(e) =>
                      setEditNeededData({ ...editNeededData, category: e.target.value })
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

                  <textarea
                    placeholder="What specifically do you need help with? (optional)"
                    value={editNeededData.description}
                    onChange={(e) =>
                      setEditNeededData({ ...editNeededData, description: e.target.value })
                    }
                    rows={2}
                    className="w-full border rounded-lg px-4 py-2 resize-none outline-none focus:ring-2 focus:ring-green-500"
                  />

                  <div className="flex gap-3">
                    <button
                      onClick={() => setEditingNeeded(null)}
                      className="flex-1 border py-2 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveEditNeeded}
                      disabled={!editNeededData.name || !editNeededData.category}
                      className="flex-1 bg-green-600 text-white py-2 rounded-lg disabled:opacity-50 hover:bg-green-700"
                    >
                      💾 Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                /* Display Mode */
                <div className="flex items-start justify-between bg-green-50 rounded-xl p-4">
                  <div className="flex-1 min-w-0 mr-3">
                    <p className="font-semibold">{skill.name}</p>
                    <p className="text-sm text-gray-600">{skill.category}</p>
                    {skill.description && (
                      <p className="text-sm text-gray-500 mt-1 italic">
                        "{skill.description}"
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleStartEditNeeded(skill)}
                      className="text-green-500 hover:text-green-700 text-sm font-medium px-2 py-1 rounded-lg hover:bg-green-100 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleRemoveNeeded(skill)}
                      className="text-red-400 hover:text-red-600 text-lg"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add New Needed Skill */}
        {showAddNeeded ? (
          <div className="border-2 border-green-200 rounded-xl p-4 space-y-3">
            <input
              type="text"
              placeholder="Skill you need (e.g., Web Development)"
              value={newNeeded.name}
              onChange={(e) =>
                setNewNeeded({ ...newNeeded, name: e.target.value })
              }
              className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-green-500"
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

            <textarea
              placeholder="What specifically do you need help with? (optional)"
              value={newNeeded.description}
              onChange={(e) =>
                setNewNeeded({ ...newNeeded, description: e.target.value })
              }
              rows={2}
              className="w-full border rounded-lg px-4 py-2 resize-none outline-none focus:ring-2 focus:ring-green-500"
            />

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
            onClick={() => {
              setShowAddNeeded(true);
              setEditingNeeded(null);
            }}
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
          View My Public Profile →
        </button>
      </div>
    </div>
  );
}