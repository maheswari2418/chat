"use client";

import { useUser, UserButton } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Loader2, MessageSquare, Users } from "lucide-react";
import OnlineIndicator from "@/components/chat/TypingIndicator";

export default function ChatHome() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [isCreating, setIsCreating] = useState<string | null>(null);

  const updatePresence = useMutation(api.presence.updatePresence);
  const getOrCreateConversation = useMutation(api.conversations.getOrCreateConversation);

  const users = useQuery(
    api.users.getAllUsers,
    user ? { currentClerkId: user.id } : "skip"
  );

  useEffect(() => {
    if (!isLoaded || !user) return;

    updatePresence({ userId: user.id, isOnline: true });

    const handleUnload = () => {
      updatePresence({ userId: user.id, isOnline: false });
    };
    window.addEventListener("beforeunload", handleUnload);

    const interval = setInterval(() => {
      updatePresence({ userId: user.id, isOnline: true });
    }, 20000);

    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      clearInterval(interval);
      updatePresence({ userId: user.id, isOnline: false });
    };
  }, [isLoaded, user, updatePresence]);

  const groupedUsers = useMemo(() => {
    const list = users ?? [];
    return list.reduce<Record<string, typeof list>>((acc, u) => {
      const key = u.name?.[0]?.toUpperCase() || "#";
      if (!acc[key]) acc[key] = [];
      acc[key].push(u);
      return acc;
    }, {});
  }, [users]);

  const letters = useMemo(() => Object.keys(groupedUsers).sort(), [groupedUsers]);

  if (!isLoaded) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#111b21]">
        <div className="w-8 h-8 border-2 border-[#00a884] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    router.push("/sign-in");
    return null;
  }

  const handleUserClick = async (otherUserId: string) => {
    setIsCreating(otherUserId);
    try {
      const conversationId = await getOrCreateConversation({
        currentUserId: user.id,
        otherUserId,
      });
      router.push(`/chat/${conversationId}`);
    } finally {
      setIsCreating(null);
    }
  };

  return (
    <div className="flex h-screen bg-[#111b21]">
      <div className="w-full md:w-[420px] border-r border-[#2a3942] flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 bg-[#202c33]">
          <div className="flex items-center gap-3">
            <UserButton appearance={{ elements: { avatarBox: "w-10 h-10" } }} />
            <span className="text-[#e9edef] font-medium text-sm truncate max-w-[220px]">
              {user.fullName ?? user.username ?? "You"}
            </span>
          </div>
        </div>

        {users === undefined ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-[#00a884]" />
          </div>
        ) : users.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <Users className="w-12 h-12 text-[#2a3942] mb-4" />
            <p className="text-[#8696a0] text-sm font-medium">No other users yet</p>
            <p className="text-[#8696a0] text-xs mt-1">
              Ask someone else to sign in, then start chatting.
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {letters.map((letter) => (
              <div key={letter}>
                <div className="sticky top-0 bg-[#111b21] px-4 py-2 text-[11px] font-semibold text-[#8696a0] uppercase tracking-widest">
                  {letter}
                </div>
                {groupedUsers[letter].map((u) => (
                  <button
                    key={u._id}
                    onClick={() => handleUserClick(u.clerkId)}
                    disabled={isCreating === u.clerkId}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#2a3942] transition-colors text-left disabled:opacity-50"
                  >
                    <div className="relative flex-shrink-0">
                      {u.imageUrl ? (
                        <img
                          src={u.imageUrl}
                          alt={u.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-[#6b7c85] flex items-center justify-center text-white font-semibold text-lg">
                          {u.name?.[0]?.toUpperCase() ?? "?"}
                        </div>
                      )}
                      <OnlineIndicator userId={u.clerkId} small />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[#e9edef] font-medium text-sm truncate">
                        {u.name}
                      </p>
                    </div>
                    {isCreating === u.clerkId && (
                      <Loader2 className="w-4 h-4 animate-spin text-[#00a884]" />
                    )}
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="hidden md:flex flex-1 items-center justify-center bg-[#0b141a]">
        <div className="text-center">
          <MessageSquare className="w-20 h-20 text-[#2a3942] mx-auto mb-4" />
          <h2 className="text-[#e9edef] text-2xl font-light mb-2">
            Select a person
          </h2>
          <p className="text-[#8696a0] text-sm">
            Choose someone from the list to start chatting.
          </p>
        </div>
      </div>
    </div>
  );
}
