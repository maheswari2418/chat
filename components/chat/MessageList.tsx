// "use client";

// import { useQuery } from "convex/react";
// import { api } from "@/convex/_generated/api";
// import { Id } from "@/convex/_generated/dataModel";
// import { useEffect, useRef, useState } from "react";
// import MessageItem from "./messageitem";
// import { ScrollArea } from "@/components/ui";
// import { Button } from "@/components/ui";
// import { ArrowDown } from "lucide-react";
// import EmptyState from "@/components/chat/shared/empty";
// import { useAuth } from "@/lib/auth-context";

// interface MessageListProps {
//   conversationId: Id<"conversations">;
// }

// export default function MessageList({ conversationId }: MessageListProps) {
//   const { userName } = useAuth();
//   const messages = useQuery(
//     api.messages.list,
//     userName ? { conversationId, userName } : "skip"
//   );
//   const scrollRef = useRef<HTMLDivElement>(null);
//   const [isNearBottom, setIsNearBottom] = useState(true);
//   const [showScrollButton, setShowScrollButton] = useState(false);

//   // Get viewport element helper
//   const getViewport = () => {
//     return (scrollRef.current?.querySelector(
//       '[data-radix-scroll-area-viewport]'
//     ) as HTMLElement | null) ?? null;
//   };

//   // Handle scroll to check if user is near bottom
//   const handleScroll = () => {
//     const viewport = getViewport();
//     if (!viewport) return;

//     const { scrollTop, scrollHeight, clientHeight } = viewport;
//     const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
//     const nearBottom = distanceFromBottom < 100;
//     setIsNearBottom(nearBottom);
//     setShowScrollButton(!nearBottom && !!messages && messages.length > 0);
//   };

//   // Attach scroll listener to viewport
//   useEffect(() => {
//     const viewport = getViewport();
//     if (!viewport) return;

//     viewport.addEventListener("scroll", handleScroll);
//     handleScroll(); // Initialize state

//     return () => viewport.removeEventListener("scroll", handleScroll);
//   }, [messages]);

//   // Auto-scroll to bottom when new messages arrive
//   useEffect(() => {
//     const viewport = getViewport();
//     if (isNearBottom && viewport) {
//       viewport.scrollTop = viewport.scrollHeight;
//     }
//   }, [messages, isNearBottom]);

//   // Initial scroll to bottom on conversation change
//   useEffect(() => {
//     const viewport = getViewport();
//     if (viewport) {
//       setTimeout(() => {
//         viewport.scrollTop = viewport.scrollHeight;
//       }, 0);
//     }
//   }, [conversationId]);

//   const scrollToBottom = () => {
//     const viewport = getViewport();
//     if (!viewport) return;

//     viewport.scrollTo({
//       top: viewport.scrollHeight,
//       behavior: "smooth",
//     });
//   };

//   if (messages === undefined) {
//     return (
//       <div className="flex-1 flex items-center justify-center">
//         <div className="text-gray-500">Loading messages...</div>
//       </div>
//     );
//   }

//   if (messages.length === 0) {
//     return (
//       <div className="flex-1 flex items-center justify-center">
//         <EmptyState
//           icon="💬"
//           title="No messages yet"
//           description="Start the conversation by sending a message below"
//         />
//       </div>
//     );
//   }

//   return (
//     <div className="flex-1 relative">
//       <ScrollArea ref={scrollRef} className="h-full px-4 py-4 scrollbar-thin">
//         <div className="space-y-4 max-w-4xl mx-auto">
//           {messages.map((message, index) => {
//             const showAvatar =
//               index === messages.length - 1 ||
//               messages[index + 1]?.senderName !== message.senderName;

//             const showTimestamp =
//               index === 0 ||
//               message.createdAt - messages[index - 1].createdAt > 300000; // 5 minutes

//             return (
//               <MessageItem
//                 key={message._id}
//                 message={message}
//                 showAvatar={showAvatar}
//                 showTimestamp={showTimestamp}
//               />
//             );
//           })}
//         </div>
//       </ScrollArea>

//       {/* Scroll to bottom button */}
//       {showScrollButton && (
//         <div className="absolute bottom-4 right-4">
//           <Button
//             onClick={scrollToBottom}
//             size="icon"
//             className="rounded-full shadow-lg"
//           >
//             <ArrowDown className="h-4 w-4" />
//           </Button>
//         </div>
//       )}
//     </div>
//   );
// }
"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import MessageBubble from "./mesbub";
import { ChevronDown, MessageCircle } from "lucide-react";

interface Props {
  conversationId: Id<"conversations">;
  currentUserId: string;
  onReply?: (message: Doc<"messages">) => void;
}

