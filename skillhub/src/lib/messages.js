import {
  collection,
  doc,
  setDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { db } from "./firebase";

export function getConversationId(uid1, uid2) {
  return [uid1, uid2].sort().join("_");
}

export async function createConversation(currentUser, otherUser) {
  const convoId = getConversationId(currentUser.id, otherUser.id);

  const convoRef = doc(db, "conversations", convoId);
  const convoSnap = await getDoc(convoRef);

  if (!convoSnap.exists()) {
    await setDoc(convoRef, {
      participants: [currentUser.id, otherUser.id],
      participantNames: {
        [currentUser.id]: currentUser.name,
        [otherUser.id]: otherUser.name,
      },
      participantAvatars: {
        [currentUser.id]: currentUser.avatar || "",
        [otherUser.id]: otherUser.avatar || "",
      },
      lastMessage: "",
      lastMessageTime: serverTimestamp(),
      unreadCount: {
        [currentUser.id]: 0,
        [otherUser.id]: 0,
      },
    });
  }

  return convoId;
}

export async function sendMessage(convoId, senderId, content) {
  await addDoc(collection(db, "conversations", convoId, "messages"), {
    senderId,
    content,
    isRead: false,
    createdAt: serverTimestamp(),
  });

  
  const convoSnap = await getDoc(doc(db, "conversations", convoId));
  const convoData = convoSnap.data();
  const otherUserId = convoData.participants.find((p) => p !== senderId);


  await updateDoc(doc(db, "conversations", convoId), {
    lastMessage: content,
    lastMessageTime: serverTimestamp(),
    [`unreadCount.${otherUserId}`]:
      (convoData.unreadCount?.[otherUserId] || 0) + 1,
  });
}

export function listenToMessages(convoId, callback) {
  const q = query(
    collection(db, "conversations", convoId, "messages"),
    orderBy("createdAt", "asc")
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(messages);
  });
}

export function listenToConversations(userId, callback) {
  const q = query(
    collection(db, "conversations"),
    where("participants", "array-contains", userId),
    orderBy("lastMessageTime", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const conversations = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(conversations);
  });
}

export async function markAsRead(convoId, userId) {
  await updateDoc(doc(db, "conversations", convoId), {
    [`unreadCount.${userId}`]: 0,
  });
}