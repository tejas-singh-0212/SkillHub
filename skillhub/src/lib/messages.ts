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
  increment,
  limit,
  startAfter,
  getDocs,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";
import { createNotification } from "./notifications";
import type { ConversationUser, Message, Conversation, OlderMessagesResult } from "@/types";

// Generate deterministic conversation ID
export function getConversationId(uid1: string, uid2: string): string {
  return [uid1, uid2].sort().join("_");
}

// Create or get existing conversation
export async function createConversation(currentUser: ConversationUser, otherUser: ConversationUser): Promise<string> {
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

// Send a message + NOTIFY recipient
export async function sendMessage(convoId: string, senderId: string, content: string): Promise<void> {
  // Add message
  await addDoc(collection(db, "conversations", convoId, "messages"), {
    senderId,
    content,
    isRead: false,
    createdAt: serverTimestamp(),
  });

  // Get conversation data
  const convoSnap = await getDoc(doc(db, "conversations", convoId));
  const convoData = convoSnap.data();
  const otherUserId = convoData?.participants.find((p: string) => p !== senderId);
  const senderName = convoData?.participantNames?.[senderId] || "Someone";

  // Update conversation with atomic increment
  await updateDoc(doc(db, "conversations", convoId), {
    lastMessage: content,
    lastMessageTime: serverTimestamp(),
    [`unreadCount.${otherUserId}`]: increment(1),
  });

  // notify: Recipient about new message
  const messagePreview =
    content.length > 50 ? content.substring(0, 50) + "..." : content;

  if (otherUserId) {
    await createNotification(otherUserId, {
      type: "new_message",
      title: `💬 New message from ${senderName}`,
      message: messagePreview,
      fromUserId: senderId,
      conversationId: convoId,
    });
  }
}

// Listen to messages in a conversation
export function listenToMessages(convoId: string, callback: (messages: Message[]) => void): Unsubscribe {
  const q = query(
    collection(db, "conversations", convoId, "messages"),
    orderBy("createdAt", "asc")
  );

  return onSnapshot(q, (snapshot) => {
    const messages: Message[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Message[];
    callback(messages);
  });
}

// Listen to user's conversations
export function listenToConversations(userId: string, callback: (conversations: Conversation[]) => void): Unsubscribe {
  const q = query(
    collection(db, "conversations"),
    where("participants", "array-contains", userId),
    orderBy("lastMessageTime", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const conversations: Conversation[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Conversation[];
    callback(conversations);
  });
}

// Get total unread message count
export function listenToTotalUnreadMessages(userId: string, callback: (count: number) => void): Unsubscribe {
  const q = query(
    collection(db, "conversations"),
    where("participants", "array-contains", userId)
  );

  return onSnapshot(q, (snapshot) => {
    let totalUnread = 0;
    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      totalUnread += data.unreadCount?.[userId] || 0;
    });
    callback(totalUnread);
  });
}

// Mark conversation as read
export async function markAsRead(convoId: string, userId: string): Promise<void> {
  await updateDoc(doc(db, "conversations", convoId), {
    [`unreadCount.${userId}`]: 0,
  });
}

// Load older messages (pagination)
export async function loadOlderMessages(
  convoId: string,
  oldestMessage: Message | null,
  pageSize: number = 30
): Promise<OlderMessagesResult> {
  let q;

  if (oldestMessage?.createdAt) {
    q = query(
      collection(db, "conversations", convoId, "messages"),
      orderBy("createdAt", "desc"),
      startAfter(oldestMessage.createdAt),
      limit(pageSize)
    );
  } else {
    q = query(
      collection(db, "conversations", convoId, "messages"),
      orderBy("createdAt", "desc"),
      limit(pageSize)
    );
  }

  const snapshot = await getDocs(q);

  const messages: Message[] = snapshot.docs
    .map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }) as Message)
    // Reverse to get chronological order
    .reverse();

  return {
    messages,
    hasMore: snapshot.docs.length === pageSize,
  };
}
