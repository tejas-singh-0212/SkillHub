"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter, useSearchParams } from "next/navigation";
import { listenToConversations, markAsRead } from "@/lib/messages";
import ConversationList from "@/components/ConversationList";
import ChatWindow from "@/components/ChatWindow";
import { Suspense } from "react";
import { MessagesSkeleton } from "@/components/Skeletons";

function MessagesContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [conversations, setConversations] = useState([]);
  const [selectedConvo, setSelectedConvo] = useState(null);
  const [mobileShowChat, setMobileShowChat] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;

    const unsub = listenToConversations(user.uid, (convos) => {
      setConversations(convos);

      const convoParam = searchParams.get("convo");
      if (convoParam && !selectedConvo) {
        const found = convos.find((c) => c.id === convoParam);
        if (found) {
          setSelectedConvo(found);
          setMobileShowChat(true);
        }
      }
    });

    return () => unsub();
  }, [user, searchParams]);

  const handleSelectConvo = async (convo) => {
    setSelectedConvo(convo);
    setMobileShowChat(true);

    if (user && convo.unreadCount?.[user.uid] > 0) {
      await markAsRead(convo.id, user.uid);
    }
  };

  if (authLoading) {
    return <MessagesSkeleton />;
  }

  return (
    <div className="max-w-6xl mx-auto px-0 sm:px-6 py-0 sm:py-8">
      <div className="bg-white rounded-none sm:rounded-2xl border-0 sm:border overflow-hidden">
        <div className="flex h-[calc(100vh-64px)] sm:h-[600px]">
          {/* Conversation List — hide on mobile when chat is open */}
          <div
            className={`w-full sm:w-80 border-r shrink-0 overflow-y-auto ${
              mobileShowChat ? "hidden sm:block" : "block"
            }`}
          >
            <div className="p-4 border-b">
              <h1 className="text-xl font-bold">💬 Messages</h1>
            </div>
            <ConversationList
              conversations={conversations}
              selectedId={selectedConvo?.id}
              onSelect={handleSelectConvo}
            />
          </div>

          {/* Chat Window — hide on mobile when list is shown */}
          <div
            className={`flex-1 flex flex-col ${
              mobileShowChat ? "block" : "hidden sm:flex"
            }`}
          >
            {/* Mobile back button */}
            {mobileShowChat && selectedConvo && (
              <div className="sm:hidden border-b p-3 flex items-center gap-3">
                <button
                  onClick={() => setMobileShowChat(false)}
                  className="text-blue-600 font-medium"
                >
                  ← Back
                </button>
                <p className="font-semibold">
                  {selectedConvo.participantNames?.[
                    selectedConvo.participants?.find((p) => p !== user?.uid)
                  ] || "Chat"}
                </p>
              </div>
            )}

            {/* Desktop chat header */}
            {selectedConvo && (
              <div className="hidden sm:flex border-b p-4 items-center gap-3">
                <img
                  src={
                    selectedConvo.participantAvatars?.[
                      selectedConvo.participants?.find((p) => p !== user?.uid)
                    ] ||
                    `https://ui-avatars.com/api/?name=U&background=random`
                  }
                  alt=""
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold">
                    {selectedConvo.participantNames?.[
                      selectedConvo.participants?.find((p) => p !== user?.uid)
                    ] || "User"}
                  </p>
                </div>
              </div>
            )}

            <ChatWindow conversationId={selectedConvo?.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading messages...</div>}>
      <MessagesContent />
    </Suspense>
  );
}