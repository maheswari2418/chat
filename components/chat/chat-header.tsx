"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id, Doc } from "@/convex/_generated/dataModel";
import OnlineIndicator from "../chat/TypingIndicator";
import { Users, ArrowLeft } from "lucide-react";

interface Props {
  conversationId: Id<"conversations">;
  currentUserId: string;
  conversation: Doc<"conversations">;
  onBack?: () => void;
}

export default function ChatHeader({ conversationId, currentUserId, conversation, onBack }: Props) {
  const otherParticipantIds = conversation.participants.filter(
    (p) => p !== currentUserId
  );

  const otherUsers = useQuery(api.users.getUsersByClerkIds, {
    clerkIds: otherParticipantIds,
  });

  const presence = useQuery(api.presence.getPresence, {
    userIds: otherParticipantIds,
  });

  const typingUsers = useQuery(api.presence.getTypingUsers, {
    conversationId,
    currentUserId,
  });

  if (!otherUsers) {
    return <div className="h-16 bg-[#202c33] animate-pulse flex-shrink-0" />;
  }

  const displayName = conversation.isGroup
    ? conversation.groupName ?? "Group"
    : otherUsers[0]?.name ?? "Unknown";

  const avatarUrl = conversation.isGroup ? null : otherUsers[0]?.imageUrl;
  const otherUserId = conversation.isGroup ? null : otherUsers[0]?.clerkId;
  const isOnline =
    !conversation.isGroup &&
    otherUserId != null &&
    (presence?.[otherUserId]?.isOnline ?? false);

  const typingText =
    typingUsers && typingUsers.length > 0
      ? typingUsers.length === 1
        ? `${typingUsers[0]?.name} is typing...`
        : `${typingUsers.length} people are typing...`
      : null;

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-[#202c33] border-b border-[#2a3942] flex-shrink-0">
      {/* Mobile back arrow */}
      {onBack && (
        <button
          onClick={onBack}
          className="md:hidden p-1 -ml-1 text-[#aebac1] hover:text-[#e9edef] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      )}

      {/* Avatar */}
      <div className="relative flex-shrink-0">
        {avatarUrl ? (
          <img src={avatarUrl} alt={displayName} className="w-10 h-10 rounded-full object-cover" />
        ) : conversation.isGroup ? (
          <div className="w-10 h-10 rounded-full bg-[#6b7c85] flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-[#6b7c85] flex items-center justify-center text-white font-medium">
            {displayName[0]?.toUpperCase()}
          </div>
        )}
        {otherUserId && <OnlineIndicator userId={otherUserId} />}
      </div>

      {/* Name + status/typing */}
      <div className="flex-1 min-w-0">
        <h2 className="text-[#e9edef] font-semibold text-sm truncate">{displayName}</h2>
        <p className="text-xs h-4">
          {typingText ? (
            <span className="text-[#00a884] animate-pulse">{typingText}</span>
          ) : isOnline ? (
            <span className="text-[#00a884]">online</span>
          ) : conversation.isGroup ? (
            <span className="text-[#8696a0]">{conversation.participants.length} members</span>
          ) : (
            <span className="text-[#8696a0]">offline</span>
          )}
        </p>
      </div>
    </div>
  );
}