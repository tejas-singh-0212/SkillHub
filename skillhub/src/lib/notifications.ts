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
 Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";
import type { NotificationInput, AppNotification } from "@/types";

export async function createNotification(userId: string, notification: NotificationInput): Promise<void> {
 await addDoc(collection(db, "notifications", userId, "items"), {
 type: notification.type,
 title: notification.title,
 message: notification.message,
 fromUserId: notification.fromUserId || "",
 bookingId: notification.bookingId || "",
 conversationId: notification.conversationId || "",
 isRead: false,
 createdAt: serverTimestamp(),
 });
}

export function listenToNotifications(userId: string, callback: (notifs: AppNotification[]) => void): Unsubscribe {
 const q = query(
 collection(db, "notifications", userId, "items"),
 orderBy("createdAt", "desc")
 );

 return onSnapshot(q, (snapshot) => {
 const notifs: AppNotification[] = snapshot.docs.map((doc) => ({
 id: doc.id,
 ...doc.data(),
 })) as AppNotification[];
 callback(notifs);
 });
}

export async function markNotificationRead(userId: string, notificationId: string): Promise<void> {
 await updateDoc(
 doc(db, "notifications", userId, "items", notificationId),
 {
 isRead: true,
 }
 );
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
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
