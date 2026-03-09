import {
  collection,
  doc,
  addDoc,
  updateDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  getDoc,
  orderBy,
  limit,
  startAfter,
  getDocs,
  increment,  
} from "firebase/firestore";
import { db } from "./firebase";
import { createNotification } from "./notifications";

// Create a new booking + NOTIFY provider
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

  await createNotification(bookingData.providerId, {
    type: "new_booking",
    title: "New Booking Request 📅",
    message: `${bookingData.requesterName} wants to book "${bookingData.skillName}"`,
    fromUserId: bookingData.requesterId,
    bookingId: booking.id,
  });

  return booking.id;
}

// Check for Booking Conflicts
export async function checkBookingConflict(providerId, date, time) {
  const q = query(
    collection(db, "bookings"),
    where("providerId", "==", providerId),
    where("scheduledDate", "==", date),
    where("scheduledTime", "==", time),
    where("status", "in", ["pending", "accepted"])
  );
  
  const snap = await getDocs(q);
  return !snap.empty; // Returns true if a conflict exists
}

// Update booking status + NOTIFY + UPDATE COUNTS
export async function updateBookingStatus(bookingId, status) {
  // Get booking details
  const bookingDoc = await getDoc(doc(db, "bookings", bookingId));
  const bookingData = bookingDoc.data();

  // Update status
  await updateDoc(doc(db, "bookings", bookingId), {
    status,
    updatedAt: serverTimestamp(),
  });

  if (bookingData) {
    switch (status) {
      case "accepted":
        await createNotification(bookingData.requesterId, {
          type: "booking_accepted",
          title: "Booking Accepted! 🎉",
          message: `${bookingData.providerName} accepted your booking for "${bookingData.skillName}"`,
          fromUserId: bookingData.providerId,
          bookingId,
        });
        break;

      case "declined":
        await createNotification(bookingData.requesterId, {
          type: "booking_declined",
          title: "Booking Declined ❌",
          message: `${bookingData.providerName} declined your booking for "${bookingData.skillName}"`,
          fromUserId: bookingData.providerId,
          bookingId,
        });
        break;

      case "completed":
        // increment totalBookings for BOTH users
        await updateDoc(doc(db, "users", bookingData.providerId), {
          totalBookings: increment(1),
        });
        await updateDoc(doc(db, "users", bookingData.requesterId), {
          totalBookings: increment(1),
        });

        // Notify both parties
        await createNotification(bookingData.requesterId, {
          type: "booking_completed",
          title: "Session Completed! ⭐",
          message: `Your session for "${bookingData.skillName}" is complete. Leave a review!`,
          fromUserId: bookingData.providerId,
          bookingId,
        });
        await createNotification(bookingData.providerId, {
          type: "booking_completed",
          title: "Session Completed! ⭐",
          message: `Your session for "${bookingData.skillName}" is complete. Leave a review!`,
          fromUserId: bookingData.requesterId,
          bookingId,
        });
        break;

      case "cancelled":
        await createNotification(bookingData.providerId, {
          type: "booking_cancelled",
          title: "Booking Cancelled 🚫",
          message: `${bookingData.requesterName} cancelled the booking for "${bookingData.skillName}"`,
          fromUserId: bookingData.requesterId,
          bookingId,
        });
        break;
    }
  }
}

// Listen to received bookings (as provider)
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

// Listen to sent bookings (as requester)
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

// Listen to ALL my bookings (combined)
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

// Paginated bookings
export async function getReceivedBookingsPaginated(
  userId,
  lastDoc = null,
  pageSize = 10
) {
  let q;

  if (lastDoc) {
    q = query(
      collection(db, "bookings"),
      where("providerId", "==", userId),
      orderBy("createdAt", "desc"),
      startAfter(lastDoc),
      limit(pageSize)
    );
  } else {
    q = query(
      collection(db, "bookings"),
      where("providerId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(pageSize)
    );
  }

  const snapshot = await getDocs(q);

  return {
    bookings: snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      role: "provider",
    })),
    lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
    hasMore: snapshot.docs.length === pageSize,
  };
}

export async function getSentBookingsPaginated(
  userId,
  lastDoc = null,
  pageSize = 10
) {
  let q;

  if (lastDoc) {
    q = query(
      collection(db, "bookings"),
      where("requesterId", "==", userId),
      orderBy("createdAt", "desc"),
      startAfter(lastDoc),
      limit(pageSize)
    );
  } else {
    q = query(
      collection(db, "bookings"),
      where("requesterId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(pageSize)
    );
  }

  const snapshot = await getDocs(q);

  return {
    bookings: snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      role: "requester",
    })),
    lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
    hasMore: snapshot.docs.length === pageSize,
  };
}