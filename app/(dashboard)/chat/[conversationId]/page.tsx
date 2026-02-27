"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import ChatHeader from "@/components/chat/chat-header";
import MessageList from "@/components/chat/MessageList";
import MessageInput from "@/components/chat/MessageInput";

export default function ConversationPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const conversationId = params.conversationId as Id<"conversations">;
  const [replyTo, setReplyTo] = useState<Doc<"messages"> | null>(null);

  const conversation = useQuery(api.conversations.getConversation, {
    conversationId,
  });
  const replyToForConversation = useMemo(() => {
    if (!replyTo) return null;
    return replyTo.conversationId === conversationId ? replyTo : null;
  }, [replyTo, conversationId]);

  if (!user) return null;

  if (conversation === undefined) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#222e35]">
        <div className="w-8 h-8 border-2 border-[#00a884] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (conversation === null) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#222e35] gap-3">
        <p className="text-[#8696a0]">Conversation not found.</p>
        <button
          onClick={() => router.push("/chat")}
          className="text-[#00a884] text-sm hover:underline"
        >
          ← Back to chats
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ChatHeader
        conversationId={conversationId}
        currentUserId={user.id}
        conversation={conversation}
        onBack={() => router.push("/chat")}
      />
      <MessageList
        conversationId={conversationId}
        currentUserId={user.id}
        onReply={setReplyTo}
      />
      <MessageInput
        conversationId={conversationId}
        currentUserId={user.id}
        replyToMessage={replyToForConversation}
        onCancelReply={() => setReplyTo(null)}
      />
    </div>
  );
}
