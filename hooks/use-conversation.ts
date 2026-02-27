import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export function useConversation(conversationId: Id<"conversations"> | undefined) {
  const conversation = useQuery(
    api.conversations.getConversationById,
    conversationId ? { conversationId } : "skip"
  );
  return conversation;
}