// "use client";

// import { useAuth } from "@/lib/auth-context";
// import { useQuery, useMutation } from "convex/react";
// import { api } from "@/convex/_generated/api";
// import { useParams, useRouter } from "next/navigation";
// import { useEffect, useRef, useState, useCallback } from "react";
// import { Id } from "@/convex/_generated/dataModel";
// import { formatMessageTime } from "@/lib/formattime";
// import {
//   ArrowLeft, MoreVertical, Phone, Video, Search,
//   Smile, Paperclip, Send, Mic, Check, CheckCheck, Loader2,
// } from "lucide-react";

// // ══════════════════════════ DATE SEPARATOR ══════════════════════
// function DateSeparator({ label }: { label: string }) {
//   return (
//     <div className="flex items-center justify-center my-4">
//       <span className="bg-[#182229] text-[#8696a0] text-xs px-3 py-1 rounded-full shadow-sm">
//         {label}
//       </span>
//     </div>
//   );
// }

// // ══════════════════════════ TYPING INDICATOR ════════════════════
// function TypingIndicator({ names }: { names: string[] }) {
//   if (names.length === 0) return null;
//   return (
//     <div className="flex items-end gap-2 px-4 pb-2">
//       <div className="bg-[#202c33] rounded-2xl rounded-bl-none px-4 py-2.5 flex items-center gap-1">
//         <span className="w-1.5 h-1.5 bg-[#8696a0] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
//         <span className="w-1.5 h-1.5 bg-[#8696a0] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
//         <span className="w-1.5 h-1.5 bg-[#8696a0] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
//       </div>
//     </div>
//   );
// }

// // ══════════════════════════ CHAT PAGE ═══════════════════════════
// export default function ChatPage() {
//   const { userName, displayName } = useAuth();
//   const params = useParams();
//   const router = useRouter();
//   const conversationId = params.conversationId as Id<"conversations">;

//   const conversation = useQuery(
//     api.conversations.getConversationById,
//     userName ? { conversationId, userName } : "skip"
//   );
//   const messages = useQuery(
//     api.messages.list,
//     userName ? { conversationId, userName } : "skip"
//   );
//   const typingUsers = useQuery(
//     api.typing.getTypingUsers,
//     userName ? { conversationId, currentUserName: userName } : "skip"
//   );

//   const sendMessage = useMutation(api.messages.send);
//   const setTyping = useMutation(api.typing.setTyping);
//   const stopTyping = useMutation(api.typing.stopTyping);
//   const markAsRead = useMutation(api.unreadCounts.markAsRead);

//   const [input, setInput] = useState("");
//   const [isSending, setIsSending] = useState(false);
//   const bottomRef = useRef<HTMLDivElement>(null);
//   const textareaRef = useRef<HTMLTextAreaElement>(null);
//   const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

//   const other = conversation?.otherUsers[0];

//   // Auto-scroll to bottom
//   useEffect(() => {
//     bottomRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   // Mark as read on open
//   useEffect(() => {
//     if (userName && conversationId) {
//       markAsRead({ conversationId, userName }).catch(console.error);
//     }
//   }, [conversationId, userName, markAsRead]);

//   // Handle typing events
//   const handleTyping = useCallback(() => {
//     if (!userName) return;
//     setTyping({ conversationId, userName }).catch(console.error);
//     if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
//     typingTimeoutRef.current = setTimeout(() => {
//       stopTyping({ conversationId, userName }).catch(console.error);
//     }, 2500);
//   }, [conversationId, userName, setTyping, stopTyping]);

//   const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
//     setInput(e.target.value);
//     // Auto resize
//     e.target.style.height = "auto";
//     e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
//     if (e.target.value) handleTyping();
//   };

//   const handleSend = async () => {
//     if (!input.trim() || !userName || isSending) return;
//     setIsSending(true);
//     const content = input.trim();
//     setInput("");
//     if (textareaRef.current) textareaRef.current.style.height = "auto";
//     if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
//     stopTyping({ conversationId, userName }).catch(console.error);
//     try {
//       await sendMessage({ conversationId, senderName: userName, content });
//     } catch (err) {
//       console.error(err);
//       setInput(content);
//     } finally {
//       setIsSending(false);
//     }
//   };

