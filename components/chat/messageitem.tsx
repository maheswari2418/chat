// "use client";

// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui";
// import { formatMessageTime } from "@/lib/formattime";
// import { cn } from "@/lib/utils";
// import { useCurrentUser } from "@/hooks/use-current";
// import { useMutation } from "convex/react";
// import { api } from "@/convex/_generated/api";
// import { Trash2, Smile } from "lucide-react";
// interface Props { message: Doc<"messages"> }
// import { Id } from "@/convex/_generated/dataModel";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,} from "@/components/ui";
// import { Button } from "@/components/ui";
// import { useState } from "react";
// import { Doc } from "@/convex/_generated/dataModel";

// interface MessageItemProps {
//   message: any;
//   showAvatar: boolean;
//   showTimestamp: boolean;
// }

// const EMOJI_REACTIONS = ["👍", "❤️", "😂", "😮", "😢"];

// export default function MessageItem({
//   message,
//   showAvatar,
//   showTimestamp,
// }: MessageItemProps) {
//   const isSystemMessage = message.isSystemMessage;
//   const currentUser = useCurrentUser();
//   const deleteMessage = useMutation(api.messages.deleteMessage);
//   const addReaction = useMutation(api.messages.addReaction);
//   const [showReactions, setShowReactions] = useState(false);

//   const isOwnMessage = currentUser?.clerkId === message.senderId;

//   const handleDelete = async () => {
//     if (confirm("Delete this message?")) {
//       await deleteMessage({ messageId: message._id });
//     }
//   };
// {isSystemMessage ? (
//   // System message style
//   <div className="text-center py-2">
//     <div className="inline-block px-4 py-2 bg-blue-50 text-blue-800 rounded-full text-sm">
//       {message.content}
//     </div>
//   </div>
// ) : (
//   // Regular message (your existing code)
//   <div className={cn(/* ... */)}>
//     {/* ... existing message rendering ... */}
//   </div>
// )}
// if (message.isSystemMessage) {
//   return (
//     <div className="flex justify-center py-4">
//       <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
//         {message.content}
//       </div>
//     </div>
//   );
//   const handleReaction = async (emoji: string) => {
//     await addReaction({ messageId: message._id, emoji });
//     setShowReactions(false);
//   };

//   // Group reactions by emoji
//   const reactionGroups = message.reactions.reduce((acc: any, reaction: any) => {
//     if (!acc[reaction.emoji]) {
//       acc[reaction.emoji] = [];
//     }
//     acc[reaction.emoji].push(reaction.userId);
//     return acc;
//   }, {});

//   return (
//     <div
//       className={cn(
//         "flex gap-3 group",
//         isOwnMessage && "flex-row-reverse"
//       )}
//     >
//       {/* Avatar */}
//       <div className="flex-shrink-0">
//         {showAvatar ? (
//           <Avatar className="h-8 w-8">
//             <AvatarImage src={message.sender?.imageUrl} />
//             <AvatarFallback>
//               {message.sender?.name?.substring(0, 2).toUpperCase()}
//             </AvatarFallback>
//           </Avatar>
//         ) : (
//           <div className="h-8 w-8" />
//         )}
//       </div>

//       {/* Message content */}
//       <div className={cn("flex flex-col gap-1 max-w-md", isOwnMessage && "items-end")}>
//         {/* Timestamp */}
//         {showTimestamp && (
//           <div className="text-xs text-gray-500 px-2">
//             {formatMessageTime(message.createdAt)}
//           </div>
//         )}

//         {/* Sender name for other users */}
//         {!isOwnMessage && showAvatar && (
//           <div className="text-xs text-gray-600 font-medium px-2">
//             {message.sender?.name}
//           </div>
//         )}

//         {/* Message bubble */}
//         <div className="relative group">
//           <div
//             className={cn(
//               "px-4 py-2 rounded-2xl relative",
//               isOwnMessage
//                 ? "bg-blue-500 text-white"
//                 : "bg-gray-200 text-gray-900",
//               message.isDeleted && "italic opacity-60"
//             )}
//           >
//             {message.isDeleted ? (
//               <span className="text-sm">This message was deleted</span>
//             ) : (
//               <p className="whitespace-pre-wrap break-words">{message.content}</p>
//             )}
//           </div>

