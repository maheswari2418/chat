"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { formatFullMessageTime } from "@/lib/formattime";
import { Reply, Trash2, Smile } from "lucide-react";

const REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "😢"];

interface Props {
  message: Doc<"messages">;
  isOwn: boolean;
  currentUserId: string;
  replyToMessage?: Doc<"messages"> | null;
  onReply?: (message: Doc<"messages">) => void;
}

export default function MessageBubble({
  message,
  isOwn,
  currentUserId,
  replyToMessage = null,
  onReply,
}: Props) {
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const deleteMessage = useMutation(api.messages.deleteMessage);
  const toggleReaction = useMutation(api.messages.toggleReaction);

  // Group reactions by emoji
  const reactionGroups: Record<string, string[]> = {};
  for (const r of message.reactions ?? []) {
    if (!reactionGroups[r.emoji]) reactionGroups[r.emoji] = [];
    reactionGroups[r.emoji].push(r.userId);
  }

  const handleDelete = async () => {
    await deleteMessage({ messageId: message._id, userId: currentUserId });
    setShowActions(false);
  };

  const handleReaction = async (emoji: string) => {
    await toggleReaction({ messageId: message._id, userId: currentUserId, emoji });
    setShowReactionPicker(false);
    setShowActions(false);
  };

  return (
    <div
      className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-1 group`}
      onMouseLeave={() => { setShowActions(false); setShowReactionPicker(false); }}
    >
      <div className={`relative max-w-[65%] flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
        {/* Bubble */}
        <div
          className={`relative px-3 py-2 rounded-xl shadow-sm cursor-default ${
            message.isDeleted
              ? "bg-[#182229] text-[#8696a0] italic"
              : isOwn
              ? "bg-[#005c4b] text-[#e9edef]"
              : "bg-[#202c33] text-[#e9edef]"
          }`}
          onMouseEnter={() => !message.isDeleted && setShowActions(true)}
        >
          {message.isDeleted ? (
            <span className="text-sm">This message was deleted</span>
          ) : (
            <>
              {message.replyToMessageId && (
                <div
                  className={`mb-1.5 px-2 py-1 rounded-lg border-l-4 ${
                    isOwn
                      ? "bg-[#004b3d] border-l-[#00a884]"
                      : "bg-[#1b252c] border-l-[#00a884]"
                  }`}
                >
                  <div className="text-[11px] text-[#aebac1]">
                    Replying to {replyToMessage?.senderId === currentUserId ? "you" : "message"}
                  </div>
                  <div className="text-xs text-[#e9edef] opacity-90 break-words max-h-10 overflow-hidden">
                    {replyToMessage
                      ? replyToMessage.isDeleted
                        ? "This message was deleted"
                        : replyToMessage.text
                      : "Message not available"}
                  </div>
                </div>
              )}
              <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                {message.text}
              </p>
            </>
          )}
          <span className="text-[10px] text-[#8696a0] mt-0.5 block text-right">
            {formatFullMessageTime(message.createdAt)}
          </span>

          {/* Bubble tail */}
          {!message.isDeleted && (
            <div
              className={`absolute bottom-0 w-3 h-3 ${
                isOwn ? "right-[-5px] bg-[#005c4b]" : "left-[-5px] bg-[#202c33]"
              }`}
              style={{
                clipPath: isOwn
                  ? "polygon(0 0, 100% 100%, 0 100%)"
                  : "polygon(100% 0, 0 100%, 100% 100%)",
              }}
            />
          )}
        </div>

        {/* Reactions */}
        {Object.keys(reactionGroups).length > 0 && (
          <div className={`flex gap-1 mt-1 flex-wrap ${isOwn ? "justify-end" : "justify-start"}`}>
            {Object.entries(reactionGroups).map(([emoji, users]) => (
              <button
                key={emoji}
                onClick={() => handleReaction(emoji)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-colors ${
                  users.includes(currentUserId)
                    ? "bg-[#00a884]/20 border-[#00a884]/60 text-[#00a884]"
                    : "bg-[#202c33] border-[#2a3942] text-[#8696a0] hover:bg-[#2a3942]"
                }`}
              >
                <span>{emoji}</span>
                <span>{users.length}</span>
              </button>
            ))}
          </div>
        )}

        {/* Hover action bar */}
        {showActions && !message.isDeleted && (
          <div
            className={`absolute -top-11 flex items-center gap-0.5 bg-[#233138] border border-[#2a3942] rounded-xl p-1.5 shadow-xl z-20 ${
              isOwn ? "right-0" : "left-0"
            }`}
          >
            {onReply && !showReactionPicker && (
              <button
                onClick={() => {
                  onReply(message);
                  setShowActions(false);
                }}
                className="p-1.5 text-[#8696a0] hover:text-[#e9edef] hover:bg-[#2a3942] rounded-lg transition-colors"
                title="Reply"
              >
                <Reply className="w-4 h-4" />
              </button>
            )}
            {showReactionPicker ? (
              <>
                {REACTION_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleReaction(emoji)}
                    className="text-lg p-1 hover:scale-125 transition-transform rounded-lg hover:bg-[#2a3942]"
                  >
                    {emoji}
                  </button>
                ))}
              </>
            ) : (
              <button
                onClick={() => setShowReactionPicker(true)}
                className="p-1.5 text-[#8696a0] hover:text-[#e9edef] hover:bg-[#2a3942] rounded-lg transition-colors"
              >
                <Smile className="w-4 h-4" />
              </button>
            )}
            {isOwn && !showReactionPicker && (
              <button
                onClick={handleDelete}
                className="p-1.5 text-[#8696a0] hover:text-red-400 hover:bg-[#2a3942] rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