//   const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       handleSend();
//     }
//   };

//   if (!userName) return null;

//   // Group messages with date separators
//   const groupedMessages: Array<{ type: "date"; label: string } | { type: "message"; msg: NonNullable<typeof messages>[0] }> = [];

//   let lastDate = "";
//   messages?.forEach((msg) => {
//     const d = new Date(msg.createdAt);
//     const today = new Date();
//     const yesterday = new Date(today);
//     yesterday.setDate(yesterday.getDate() - 1);

//     const dateKey = d.toDateString();
//     const todayKey = today.toDateString();
//     const yestKey = yesterday.toDateString();

//     const label = dateKey === todayKey ? "Today" : dateKey === yestKey ? "Yesterday" : d.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });

//     if (dateKey !== lastDate) {
//       groupedMessages.push({ type: "date", label });
//       lastDate = dateKey;
//     }
//     groupedMessages.push({ type: "message", msg });
//   });

//   const typingNames = typingUsers?.map((u) => u.displayName) ?? [];

//   return (
//     <div className="flex flex-col h-screen bg-[#111b21] font-['Segoe_UI',sans-serif]">
//       {/* ── HEADER ──────────────────────────────────────────────── */}
//       <div className="flex items-center gap-3 px-4 py-2.5 bg-[#202c33] border-b border-[#2a3942] flex-shrink-0">
//         <button
//           onClick={() => router.push("/")}
//           className="text-[#aebac1] hover:text-white transition-colors mr-1 md:hidden"
//         >
//           <ArrowLeft className="w-5 h-5" />
//         </button>

//         {/* Avatar */}
//         <div className="relative cursor-pointer">
//           <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00a884] to-[#025144] flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
//             {other?.displayName.substring(0, 2).toUpperCase() ?? "?"}
//           </div>
//           {other?.isOnline && (
//             <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 bg-[#00a884] rounded-full border-2 border-[#202c33]" />
//           )}
//         </div>

//         {/* Name + status */}
//         <div className="flex-1 min-w-0 cursor-pointer">
//           <h2 className="text-[#e9edef] font-medium text-sm truncate">
//             {other?.displayName ?? "Loading..."}
//           </h2>
//           <p className="text-xs text-[#8696a0] truncate">
//             {typingNames.length > 0 ? (
//               <span className="text-[#00a884]">typing...</span>
//             ) : other?.isOnline ? (
//               "online"
//             ) : (
//               "last seen recently"
//             )}
//           </p>
//         </div>

//         {/* Action buttons */}
//         <div className="flex items-center gap-1">
//           {[Video, Phone, Search].map((Icon, i) => (
//             <button
//               key={i}
//               className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#2a3942] transition-colors"
//             >
//               <Icon className="w-5 h-5 text-[#aebac1]" />
//             </button>
//           ))}
//           <button className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#2a3942] transition-colors">
//             <MoreVertical className="w-5 h-5 text-[#aebac1]" />
//           </button>
//         </div>
//       </div>

//       {/* ── MESSAGES ────────────────────────────────────────────── */}
//       <div
//         className="flex-1 overflow-y-auto px-4 py-3 scrollbar-thin scrollbar-thumb-[#2a3942]"
//         style={{
//           backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
//           backgroundColor: "#0b141a",
//         }}
//       >
//         {messages === undefined ? (
//           <div className="flex justify-center items-center h-full">
//             <Loader2 className="w-6 h-6 animate-spin text-[#00a884]" />
//           </div>
//         ) : messages.length === 0 ? (
//           <div className="flex justify-center my-4">
//             <span className="bg-[#182229] text-[#8696a0] text-xs px-4 py-2 rounded-full shadow-sm">
//               No messages yet. Say hi! 👋
//             </span>
//           </div>
//         ) : (
//           groupedMessages.map((item, i) => {
//             if (item.type === "date") {
//               return <DateSeparator key={`date-${i}`} label={item.label} />;
//             }
//             const msg = item.msg;
//             const isMe = msg.senderName === userName;
//             return (
//               <MessageBubble
//                 key={msg._id}
//                 content={msg.isDeleted ? "🚫 This message was deleted" : msg.content}
//                 time={formatMessageTime(msg.createdAt)}
//                 isMe={isMe}
//                 isDeleted={msg.isDeleted}
//               />
//             );
//           })
//         )}

