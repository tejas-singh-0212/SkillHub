import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile as updateFirebaseProfile,
  sendPasswordResetEmail,
  User,
  NextOrObserver,
  Unsubscribe,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase";
import type { UserProfile, GoogleSignInResult } from "@/types";

// Generate avatar URL
function generateAvatar(name: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name
  )}&background=random&color=fff&size=200&bold=true`;
}

// Email/Password Sign Up
export async function signUp(email: string, password: string, name: string): Promise<User> {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  await updateFirebaseProfile(userCredential.user, {
    displayName: name,
  });

  await setDoc(doc(db, "users", userCredential.user.uid), {
    name,
    email,
    avatar: generateAvatar(name),
    phone: "",
    bio: "",
    location: null,
    skillsOffered: [],
    skillsNeeded: [],
    averageRating: 0,
    totalReviews: 0,
    totalBookings: 0,
    isVerified: false,
    badges: ["verified_email"],
    onboardingComplete: false,
    createdAt: serverTimestamp(),
  });

  return userCredential.user;
}

// Email/Password Sign In
export async function signIn(email: string, password: string): Promise<User> {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
  return userCredential.user;
}

// Google Sign In (with onboarding check)
export async function signInWithGoogle(): Promise<GoogleSignInResult> {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);

  const userDoc = await getDoc(doc(db, "users", result.user.uid));

  let isNewUser = false;
  let onboardingComplete = false;

  if (!userDoc.exists()) {
    isNewUser = true;
    onboardingComplete = false;

    await setDoc(doc(db, "users", result.user.uid), {
      name: result.user.displayName || "",
      email: result.user.email || "",
      avatar:
        result.user.photoURL ||
        generateAvatar(result.user.displayName || "User"),
      phone: result.user.phoneNumber || "",
      bio: "",
      location: null,
      skillsOffered: [],
      skillsNeeded: [],
      averageRating: 0,
      totalReviews: 0,
      totalBookings: 0,
      isVerified: false,
      badges: ["verified_email"],
      onboardingComplete: false,
      createdAt: serverTimestamp(),
    });
  } else {
    onboardingComplete = userDoc.data()?.onboardingComplete || false;
  }

  return {
    user: result.user,
    isNewUser,
    onboardingComplete,
  };
}

// Sign Out
export async function logOut(): Promise<void> {
  await signOut(auth);
}

// Auth State Listener
export function onAuthChange(callback: NextOrObserver<User>): Unsubscribe {
  return onAuthStateChanged(auth, callback);
}

// Get User Profile
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const docSnap = await getDoc(doc(db, "users", uid));
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as UserProfile;
  }
  return null;
}

// Password Reset
export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}
