"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import {
  updateProfile,
  updateLocation,
  addSkillOffered,
  addSkillNeeded,
  completeOnboarding,
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

export default function OnboardingPage() {
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");

  const [location, setLocation] = useState(null);
  const [detectingLocation, setDetectingLocation] = useState(false);

  const [offeredSkills, setOfferedSkills] = useState([]);
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

  const [neededSkills, setNeededSkills] = useState([]);
  const [showAddNeeded, setShowAddNeeded] = useState(false);
  const [newNeeded, setNewNeeded] = useState({
    name: "",
    category: "",
    description: "",
  });

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setBio(profile.bio || "");
      setPhone(profile.phone || "");
      if (profile.location) {
        setLocation(toClientLocation(profile.location));
      }
      if (profile.onboardingComplete) router.push("/dashboard");
    }
  }, [profile, router]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  const handleAutoDetectLocation = async () => {
    setDetectingLocation(true);
    try {
      const loc = await getCurrentLocation();
      setLocation(loc);
      toast.success("Location detected successfully!");
    } catch (err) {
      toast.error("Could not detect location. Please pick on the map."); 
    } finally {
      setDetectingLocation(false);
    }
  };

  const handleAddOfferedSkill = () => {
    if (!newOffered.name || !newOffered.category) return;
    setOfferedSkills([...offeredSkills, { ...newOffered }]);
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
  };

  const handleAddNeededSkill = () => {
    if (!newNeeded.name || !newNeeded.category) return;
    setNeededSkills([...neededSkills, { ...newNeeded }]);
    setNewNeeded({ name: "", category: "", description: "" });
    setShowAddNeeded(false);
    toast.success("Skill added!");
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      await updateProfile(user.uid, { name, bio, phone });

      if (location) {
        await updateLocation(user.uid, location);
      }

      for (const skill of offeredSkills) {
        await addSkillOffered(user.uid, skill);
      }

      for (const skill of neededSkills) {
        await addSkillNeeded(user.uid, skill);
      }

      await completeOnboarding(user.uid);
      await refreshProfile();
      
      toast.success("Profile setup complete! Welcome to SkillHub 🚀");
      router.push("/dashboard");
    } catch (err) {
      toast.error("Error saving profile: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const steps = [
    { num: 1, label: "Basic Info" },
    { num: 2, label: "Location" },
    { num: 3, label: "Skills Offered" },
    { num: 4, label: "Skills Needed" },
  ];

  return (
    // Added animate-fade-in
    <div className="min-h-screen bg-gray-50 py-8 px-4 animate-fade-in">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-2">
          Set Up Your Profile
        </h1>
        <p className="text-gray-600 text-center mb-8">Step {step} of 4</p>

        {/* Progress Bar */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {steps.map((s) => (
            <div key={s.num} className="flex items-center gap-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition ${
                  step >= s.num
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {step > s.num ? "✓" : s.num}
              </div>
              {s.num < 4 && (
                <div
                  className={`w-8 sm:w-12 h-1 rounded ${
                    step > s.num ? "bg-blue-600" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              <h2 className="text-xl font-bold">👤 Basic Information</h2>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell people about yourself..."
                  rows={3}
                  className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Phone (optional)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!name.trim()}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50"
              >
                Next → Set Location
              </button>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-5 animate-fade-in">
              <h2 className="text-xl font-bold">📍 Your Location</h2>
              <p className="text-gray-600 text-sm">
                This helps people find skills near them
              </p>

              <button
                onClick={handleAutoDetectLocation}
                disabled={detectingLocation}
                className="w-full border-2 border-dashed border-blue-300 rounded-xl py-4 text-blue-600 font-medium hover:bg-blue-50 transition disabled:opacity-50"
              >
                {detectingLocation ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">🔄</span> Detecting your location...
                  </span>
                ) : (
                  "📍 Auto-Detect My Location"
                )}
              </button>

              <div className="text-center text-gray-400 text-sm">
                — or search / pick on the map —
              </div>

              <LocationPicker
                onLocationSelect={(loc) => setLocation(loc)}
                initialLocation={location}
              />

              {location && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <p className="text-green-700 font-medium">
                    Location set!
                  </p>
                  <p className="text-green-600 text-sm mt-1">
                    {formatLocationDisplay(location)}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 border border-gray-300 py-3 rounded-xl font-medium hover:bg-gray-50"
                >
                  ← Back
                </button>
                <button
                  onClick={() => {
                    if (!location) {
                      toast.error("Please select a location first!");
                      return;
                    }
                    setStep(3);
                  }}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                >
                  Next → Add Skills
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="space-y-5 animate-fade-in">
              <h2 className="text-xl font-bold">🎯 Skills You Offer</h2>
              <p className="text-gray-600 text-sm">
                What can you teach, do, or help others with?
              </p>

              {offeredSkills.map((skill, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between bg-blue-50 rounded-xl p-4 animate-fade-in"
                >
                  <div className="flex-1 min-w-0 mr-3">
                    <p className="font-semibold">{skill.name}</p>
                    <p className="text-sm text-gray-600">
                      {SKILL_CATEGORIES.find((c) => c.id === skill.category)?.icon}{" "}
                      {SKILL_CATEGORIES.find((c) => c.id === skill.category)?.label}{" "}
                      • {skill.level} •{" "}
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
                  <button
                    onClick={() => {
                      setOfferedSkills(offeredSkills.filter((_, i) => i !== index));
                      toast.success("Skill removed");
                    }}
                    className="text-red-500 hover:text-red-700 text-xl shrink-0"
                  >
                    ✕
                  </button>
                </div>
              ))}

              {showAddOffered ? (
                <div className="border-2 border-blue-200 rounded-xl p-4 space-y-3 animate-fade-in">
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
                      setNewOffered({
                        ...newOffered,
                        category: e.target.value,
                      })
                    }
                    className="w-full border rounded-lg px-4 py-2"
                  >
                    <option value="">Select Category</option>
                    {SKILL_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.label}
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
                      setNewOffered({
                        ...newOffered,
                        description: e.target.value,
                      })
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
                        className={`p-2 rounded-lg border-2 text-center text-sm font-medium transition ${
                          newOffered.priceType === pt.id
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        {pt.label}
                      </button>
                    ))}
                  </div>

                  {newOffered.priceType === "paid" && (
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="block text-xs text-gray-500 mb-1">
                          Price (₹)
                        </label>
                        <input
                          type="number"
                          placeholder="e.g., 500"
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
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Billing
                        </label>
                        <select
                          value={newOffered.perUnit}
                          onChange={(e) =>
                            setNewOffered({
                              ...newOffered,
                              perUnit: e.target.value,
                            })
                          }
                          className="border rounded-lg px-4 py-2 h-[42px]"
                        >
                          {PER_UNIT_OPTIONS.map((opt) => (
                            <option key={opt.id} value={opt.id}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setShowAddOffered(false)}
                      className="flex-1 border py-2 rounded-lg hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddOfferedSkill}
                      disabled={!newOffered.name || !newOffered.category}
                      className="flex-1 bg-blue-600 text-white py-2 rounded-lg disabled:opacity-50 hover:bg-blue-700 transition"
                    >
                      Add Skill
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddOffered(true)}
                  className="w-full border-2 border-dashed border-gray-300 rounded-xl py-4 text-gray-600 font-medium hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition"
                >
                  + Add a Skill You Offer
                </button>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 border border-gray-300 py-3 rounded-xl font-medium hover:bg-gray-50 transition"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setStep(4)}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
                >
                  Next → Skills Needed
                </button>
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div className="space-y-5 animate-fade-in">
              <h2 className="text-xl font-bold">🔍 Skills You Need</h2>
              <p className="text-gray-600 text-sm">
                What do you want to learn or get help with?
              </p>

              {neededSkills.map((skill, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between bg-green-50 rounded-xl p-4 animate-fade-in"
                >
                  <div className="flex-1 min-w-0 mr-3">
                    <p className="font-semibold">{skill.name}</p>
                    <p className="text-sm text-gray-600">
                      {SKILL_CATEGORIES.find((c) => c.id === skill.category)?.icon}{" "}
                      {SKILL_CATEGORIES.find((c) => c.id === skill.category)?.label}
                    </p>
                    {skill.description && (
                      <p className="text-sm text-gray-500 mt-1 italic">
                        "{skill.description}"
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setNeededSkills(neededSkills.filter((_, i) => i !== index));
                      toast.success("Skill removed");
                    }}
                    className="text-red-500 hover:text-red-700 text-xl shrink-0"
                  >
                    ✕
                  </button>
                </div>
              ))}

              {showAddNeeded ? (
                <div className="border-2 border-green-200 rounded-xl p-4 space-y-3 animate-fade-in">
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
                    {SKILL_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.label}
                      </option>
                    ))}
                  </select>
                  
                  <textarea
                    placeholder="What specifically do you need help with? (optional)"
                    value={newNeeded.description}
                    onChange={(e) =>
                      setNewNeeded({
                        ...newNeeded,
                        description: e.target.value,
                      })
                    }
                    rows={2}
                    className="w-full border rounded-lg px-4 py-2 resize-none outline-none focus:ring-2 focus:ring-green-500"
                  />
                  
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setShowAddNeeded(false)}
                      className="flex-1 border py-2 rounded-lg hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddNeededSkill}
                      disabled={!newNeeded.name || !newNeeded.category}
                      className="flex-1 bg-green-600 text-white py-2 rounded-lg disabled:opacity-50 hover:bg-green-700 transition"
                    >
                      Add Skill
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddNeeded(true)}
                  className="w-full border-2 border-dashed border-gray-300 rounded-xl py-4 text-gray-600 font-medium hover:border-green-400 hover:text-green-600 hover:bg-green-50 transition"
                >
                  + Add a Skill You Need
                </button>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 border border-gray-300 py-3 rounded-xl font-medium hover:bg-gray-50 transition"
                >
                  ← Back
                </button>
                <button
                  onClick={handleFinish}
                  disabled={saving}
                  className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition disabled:opacity-50"
                >
                  {saving ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">🔄</span> Saving...
                    </span>
                  ) : (
                    "Complete Setup"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}