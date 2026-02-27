"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui";
import { formatMessageTime } from "@/lib/formattime";
import { cn } from "@/lib/utils";
import OnlineStatus from "@/components/chat/shared/online-status";
import UnreadBadge from "@/components/chat/shared/unread";
import { useParams } from "next/navigation";

interface ConversationItemProps {
  conversation: any;
  onClick: () => void;
}

export default function ConversationItem({
  conversation,
  onClick,
}: ConversationItemProps) {
  const params = useParams();
  const isActive = params.conversationId === conversation._id;
  const isGroup = conversation.type === "group";
  const otherUser = conversation.otherUsers[0];

  const displayName = isGroup
    ? conversation.groupName
    : otherUser?.name || "Unknown User";

  const displayImage = isGroup
    ? conversation.groupImage
    : otherUser?.imageUrl;

  const lastMessageText = conversation.lastMessage?.isDeleted
    ? "This message was deleted"
    : conversation.lastMessage?.content || "No messages yet";

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition text-left",
        isActive && "bg-blue-50 hover:bg-blue-50"
      )}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <Avatar>
          <AvatarImage src={displayImage} />
          <AvatarFallback>
            {displayName.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {!isGroup && otherUser && (
          <OnlineStatus isOnline={otherUser.isOnline} />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between mb-1">
          <h3 className="font-semibold truncate">{displayName}</h3>
          {conversation.lastMessage && (
            <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
              {formatMessageTime(conversation.lastMessageAt)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <p
            className={cn(
              "text-sm truncate",
              conversation.lastMessage?.isDeleted
                ? "italic text-gray-400"
                : "text-gray-600"
            )}
          >
            {lastMessageText}
          </p>
          {conversation.unreadCount > 0 && (
            <UnreadBadge count={conversation.unreadCount} />
          )}
        </div>
      </div>
    </button>
  );
}