"use client";

import { useAuth } from "./AuthProvider";

export default function ConversationList({
  conversations,
  selectedId,
  onSelect,
}) {
  const { user } = useAuth();

  if (conversations.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        <p className="text-4xl mb-3">📭</p>
        <p>No conversations yet</p>
        <p className="text-sm mt-1">
          Visit a profile and click "Message" to start
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {conversations.map((convo) => {
        const otherUserId = convo.participants?.find((p) => p !== user?.uid);
        const otherName = convo.participantNames?.[otherUserId] || "User";
        const otherAvatar =
          convo.participantAvatars?.[otherUserId] ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(otherName)}&background=random`;
        const unread = convo.unreadCount?.[user?.uid] || 0;

        return (
          <div
            key={convo.id}
            onClick={() => onSelect(convo)}
            className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition ${
              selectedId === convo.id ? "bg-blue-50" : ""
            }`}
          >
            <img
              src={otherAvatar}
              alt=""
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-sm truncate">{otherName}</h3>
                {unread > 0 && (
                  <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unread}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 truncate">
                {convo.lastMessage || "No messages yet"}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}