export default function MessageList({ conversationId, currentUserId, onReply }: Props) {
  const messages = useQuery(api.messages.getMessages, { conversationId });
  const markAsRead = useMutation(api.presence.markAsRead);
  const typingUsers = useQuery(api.presence.getTypingUsers, {
    conversationId,
    currentUserId,
  });
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [isScrolledUp, setIsScrolledUp] = useState(false);
  const prevLength = useRef(0);
  const messageById = useMemo(() => {
    const map = new Map<string, Doc<"messages">>();
    if (!messages) return map;
    for (const m of messages) map.set(m._id, m);
    return map;
  }, [messages]);

  // Mark as read when opening conversation
  useEffect(() => {
    markAsRead({ conversationId, userId: currentUserId });
  }, [conversationId, currentUserId, markAsRead]);

  // Mark as read when new messages arrive and user is at bottom
  useEffect(() => {
    if (messages && !isScrolledUp) {
      markAsRead({ conversationId, userId: currentUserId });
    }
  }, [messages?.length, isScrolledUp, conversationId, currentUserId, markAsRead]);

  // Auto scroll on new messages
  useEffect(() => {
    if (!messages) return;
    const newLen = messages.length;
    if (newLen > prevLength.current) {
      if (!isScrolledUp) {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      } else {
        setShowScrollBtn(true);
      }
    }
    prevLength.current = newLen;
  }, [messages, isScrolledUp]);

  // Initial scroll to bottom
  useEffect(() => {
    if (messages && prevLength.current === 0 && messages.length > 0) {
      bottomRef.current?.scrollIntoView();
    }
  }, [messages]);

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const dist = el.scrollHeight - el.scrollTop - el.clientHeight;
    setIsScrolledUp(dist > 100);
    if (dist <= 100) setShowScrollBtn(false);
  }, []);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowScrollBtn(false);
    setIsScrolledUp(false);
    markAsRead({ conversationId, userId: currentUserId });
  };

  // Skeleton while loading
  if (messages === undefined) {
    return (
      <div className="flex-1 flex flex-col gap-3 p-4 overflow-y-auto bg-[#0b141a]">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"} animate-pulse`}>
            <div
              className={`h-10 rounded-xl ${i % 2 === 0 ? "bg-[#005c4b]/60" : "bg-[#202c33]"}`}
              style={{ width: `${20 + (i * 7) % 40}%` }}
            />
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#0b141a] p-8">
        <MessageCircle className="w-14 h-14 text-[#2a3942] mb-4" />
        <p className="text-[#8696a0] text-sm font-medium">No messages yet</p>
        <p className="text-[#8696a0] text-xs mt-1">Say hello! 👋</p>
      </div>
    );
  }

  return (
    <div className="relative flex-1 overflow-hidden">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto flex flex-col gap-1 px-4 py-4 bg-[#0b141a]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232a3942' fill-opacity='0.12'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      >
        {messages.map((message, index) => {
          const prev = messages[index - 1];
          const showDate =
            !prev ||
            new Date(message.createdAt).toDateString() !==
              new Date(prev.createdAt).toDateString();

          return (
            <div key={message._id}>
              {showDate && (
                <div className="flex justify-center my-4">
                  <span className="bg-[#182229] text-[#8696a0] text-xs px-4 py-1.5 rounded-full shadow">
                    {new Date(message.createdAt).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              )}
	              <MessageBubble
	                message={message}
	                isOwn={message.senderId === currentUserId}
	                currentUserId={currentUserId}
	                replyToMessage={
	                  message.replyToMessageId
	                    ? messageById.get(message.replyToMessageId) ?? null
	                    : null
	                }
	                onReply={onReply}
	              />
            </div>
          );
        })}

        {typingUsers && typingUsers.length > 0 && (
          <div className="flex items-end gap-2 px-2 pb-2">
            <div className="bg-[#202c33] text-[#00a884] rounded-2xl rounded-bl-none px-4 py-2.5 flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1">
                <span
                  className="w-1.5 h-1.5 bg-[#00a884] rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <span
                  className="w-1.5 h-1.5 bg-[#00a884] rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className="w-1.5 h-1.5 bg-[#00a884] rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </span>
              <span className="text-[#aebac1]">
                {typingUsers.length === 1
                  ? `${typingUsers[0]?.name ?? "Someone"} is typing...`
                  : `${typingUsers.length} people are typing...`}
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* New messages scroll button */}
      {showScrollBtn && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-4 right-4 bg-[#202c33] text-[#00a884] border border-[#2a3942] rounded-full px-3 py-2 shadow-xl flex items-center gap-2 text-xs font-medium hover:bg-[#2a3942] transition-colors"
        >
          <ChevronDown className="w-4 h-4" />
          New messages
        </button>
      )}
    </div>
  );
}
