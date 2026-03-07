import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile as updateFirebaseProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase";

function generateAvatar(name) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name
  )}&background=random&color=fff&size=200&bold=true`;
}

export async function signUp(email, password, name) {
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

export async function signIn(email, password) {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
  return userCredential.user;
}

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);

  const userDoc = await getDoc(doc(db, "users", result.user.uid));

  if (!userDoc.exists()) {
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
  }

  return result.user;
}

export async function logOut() {
  await signOut(auth);
}

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

export async function getUserProfile(uid) {
  const docSnap = await getDoc(doc(db, "users", uid));
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
}