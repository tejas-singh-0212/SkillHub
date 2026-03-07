import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { geohashForLocation } from "geofire-common";
import { db } from "./firebase";

export async function updateProfile(userId, data) {
  const updates = {
    name: data.name,
    bio: data.bio,
    phone: data.phone || "",
  };

  if (data.name) {
    updates.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      data.name
    )}&background=random&color=fff&size=200&bold=true`;
  }

  await updateDoc(doc(db, "users", userId), updates);
}

export async function updateLocation(userId, locationData) {
  const { lat, lng, city, area, fullAddress } = locationData;
  const geohash = geohashForLocation([lat, lng]);

  await updateDoc(doc(db, "users", userId), {
    location: {
      latitude: lat,
      longitude: lng,
      geohash,
      city: city || "",
      area: area || "",
      fullAddress: fullAddress || "",
    },
  });
}

export async function addSkillOffered(userId, skill) {
  const newSkill = {
    id: `skill_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name: skill.name,
    category: skill.category,
    level: skill.level || "intermediate",
    description: skill.description || "",
    priceType: skill.priceType || "free",
    price: skill.price || 0,
    perUnit: skill.perUnit || "hour",
    createdAt: new Date().toISOString(),
  };

  await updateDoc(doc(db, "users", userId), {
    skillsOffered: arrayUnion(newSkill),
  });

  return newSkill;
}

export async function removeSkillOffered(userId, skill) {
  await updateDoc(doc(db, "users", userId), {
    skillsOffered: arrayRemove(skill),
  });
}

export async function addSkillNeeded(userId, skill) {
  const newSkill = {
    id: `need_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name: skill.name,
    category: skill.category,
    description: skill.description || "",
    createdAt: new Date().toISOString(),
  };

  await updateDoc(doc(db, "users", userId), {
    skillsNeeded: arrayUnion(newSkill),
  });

  return newSkill;
}

export async function removeSkillNeeded(userId, skill) {
  await updateDoc(doc(db, "users", userId), {
    skillsNeeded: arrayRemove(skill),
  });
}

export async function completeOnboarding(userId) {
  await updateDoc(doc(db, "users", userId), {
    onboardingComplete: true,
  });
}

export const SKILL_CATEGORIES = [
  { id: "tutoring", icon: "📚", label: "Tutoring & Academics" },
  { id: "music", icon: "🎵", label: "Music & Instruments" },
  { id: "fitness", icon: "💪", label: "Fitness & Yoga" },
  { id: "art", icon: "🎨", label: "Art & Crafts" },
  { id: "tech", icon: "💻", label: "Tech & Programming" },
  { id: "cooking", icon: "🍳", label: "Cooking & Baking" },
  { id: "repairs", icon: "🔧", label: "Home Repairs" },
  { id: "language", icon: "🗣️", label: "Language Learning" },
  { id: "photography", icon: "📸", label: "Photography & Video" },
  { id: "gardening", icon: "🌱", label: "Gardening" },
  { id: "beauty", icon: "💇", label: "Beauty & Grooming" },
  { id: "other", icon: "✨", label: "Other Skills" },
];

export const PROFICIENCY_LEVELS = [
  { id: "beginner", label: "Beginner" },
  { id: "intermediate", label: "Intermediate" },
  { id: "expert", label: "Expert" },
];

export const PRICE_TYPES = [
  { id: "free", label: "🆓 Free", description: "I offer this for free" },
  { id: "paid", label: "💰 Paid", description: "I charge for this" },
  {
    id: "barter",
    label: "🔄 Barter",
    description: "Exchange for another skill",
  },
];