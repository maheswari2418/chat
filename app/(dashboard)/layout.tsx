"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect } from "react";
import { useParams } from "next/navigation";
import Sidebar from "@/components/sidebar/sidebar";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoaded } = useUser();
  const params = useParams();
  const hasActiveConversation = !!params?.conversationId;

  const upsertUser = useMutation(api.users.upsertUser);
  const updatePresence = useMutation(api.presence.updatePresence);

  useEffect(() => {
    if (!isLoaded || !user) return;

    // Sync user profile to Convex DB
    upsertUser({
      clerkId: user.id,
      name: user.fullName ?? user.username ?? "Unknown",
      ...(user.emailAddresses[0]?.emailAddress
        ? { email: user.emailAddresses[0].emailAddress }
        : {}),
      imageUrl: user.imageUrl,
    });

    // Set online presence
    updatePresence({ userId: user.id, isOnline: true });

    const handleUnload = () => {
      updatePresence({ userId: user.id, isOnline: false });
    };
    window.addEventListener("beforeunload", handleUnload);

    // Heartbeat every 20s to stay "online"
    const interval = setInterval(() => {
      updatePresence({ userId: user.id, isOnline: true });
    }, 20000);

    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      clearInterval(interval);
    };
  }, [isLoaded, user, upsertUser, updatePresence]);

  if (!isLoaded) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#111b21]">
        <div className="w-8 h-8 border-2 border-[#00a884] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-[#111b21] overflow-hidden">
      {/* Sidebar: hidden on mobile when chat is open */}
      <div
        className={`w-full md:w-[380px] lg:w-[420px] flex-shrink-0 border-r border-[#2a3942] flex flex-col ${
          hasActiveConversation ? "hidden md:flex" : "flex"
        }`}
      >
        <Sidebar />
      </div>

      {/* Chat panel: full screen on mobile when conversation is open */}
      <div
        className={`flex-1 flex flex-col ${
          hasActiveConversation ? "flex" : "hidden md:flex"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
