"use client";

import { useAuth } from "./AuthProvider";
import Image from "next/image";
import type { Conversation } from "@/types";

interface ConversationListProps {
 conversations: Conversation[];
 selectedId: string | undefined;
 onSelect: (convo: Conversation) => void;
}

export default function ConversationList({ conversations, selectedId, onSelect }: ConversationListProps) {
 const { user } = useAuth();

 if (conversations.length === 0) {
 return (
 <div className="p-6 text-center text-gray-500 dark:text-gray-400">
 <p className="text-4xl mb-3">📭</p>
 <p>No conversations yet</p>
 <p className="text-sm mt-1">Visit a profile and click &quot;Message&quot; to start</p>
 </div>
 );
 }

 return (
 <div className="divide-y">
 {conversations.map((convo) => {
 const otherUserId = convo.participants?.find((p) => p !== user?.uid);
 const otherName = otherUserId ? convo.participantNames?.[otherUserId] || "User" : "User";
 const otherAvatar = otherUserId
 ? convo.participantAvatars?.[otherUserId] || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherName)}&background=random`
 : `https://ui-avatars.com/api/?name=User&background=random`;
 const unread = user?.uid ? convo.unreadCount?.[user.uid] || 0 : 0;

 return (
 <div
 key={convo.id}
 onClick={() => onSelect(convo)}
 className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 dark:bg-gray-900 transition ${selectedId === convo.id ? "bg-blue-50" : ""}`}
 >
 <Image unoptimized src={otherAvatar} alt="" width={48} height={48} className="w-12 h-12 rounded-full object-cover" />
 <div className="flex-1 min-w-0">
 <div className="flex justify-between items-center">
 <h3 className="font-semibold text-sm truncate">{otherName}</h3>
 {unread > 0 && (
 <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{unread}</span>
 )}
 </div>
 <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{convo.lastMessage || "No messages yet"}</p>
 </div>
 </div>
 );
 })}
 </div>
 );
}
