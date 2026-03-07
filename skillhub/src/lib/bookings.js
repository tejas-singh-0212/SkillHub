import {
  collection,
  doc,
  addDoc,
  updateDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export async function createBooking(bookingData) {
  const booking = await addDoc(collection(db, "bookings"), {
    requesterId: bookingData.requesterId,
    requesterName: bookingData.requesterName,
    requesterAvatar: bookingData.requesterAvatar || "",
    providerId: bookingData.providerId,
    providerName: bookingData.providerName,
    providerAvatar: bookingData.providerAvatar || "",
    skillName: bookingData.skillName,
    status: "pending",
    scheduledDate: bookingData.date,
    scheduledTime: bookingData.time,
    duration: bookingData.duration || 60,
    paymentType: bookingData.paymentType || "free",
    amount: bookingData.amount || 0,
    barterExchange: bookingData.barterExchange || "",
    message: bookingData.message || "",
    createdAt: serverTimestamp(),
  });

  return booking.id;
}
export async function updateBookingStatus(bookingId, status) {
  await updateDoc(doc(db, "bookings", bookingId), {
    status,
    updatedAt: serverTimestamp(),
  });
}

export function listenToReceivedBookings(userId, callback) {
  const q = query(
    collection(db, "bookings"),
    where("providerId", "==", userId)
  );

  return onSnapshot(q, (snapshot) => {
    const bookings = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      role: "provider",
    }));
    callback(bookings);
  });
}

export function listenToSentBookings(userId, callback) {
  const q = query(
    collection(db, "bookings"),
    where("requesterId", "==", userId)
  );

  return onSnapshot(q, (snapshot) => {
    const bookings = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      role: "requester",
    }));
    callback(bookings);
  });
}

export function listenToMyBookings(userId, callback) {
  let receivedBookings = [];
  let sentBookings = [];

  const unsub1 = listenToReceivedBookings(userId, (bookings) => {
    receivedBookings = bookings;
    callback([...receivedBookings, ...sentBookings]);
  });

  const unsub2 = listenToSentBookings(userId, (bookings) => {
    sentBookings = bookings;
    callback([...receivedBookings, ...sentBookings]);
  });

  return () => {
    unsub1();
    unsub2();
  };
}