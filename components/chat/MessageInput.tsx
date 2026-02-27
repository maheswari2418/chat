// "use client";

// import { useState, useRef, KeyboardEvent } from "react";
// import { useMutation } from "convex/react";
// import { api } from "@/convex/_generated/api";
// import { Id } from "@/convex/_generated/dataModel";
// import { Button } from "@/components/ui";
// import { Textarea } from "@/components/ui";
// import { Send, Loader2 } from "lucide-react";
// import { useDebounce } from "@/hooks/use-debounce";

// interface MessageInputProps {
//   conversationId: Id<"conversations">;
// }

// export default function MessageInput({ conversationId }: MessageInputProps) {
//   const [message, setMessage] = useState("");
//   const [isSending, setIsSending] = useState(false);
//   const textareaRef = useRef<HTMLTextAreaElement>(null);
//   const sendMessage = useMutation(api.messages.send);
//   const setTyping = useMutation(api.typing.setTyping);

//   // Debounced typing indicator
//   const [debouncedMessage] = useDebounce(message, 300);

//   // Send typing indicator when user types
//   const handleTyping = () => {
//     if (message.trim()) {
//       setTyping({ conversationId });
//     }
//   };

//   const handleSend = async () => {
//     if (!message.trim() || isSending) return;

//     setIsSending(true);
//     const messageToSend = message;
//     setMessage("");

//     // Reset textarea height
//     if (textareaRef.current) {
//       textareaRef.current.style.height = "auto";
//     }

//     try {
//       await sendMessage({
//         conversationId,
//         content: messageToSend,
//       });
//     } catch (error) {
//       console.error("Error sending message:", error);
//       setMessage(messageToSend); // Restore message on error
//     } finally {
//       setIsSending(false);
//     }
//   };

//   const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       handleSend();
//     }
//   };

//   // Auto-resize textarea
//   const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
//     setMessage(e.target.value);
//     handleTyping();

//     // Auto-resize
//     if (textareaRef.current) {
//       textareaRef.current.style.height = "auto";
//       textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
//     }
//   };

//   return (
//     <div className="border-t bg-white p-4">
//       <div className="max-w-4xl mx-auto flex gap-2 items-end">
//         <Textarea
//           ref={textareaRef}
//           value={message}
//           onChange={handleChange}
//           onKeyDown={handleKeyDown}
//           placeholder="Type a message..."
//           className="min-h-[44px] max-h-[200px] resize-none"
//           disabled={isSending}
//           rows={1}
//         />
//         <Button
//           onClick={handleSend}
//           disabled={!message.trim() || isSending}
//           size="icon"
//           className="flex-shrink-0"
//         >
//           {isSending ? (
//             <Loader2 className="h-4 w-4 animate-spin" />
//           ) : (
//             <Send className="h-4 w-4" />
//           )}
//         </Button>
//       </div>
//       <p className="text-xs text-gray-500 mt-2 text-center">
//         Press Enter to send, Shift+Enter for new line
//       </p>
//     </div>
//   );
// }
// "use client";

// import { useState, useRef, useCallback, useEffect } from "react";
// import { useMutation } from "convex/react";
// import { api } from "@/convex/_generated/api";
// import { Id } from "@/convex/_generated/dataModel";
// import { Send, AlertCircle, RefreshCw } from "lucide-react";

// interface Props {
//   conversationId: Id<"conversations">;
//   currentUserId: string;
// }

// export default function MessageInput({ conversationId, currentUserId }: Props) {
//   const [text, setText] = useState("");
//   const [isSending, setIsSending] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [failedText, setFailedText] = useState<string | null>(null);
//   const textareaRef = useRef<HTMLTextAreaElement>(null);
//   const typingTimer = useRef<ReturnType<typeof setTimeout>>();

//   const sendMessage = useMutation(api.messages.sendMessage);
//   const setTyping = useMutation(api.presence.setTyping);

//   const stopTyping = useCallback(() => {
//     setTyping({ conversationId, userId: currentUserId, isTyping: false });
//   }, [conversationId, currentUserId, setTyping]);

//   const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
//     setText(e.target.value);
//     setTyping({ conversationId, userId: currentUserId, isTyping: true });
//     clearTimeout(typingTimer.current);
//     typingTimer.current = setTimeout(stopTyping, 2000);

//     // Auto resize
//     const el = textareaRef.current;
//     if (el) {
//       el.style.height = "auto";
//       el.style.height = Math.min(el.scrollHeight, 120) + "px";
//     }
//   };

//   const doSend = async (msg: string) => {
//     if (!msg.trim()) return;
//     setIsSending(true);
//     setError(null);
//     try {
//       await sendMessage({ conversationId, senderId: currentUserId, text: msg.trim() });
//       stopTyping();
//     } catch {
//       setError("Failed to send. Check your connection.");
//       setFailedText(msg);
//     } finally {
//       setIsSending(false);
//     }
//   };

//   const handleSend = async () => {
//     const msg = text;
//     setText("");
//     if (textareaRef.current) textareaRef.current.style.height = "auto";
//     await doSend(msg);
//   };

//   const handleRetry = async () => {
//     if (!failedText) return;
//     const msg = failedText;
//     setFailedText(null);
//     await doSend(msg);
//   };

//   const handleKeyDown = (e: React.KeyboardEvent) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       handleSend();
//     }
//   };

//   useEffect(() => {
//     return () => {
//       clearTimeout(typingTimer.current);
//       stopTyping();
//     };
//   }, [stopTyping]);

