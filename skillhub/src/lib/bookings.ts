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
  Unsubscribe,
  DocumentSnapshot,
} from "firebase/firestore";
import { db } from "./firebase";
import { createNotification } from "./notifications";
import type { BookingCreateData, Booking, BookingStatus, PaginatedBookingsResult } from "@/types";

// Create a new booking + NOTIFY provider
export async function createBooking(bookingData: BookingCreateData): Promise<string> {
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
export async function checkBookingConflict(providerId: string, date: string, time: string): Promise<boolean> {
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
export async function updateBookingStatus(bookingId: string, status: BookingStatus): Promise<void> {
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
export function listenToReceivedBookings(userId: string, callback: (bookings: Booking[]) => void): Unsubscribe {
  const q = query(
    collection(db, "bookings"),
    where("providerId", "==", userId)
  );

  return onSnapshot(q, (snapshot) => {
    const bookings: Booking[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      role: "provider" as const,
    })) as Booking[];
    callback(bookings);
  });
}

// Listen to sent bookings (as requester)
export function listenToSentBookings(userId: string, callback: (bookings: Booking[]) => void): Unsubscribe {
  const q = query(
    collection(db, "bookings"),
    where("requesterId", "==", userId)
  );

  return onSnapshot(q, (snapshot) => {
    const bookings: Booking[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      role: "requester" as const,
    })) as Booking[];
    callback(bookings);
  });
}

// Listen to ALL my bookings (combined)
export function listenToMyBookings(userId: string, callback: (bookings: Booking[]) => void): Unsubscribe {
  let receivedBookings: Booking[] = [];
  let sentBookings: Booking[] = [];

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
  userId: string,
  lastDocSnap: DocumentSnapshot | null = null,
  pageSize: number = 10
): Promise<PaginatedBookingsResult> {
  let q;

  if (lastDocSnap) {
    q = query(
      collection(db, "bookings"),
      where("providerId", "==", userId),
      orderBy("createdAt", "desc"),
      startAfter(lastDocSnap),
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
      role: "provider" as const,
    })) as Booking[],
    lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
    hasMore: snapshot.docs.length === pageSize,
  };
}

export async function getSentBookingsPaginated(
  userId: string,
  lastDocSnap: DocumentSnapshot | null = null,
  pageSize: number = 10
): Promise<PaginatedBookingsResult> {
  let q;

  if (lastDocSnap) {
    q = query(
      collection(db, "bookings"),
      where("requesterId", "==", userId),
      orderBy("createdAt", "desc"),
      startAfter(lastDocSnap),
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
      role: "requester" as const,
    })) as Booking[],
    lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
    hasMore: snapshot.docs.length === pageSize,
  };
}