//           {/* Actions */}
//           {!message.isDeleted && (
//             <div
//               className={cn(
//                 "absolute top-0 hidden group-hover:flex items-center gap-1",
//                 isOwnMessage ? "right-full mr-2" : "left-full ml-2"
//               )}
//             >
//               {/* Reaction button */}
//               <div className="relative">
//                 <Button
//                   size="icon"
//                   variant="ghost"
//                   className="h-6 w-6"
//                   onClick={() => setShowReactions(!showReactions)}
//                 >
//                   <Smile className="h-4 w-4" />
//                 </Button>

//                 {showReactions && (
//                   <div className="absolute top-full mt-1 bg-white shadow-lg rounded-lg p-2 flex gap-1 z-10">
//                     {EMOJI_REACTIONS.map((emoji) => (
//                       <button
//                         key={emoji}
//                         onClick={() => handleReaction(emoji)}
//                         className="text-xl hover:scale-125 transition"
//                       >
//                         {emoji}
//                       </button>
//                     ))}
//                   </div>
//                 )}
//               </div>

//               {/* Delete button for own messages */}
//               {isOwnMessage && (
//                 <Button
//                   size="icon"
//                   variant="ghost"
//                   className="h-6 w-6"
//                   onClick={handleDelete}
//                 >
//                   <Trash2 className="h-4 w-4" />
//                 </Button>
//               )}
//             </div>
//           )}

//           {/* Reactions display */}
//           {Object.keys(reactionGroups).length > 0 && (
//             <div
//               className={cn(
//                 "flex gap-1 mt-1",
//                 isOwnMessage ? "justify-end" : "justify-start"
//               )}
//             >
//               {Object.entries(reactionGroups).map(([emoji, userIds]: [string, any]) => (
//                 <button
//                   key={emoji}
//                   onClick={() => handleReaction(emoji)}
//                   className="px-2 py-0.5 bg-white border rounded-full text-sm hover:scale-110 transition flex items-center gap-1"
//                 >
//                   <span>{emoji}</span>
//                   <span className="text-xs text-gray-600">{userIds.length}</span>
//                 </button>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
// }
"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { formatFullMessageTime } from "@/lib/formattime";
import { cn } from "@/lib/utils";
import { Trash2, Smile } from "lucide-react";

const EMOJI_REACTIONS = ["👍", "❤️", "😂", "😮", "😢"];

// Explicit message type — no dependency on Doc<"messages"> before codegen runs
interface Message {
  _id: Id<"messages">;
  conversationId: Id<"conversations">;
  senderId: string;
  text: string;
  isDeleted: boolean;
  reactions?: { emoji: string; userId: string }[];
  createdAt: number;
  // optional sender info joined from users table
  sender?: {
    name: string;
    imageUrl?: string;
    clerkId: string;
  };
}

interface MessageItemProps {
  message: Message;
  currentUserId: string;
  showAvatar?: boolean;
  showTimestamp?: boolean;
}

