import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { geohashForLocation } from "geofire-common";
import { db } from "./firebase";
import type {
  SkillCategory,
  ProficiencyLevel,
  PriceTypeOption,
  PerUnitOption,
  SkillOffered,
  SkillNeeded,
  ProfileUpdateData,
  LocationUpdateData,
  NewSkillOfferedInput,
  NewSkillNeededInput,
} from "@/types";

// Update basic profile info
export async function updateProfile(userId: string, data: ProfileUpdateData): Promise<void> {
  const updates: Record<string, string> = {
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

// Update location with geohash
export async function updateLocation(userId: string, locationData: LocationUpdateData): Promise<void> {
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

// Add skill offered
export async function addSkillOffered(userId: string, skill: NewSkillOfferedInput): Promise<SkillOffered> {
  const newSkill: SkillOffered = {
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

// Remove skill offered (filter by ID)
export async function removeSkillOffered(userId: string, skill: { id: string }): Promise<void> {
  const userDoc = await getDoc(doc(db, "users", userId));
  
  if (!userDoc.exists()) {
    throw new Error("User not found");
  }

  const userData = userDoc.data();
  const currentSkills: SkillOffered[] = userData.skillsOffered || [];
  const updatedSkills = currentSkills.filter((s) => s.id !== skill.id);

  await updateDoc(doc(db, "users", userId), {
    skillsOffered: updatedSkills,
  });
}

// Update an existing offered skill
export async function updateSkillOffered(
  userId: string,
  skillId: string,
  updatedData: NewSkillOfferedInput
): Promise<void> {
  const userDoc = await getDoc(doc(db, "users", userId));

  if (!userDoc.exists()) {
    throw new Error("User not found");
  }

  const userData = userDoc.data();
  const currentSkills: SkillOffered[] = userData.skillsOffered || [];

  const updatedSkills = currentSkills.map((skill) => {
    if (skill.id === skillId) {
      return {
        ...skill,
        name: updatedData.name,
        category: updatedData.category,
        level: updatedData.level || "intermediate",
        description: updatedData.description || "",
        priceType: updatedData.priceType || "free",
        price: updatedData.price || 0,
        perUnit: updatedData.perUnit || "hour",
        updatedAt: new Date().toISOString(),
      };
    }
    return skill;
  });

  await updateDoc(doc(db, "users", userId), {
    skillsOffered: updatedSkills,
  });
}

// Add skill needed
export async function addSkillNeeded(userId: string, skill: NewSkillNeededInput): Promise<SkillNeeded> {
  const newSkill: SkillNeeded = {
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

// Remove skill needed (filter by ID)
export async function removeSkillNeeded(userId: string, skill: { id: string }): Promise<void> {
  const userDoc = await getDoc(doc(db, "users", userId));
  
  if (!userDoc.exists()) {
    throw new Error("User not found");
  }

  const userData = userDoc.data();
  const currentSkills: SkillNeeded[] = userData.skillsNeeded || [];
  const updatedSkills = currentSkills.filter((s) => s.id !== skill.id);

  await updateDoc(doc(db, "users", userId), {
    skillsNeeded: updatedSkills,
  });
}

// Update an existing needed skill
export async function updateSkillNeeded(
  userId: string,
  skillId: string,
  updatedData: NewSkillNeededInput
): Promise<void> {
  const userDoc = await getDoc(doc(db, "users", userId));

  if (!userDoc.exists()) {
    throw new Error("User not found");
  }

  const userData = userDoc.data();
  const currentSkills: SkillNeeded[] = userData.skillsNeeded || [];

  const updatedSkills = currentSkills.map((skill) => {
    if (skill.id === skillId) {
      return {
        ...skill,
        name: updatedData.name,
        category: updatedData.category,
        description: updatedData.description || "",
        updatedAt: new Date().toISOString(),
      };
    }
    return skill;
  });

  await updateDoc(doc(db, "users", userId), {
    skillsNeeded: updatedSkills,
  });
}

// Complete onboarding
export async function completeOnboarding(userId: string): Promise<void> {
  await updateDoc(doc(db, "users", userId), {
    onboardingComplete: true,
  });
}

// Constants
export const SKILL_CATEGORIES: SkillCategory[] = [
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

export const PROFICIENCY_LEVELS: ProficiencyLevel[] = [
  { id: "beginner", label: "Beginner" },
  { id: "intermediate", label: "Intermediate" },
  { id: "expert", label: "Expert" },
];

export const PRICE_TYPES: PriceTypeOption[] = [
  { id: "free", label: "🆓 Free", description: "I offer this for free" },
  { id: "paid", label: "💰 Paid", description: "I charge for this" },
  {
    id: "barter",
    label: "🔄 Barter",
    description: "Exchange for another skill",
  },
];

export const PER_UNIT_OPTIONS: PerUnitOption[] = [
  { id: "hour", label: "per hour", shortLabel: "/hr" },
  { id: "session", label: "per session", shortLabel: "/session" },
  { id: "day", label: "per day", shortLabel: "/day" },
];

// Upload Profile Picture (Via ImgBB)
export async function uploadProfilePicture(userId: string, file: File): Promise<string> {
  if (!file) throw new Error("No file provided");

  const formData = new FormData();
  formData.append("image", file);

  const IMGBB_API_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
  const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();

  if (!data.success) {
    throw new Error("Failed to upload image");
  }

  const imageUrl: string = data.data.url;

  await updateDoc(doc(db, "users", userId), {
    avatar: imageUrl,
  });

  return imageUrl;
}
