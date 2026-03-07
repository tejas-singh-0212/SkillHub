import {
  collection,
  addDoc,
  doc,
  updateDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "./firebase";

export async function createNotification(userId, notification) {
  await addDoc(collection(db, "notifications", userId, "items"), {
    type: notification.type,
    title: notification.title,
    message: notification.message,
    fromUserId: notification.fromUserId || "",
    bookingId: notification.bookingId || "",
    // Added for message notifications
    conversationId: notification.conversationId || "", 
    isRead: false,
    createdAt: serverTimestamp(),
  });
}

export function listenToNotifications(userId, callback) {
  const q = query(
    collection(db, "notifications", userId, "items"),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const notifs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(notifs);
  });
}

export async function markNotificationRead(userId, notificationId) {
  await updateDoc(
    doc(db, "notifications", userId, "items", notificationId),
    {
      isRead: true,
    }
  );
}

export async function markAllNotificationsRead(userId) {
  const q = query(
    collection(db, "notifications", userId, "items"),
    where("isRead", "==", false)
  );
  const snap = await getDocs(q);

  const promises = snap.docs.map((docSnap) =>
    updateDoc(doc(db, "notifications", userId, "items", docSnap.id), {
      isRead: true,
    })
  );

  await Promise.all(promises);
}