export default function MessageItem({
  message,
  currentUserId,
  showAvatar = true,
  showTimestamp = true,
}: MessageItemProps) {
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const deleteMessage = useMutation(api.messages.deleteMessage);
  const toggleReaction = useMutation(api.messages.toggleReaction);

  const isOwn = currentUserId === message.senderId;

  // Group reactions by emoji: { "👍": ["uid1", "uid2"] }
  const reactionGroups: Record<string, string[]> = {};
  for (const r of message.reactions ?? []) {
    if (!reactionGroups[r.emoji]) reactionGroups[r.emoji] = [];
    reactionGroups[r.emoji].push(r.userId);
  }

  const handleDelete = async () => {
    // userId is required by the mutation — must pass currentUserId
    await deleteMessage({
      messageId: message._id,
      userId: currentUserId,
    });
    setShowActions(false);
  };

  const handleReaction = async (emoji: string) => {
    // userId is required by the mutation
    await toggleReaction({
      messageId: message._id,
      userId: currentUserId,
      emoji,
    });
    setShowReactionPicker(false);
    setShowActions(false);
  };

  return (
    <div
      className={cn("flex gap-3 group", isOwn && "flex-row-reverse")}
      onMouseEnter={() => !message.isDeleted && setShowActions(true)}
      onMouseLeave={() => {
        setShowActions(false);
        setShowReactionPicker(false);
      }}
    >
      {/* Avatar */}
      <div className="flex-shrink-0 w-8">
        {showAvatar ? (
          message.sender?.imageUrl ? (
            <img
              src={message.sender.imageUrl}
              alt={message.sender.name}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#6b7c85] flex items-center justify-center text-white text-xs font-semibold">
              {message.sender?.name?.slice(0, 2).toUpperCase() ?? "??"}
            </div>
          )
        ) : (
          <div className="w-8 h-8" /> // placeholder to keep alignment
        )}
      </div>

      {/* Content column */}
      <div className={cn("flex flex-col gap-1 max-w-[65%]", isOwn && "items-end")}>
        {/* Sender name (only for other users, only when avatar is shown) */}
        {!isOwn && showAvatar && message.sender?.name && (
          <span className="text-xs text-[#8696a0] font-medium px-1">
            {message.sender.name}
          </span>
        )}

        {/* Timestamp */}
        {showTimestamp && (
          <span className="text-[10px] text-[#8696a0] px-1">
            {formatFullMessageTime(message.createdAt)}
          </span>
        )}

        {/* Bubble + actions */}
        <div className="relative">
          {/* Message bubble */}
          <div
            className={cn(
              "px-3 py-2 rounded-xl shadow-sm",
              isOwn
                ? "bg-[#005c4b] text-[#e9edef]"
                : "bg-[#202c33] text-[#e9edef]",
              message.isDeleted && "bg-[#182229] text-[#8696a0] italic"
            )}
          >
            {message.isDeleted ? (
              <span className="text-sm">This message was deleted</span>
            ) : (
              <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                {message.text}
              </p>
            )}

            {/* Inline timestamp inside bubble */}
            <span className="text-[10px] text-[#8696a0] mt-0.5 block text-right">
              {formatFullMessageTime(message.createdAt)}
            </span>

            {/* Bubble tail */}
            {!message.isDeleted && (
              <div
                className={cn(
                  "absolute bottom-0 w-3 h-3",
                  isOwn ? "right-[-5px] bg-[#005c4b]" : "left-[-5px] bg-[#202c33]"
                )}
                style={{
                  clipPath: isOwn
                    ? "polygon(0 0, 100% 100%, 0 100%)"
                    : "polygon(100% 0, 0 100%, 100% 100%)",
                }}
              />
            )}
          </div>

          {/* Hover action toolbar */}
          {showActions && !message.isDeleted && (
            <div
              className={cn(
                "absolute -top-10 flex items-center gap-0.5",
                "bg-[#233138] border border-[#2a3942] rounded-xl p-1.5 shadow-xl z-20",
                isOwn ? "right-0" : "left-0"
              )}
            >
              {showReactionPicker ? (
                /* Emoji picker row */
                <>
                  {EMOJI_REACTIONS.map((emoji) => (
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
                /* Default: react + delete */
                <>
                  <button
                    onClick={() => setShowReactionPicker(true)}
                    className="p-1.5 text-[#8696a0] hover:text-[#e9edef] hover:bg-[#2a3942] rounded-lg transition-colors"
                    title="React"
                  >
                    <Smile className="w-4 h-4" />
                  </button>
                  {isOwn && (
                    <button
                      onClick={handleDelete}
                      className="p-1.5 text-[#8696a0] hover:text-red-400 hover:bg-[#2a3942] rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Reaction counts below bubble */}
        {Object.keys(reactionGroups).length > 0 && (
          <div className={cn("flex gap-1 flex-wrap", isOwn ? "justify-end" : "justify-start")}>
            {Object.entries(reactionGroups).map(([emoji, users]) => (
              <button
                key={emoji}
                onClick={() => handleReaction(emoji)}
                className={cn(
                  "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-colors",
                  users.includes(currentUserId)
                    ? "bg-[#00a884]/20 border-[#00a884]/60 text-[#00a884]"
                    : "bg-[#202c33] border-[#2a3942] text-[#8696a0] hover:bg-[#2a3942]"
                )}
              >
                <span>{emoji}</span>
                <span>{users.length}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}