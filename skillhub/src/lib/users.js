import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { geohashForLocation } from "geofire-common";
import { db } from "./firebase";

// Update basic profile info
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

// Update location with geohash
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

// Add skill offered
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

// Remove skill offered (FIXED - filter by ID)
export async function removeSkillOffered(userId, skill) {
  // Fetch current user data
  const userDoc = await getDoc(doc(db, "users", userId));
  
  if (!userDoc.exists()) {
    throw new Error("User not found");
  }

  const userData = userDoc.data();
  const currentSkills = userData.skillsOffered || [];

  // Filter out the skill by ID
  const updatedSkills = currentSkills.filter((s) => s.id !== skill.id);

  // Write back the filtered array
  await updateDoc(doc(db, "users", userId), {
    skillsOffered: updatedSkills,
  });
}

// Update an existing offered skill
export async function updateSkillOffered(userId, skillId, updatedData) {
  const userDoc = await getDoc(doc(db, "users", userId));

  if (!userDoc.exists()) {
    throw new Error("User not found");
  }

  const userData = userDoc.data();
  const currentSkills = userData.skillsOffered || [];

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

// Remove skill needed (FIXED - filter by ID)
export async function removeSkillNeeded(userId, skill) {
  // Fetch current user data
  const userDoc = await getDoc(doc(db, "users", userId));
  
  if (!userDoc.exists()) {
    throw new Error("User not found");
  }

  const userData = userDoc.data();
  const currentSkills = userData.skillsNeeded || [];

  // Filter out the skill by ID
  const updatedSkills = currentSkills.filter((s) => s.id !== skill.id);

  // Write back the filtered array
  await updateDoc(doc(db, "users", userId), {
    skillsNeeded: updatedSkills,
  });
}

// Update an existing needed skill
export async function updateSkillNeeded(userId, skillId, updatedData) {
  const userDoc = await getDoc(doc(db, "users", userId));

  if (!userDoc.exists()) {
    throw new Error("User not found");
  }

  const userData = userDoc.data();
  const currentSkills = userData.skillsNeeded || [];

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
export async function completeOnboarding(userId) {
  await updateDoc(doc(db, "users", userId), {
    onboardingComplete: true,
  });
}

// Constants
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

export const PER_UNIT_OPTIONS = [
  { id: "hour", label: "per hour", shortLabel: "/hr" },
  { id: "session", label: "per session", shortLabel: "/session" },
  { id: "day", label: "per day", shortLabel: "/day" },
];

// Upload Profile Picture (Via ImgBB)
export async function uploadProfilePicture(userId, file) {
  if (!file) throw new Error("No file provided");

  // 1. Prepare the image for upload
  const formData = new FormData();
  formData.append("image", file);

  // 2. Send to ImgBB (REPLACE WITH YOUR ACTUAL API KEY)
  const IMGBB_API_KEY = "YOUR_IMGBB_API_KEY"; 
  const res = await fetch(`https://api.imgbb.com/1/upload?key=${e59b6356d01270363bcd870970b98719}`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();

  if (!data.success) {
    throw new Error("Failed to upload image");
  }

  // 3. Get the URL they give us back
  const imageUrl = data.data.url;

  // 4. Update the user's Firestore profile with the new avatar URL
  await updateDoc(doc(db, "users", userId), {
    avatar: imageUrl,
  });

  return imageUrl;
}