//         {/* Typing indicator */}
//         <TypingIndicator names={typingNames} />

//         <div ref={bottomRef} />
//       </div>

//       {/* ── INPUT BAR ───────────────────────────────────────────── */}
//       <div className="bg-[#202c33] px-3 py-2.5 flex items-end gap-2 flex-shrink-0 border-t border-[#2a3942]">
//         {/* Emoji + attach */}
//         <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#2a3942] transition-colors flex-shrink-0">
//           <Smile className="w-6 h-6 text-[#8696a0]" />
//         </button>
//         <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#2a3942] transition-colors flex-shrink-0">
//           <Paperclip className="w-6 h-6 text-[#8696a0]" />
//         </button>

//         {/* Text input */}
//         <div className="flex-1 bg-[#2a3942] rounded-lg px-4 py-2.5">
//           <textarea
//             ref={textareaRef}
//             rows={1}
//             placeholder="Type a message"
//             value={input}
//             onChange={handleInputChange}
//             onKeyDown={handleKeyDown}
//             className="w-full bg-transparent text-[#e9edef] placeholder-[#8696a0] text-sm outline-none resize-none leading-normal max-h-[120px] overflow-y-auto"
//             style={{ height: "24px" }}
//           />
//         </div>

//         {/* Send / Mic button */}
//         <button
//           onClick={input.trim() ? handleSend : undefined}
//           disabled={isSending}
//           className="w-10 h-10 flex items-center justify-center rounded-full bg-[#00a884] hover:bg-[#06cf9c] transition-all flex-shrink-0 disabled:opacity-60"
//         >
//           {isSending ? (
//             <Loader2 className="w-5 h-5 text-white animate-spin" />
//           ) : input.trim() ? (
//             <Send className="w-5 h-5 text-white" />
//           ) : (
//             <Mic className="w-5 h-5 text-white" />
//           )}
//         </button>
//       </div>
//     </div>
//   );
// }

// // ══════════════════════════ MESSAGE BUBBLE ══════════════════════
// function MessageBubble({
//   content, time, isMe, isDeleted,
// }: {
//   content: string; time: string; isMe: boolean; isDeleted: boolean;
// }) {
//   return (
//     <div className={`flex mb-1.5 ${isMe ? "justify-end" : "justify-start"}`}>
//       <div
//         className={`max-w-[65%] px-3 py-2 rounded-lg shadow-sm relative ${
//           isMe
//             ? "bg-[#005c4b] text-[#e9edef] rounded-tr-none"
//             : "bg-[#202c33] text-[#e9edef] rounded-tl-none"
//         } ${isDeleted ? "opacity-60 italic" : ""}`}
//         style={{
//           // WhatsApp message tail
//           ...(isMe
//             ? {
//                 borderTopRightRadius: "2px",
//                 clipPath: "polygon(0 0, calc(100% + 0px) 0, 100% 100%, 0% 100%)",
//               }
//             : {}),
//         }}
//       >
//         <p className="text-sm leading-relaxed break-words whitespace-pre-wrap pr-12">
//           {content}
//         </p>
//         {/* Time + read receipt */}
//         <div className="absolute bottom-1.5 right-2 flex items-center gap-1">
//           <span className="text-[10px] text-[#8696a0] leading-none">{time}</span>
//           {isMe && <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />}
//         </div>
//       </div>
//     </div>
//   );
// }
import { redirect } from "next/navigation";

export default function ConversationRedirect({
  params,
}: {
  params: { conversationId: string };
}) {
  redirect(`/chat/${params.conversationId}`);
}
