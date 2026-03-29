"use client";

import { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter, useSearchParams } from "next/navigation";
import { listenToConversations, markAsRead } from "@/lib/messages";
import ConversationList from "@/components/ConversationList";
import ChatWindow from "@/components/ChatWindow";
import { MessagesSkeleton } from "@/components/Skeletons";
import type { Conversation } from "@/types";

function MessagesContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvo, setSelectedConvo] = useState<Conversation | null>(null);
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

  const handleSelectConvo = async (convo: Conversation) => {
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
    <div className="max-w-6xl mx-auto px-0 sm:px-6 py-0 sm:py-6">
      <div className="bg-white rounded-none sm:rounded-2xl border-0 sm:border overflow-hidden">
        <div className="flex h-[calc(100vh-64px)] sm:h-[calc(100vh-120px)] max-h-[700px]">

          {/* Conversation List — Fixed header + scrollable list */}
          <div
            className={`w-full sm:w-80 border-r flex flex-col shrink-0 ${
              mobileShowChat ? "hidden sm:flex" : "flex"
            }`}
          >
            <div className="p-4 border-b shrink-0">
              <h1 className="text-xl font-bold">Messages</h1>
            </div>
            <div className="flex-1 overflow-y-auto">
              <ConversationList
                conversations={conversations}
                selectedId={selectedConvo?.id}
                onSelect={handleSelectConvo}
              />
            </div>
          </div>

          {/* Chat Window */}
          <div
            className={`flex-1 flex flex-col min-w-0 ${
              mobileShowChat ? "flex" : "hidden sm:flex"
            }`}
          >
            {/* Mobile back button */}
            {mobileShowChat && selectedConvo && (
              <div className="sm:hidden border-b p-3 flex items-center gap-3 shrink-0">
                <button
                  onClick={() => setMobileShowChat(false)}
                  className="text-blue-600 font-medium"
                >
                  ← Back
                </button>
                <p className="font-semibold truncate">
                  {selectedConvo.participantNames?.[
                    selectedConvo.participants?.find((p: string) => p !== user?.uid) || ""
                  ] || "Chat"}
                </p>
              </div>
            )}

            {/* Desktop chat header */}
            {selectedConvo && (
              <div className="hidden sm:flex border-b p-4 items-center gap-3 shrink-0">
                <img
                  src={
                    selectedConvo.participantAvatars?.[
                      selectedConvo.participants?.find((p: string) => p !== user?.uid) || ""
                    ] ||
                    `https://ui-avatars.com/api/?name=U&background=random`
                  }
                  alt=""
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold">
                    {selectedConvo.participantNames?.[
                      selectedConvo.participants?.find((p: string) => p !== user?.uid) || ""
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
    <Suspense fallback={<MessagesSkeleton />}>
      <MessagesContent />
    </Suspense>
  );
}