//   return (
//     <div className="bg-[#202c33] border-t border-[#2a3942] flex-shrink-0">
//       {/* Error bar */}
//       {error && (
//         <div className="flex items-center gap-2 px-4 py-2 bg-red-950/40 border-b border-red-900/30">
//           <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
//           <span className="text-red-400 text-xs flex-1">{error}</span>
//           {failedText && (
//             <button
//               onClick={handleRetry}
//               className="flex items-center gap-1 text-red-400 hover:text-red-300 text-xs font-medium"
//             >
//               <RefreshCw className="w-3 h-3" /> Retry
//             </button>
//           )}
//           <button
//             onClick={() => { setError(null); setFailedText(null); }}
//             className="text-red-400 hover:text-red-300 text-xs ml-2"
//           >
//             ✕
//           </button>
//         </div>
//       )}

//       {/* Input row */}
//       <div className="flex items-end gap-3 px-4 py-3">
//         <textarea
//           ref={textareaRef}
//           value={text}
//           onChange={handleChange}
//           onKeyDown={handleKeyDown}
//           placeholder="Type a message…"
//           rows={1}
//           className="flex-1 bg-[#2a3942] text-[#e9edef] placeholder-[#8696a0] rounded-xl px-4 py-2.5 text-sm focus:outline-none resize-none leading-relaxed"
//           style={{ minHeight: "42px", maxHeight: "120px" }}
//         />
//         <button
//           onClick={handleSend}
//           disabled={!text.trim() || isSending}
//           className="w-11 h-11 bg-[#00a884] rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#02b893] active:scale-95 transition-all shadow-md"
//         >
//           <Send className="w-5 h-5 text-white" />
//         </button>
//       </div>
//     </div>
//   );
// }
"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { Send, AlertCircle, RefreshCw, X } from "lucide-react";

interface Props {
  conversationId: Id<"conversations">;
  currentUserId: string;
  replyToMessage?: Doc<"messages"> | null;
  onCancelReply?: () => void;
}

export default function MessageInput({
  conversationId,
  currentUserId,
  replyToMessage = null,
  onCancelReply,
}: Props) {
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [failedText, setFailedText] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const sendMessage = useMutation(api.messages.sendMessage);
  const setTyping = useMutation(api.presence.setTyping);

  // Always pass all 3 required args: conversationId, userId, isTyping
  const stopTyping = useCallback(() => {
    setTyping({
      conversationId,
      userId: currentUserId,
      isTyping: false,
    });
  }, [conversationId, currentUserId, setTyping]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);

    // Fire typing indicator
    setTyping({
      conversationId,
      userId: currentUserId,
      isTyping: true,
    });

    // Reset 2s debounce timer
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(stopTyping, 2000);

    // Auto-resize textarea up to 120px
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 120) + "px";
    }
  };

  const doSend = async (msg: string) => {
    if (!msg.trim()) return;
    setIsSending(true);
    setError(null);
    try {
      await sendMessage({
        conversationId,
        senderId: currentUserId,
        text: msg.trim(),
        ...(replyToMessage ? { replyToMessageId: replyToMessage._id } : {}),
      });
      stopTyping();
      onCancelReply?.();
    } catch {
      setError("Failed to send. Check your connection.");
      setFailedText(msg);
    } finally {
      setIsSending(false);
    }
  };

  const handleSend = async () => {
    const msg = text;
    setText("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    await doSend(msg);
  };

  const handleRetry = async () => {
    if (!failedText) return;
    const msg = failedText;
    setFailedText(null);
    await doSend(msg);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Clean up typing indicator on unmount / conversation change
  useEffect(() => {
    return () => {
      clearTimeout(typingTimer.current);
      stopTyping();
    };
  }, [stopTyping]);

  useEffect(() => {
    if (replyToMessage) {
      textareaRef.current?.focus();
    }
  }, [replyToMessage?._id]);

  return (
    <div className="bg-[#202c33] border-t border-[#2a3942] flex-shrink-0">
      {/* Error banner with retry */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-2 bg-red-950/40 border-b border-red-900/30">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span className="text-red-400 text-xs flex-1">{error}</span>
          {failedText && (
            <button
              onClick={handleRetry}
              className="flex items-center gap-1 text-red-400 hover:text-red-300 text-xs font-medium"
            >
              <RefreshCw className="w-3 h-3" />
              Retry
            </button>
          )}
          <button
            onClick={() => {
              setError(null);
              setFailedText(null);
            }}
            className="text-red-400 hover:text-red-300 text-xs ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Reply preview */}
      {replyToMessage && (
        <div className="px-4 pt-3">
          <div className="flex items-start justify-between gap-3 bg-[#233138] border border-[#2a3942] rounded-xl px-3 py-2">
            <div className="min-w-0">
              <p className="text-[11px] text-[#00a884] font-semibold">
                Replying to{" "}
                {replyToMessage.senderId === currentUserId ? "yourself" : "message"}
              </p>
              <p className="text-xs text-[#aebac1] truncate">
                {replyToMessage.isDeleted ? "This message was deleted" : replyToMessage.text}
              </p>
            </div>
            <button
              onClick={() => onCancelReply?.()}
              className="p-1 text-[#8696a0] hover:text-[#e9edef] hover:bg-[#2a3942] rounded-lg transition-colors flex-shrink-0"
              title="Cancel reply"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Input row */}
      <div className="flex items-end gap-3 px-4 py-3">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message…"
          rows={1}
          className="flex-1 bg-[#2a3942] text-[#e9edef] placeholder-[#8696a0] rounded-xl px-4 py-2.5 text-sm focus:outline-none resize-none leading-relaxed"
          style={{ minHeight: "42px", maxHeight: "120px" }}
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || isSending}
          className="w-11 h-11 bg-[#00a884] rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#02b893] active:scale-95 transition-all shadow-md"
        >
          <Send className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  );
}
