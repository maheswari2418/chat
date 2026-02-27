// import { v } from "convex/values";
// import { mutation, query, internalMutation } from "./_generated/server";

// // Set / refresh typing indicator (upsert with 3s TTL)
// export const setTyping = mutation({
//   args: {
//     conversationId: v.id("conversations"),
//     userName: v.string(),
//   },
//   handler: async (ctx, args) => {
//     const expiresAt = Date.now() + 3000;

//     const existing = await ctx.db
//       .query("typingIndicators")
//       .withIndex("by_user_conversation", (q) =>
//         q.eq("userName", args.userName).eq("conversationId", args.conversationId)
//       )
//       .unique();

//     if (existing) {
//       await ctx.db.patch(existing._id, { expiresAt });
//     } else {
//       await ctx.db.insert("typingIndicators", {
//         conversationId: args.conversationId,
//         userName: args.userName,
//         expiresAt,
//       });
//     }
//   },
// });

// // Stop typing (clear immediately)
// export const stopTyping = mutation({
//   args: {
//     conversationId: v.id("conversations"),
//     userName: v.string(),
//   },
//   handler: async (ctx, args) => {
//     const existing = await ctx.db
//       .query("typingIndicators")
//       .withIndex("by_user_conversation", (q) =>
//         q.eq("userName", args.userName).eq("conversationId", args.conversationId)
//       )
//       .unique();

//     if (existing) {
//       await ctx.db.delete(existing._id);
//     }
//   },
// });

// // Get list of users currently typing (excluding current user)
// export const getTypingUsers = query({
//   args: {
//     conversationId: v.id("conversations"),
//     currentUserName: v.string(),
//   },
//   handler: async (ctx, args) => {
//     const now = Date.now();

//     const indicators = await ctx.db
//       .query("typingIndicators")
//       .withIndex("by_conversation", (q) =>
//         q.eq("conversationId", args.conversationId)
//       )
//       .collect();

//     const activeNames = indicators
//       .filter(
//         (ind) =>
//           ind.expiresAt > now && ind.userName !== args.currentUserName
//       )
//       .map((ind) => ind.userName);

//     const typers = await Promise.all(
//       activeNames.map((name) =>
//         ctx.db
//           .query("users")
//           .withIndex("by_name", (q) => q.eq("name", name))
//           .unique()
//       )
//     );

//     return typers
//       .filter(Boolean)
//       .map((u) => ({ name: u!.name, displayName: u!.displayName }));
//   },
// });

// // Internal cron: remove expired indicators
// export const cleanupExpired = internalMutation({
//   args: {},
//   handler: async (ctx) => {
//     const now = Date.now();
//     const expired = await ctx.db
//       .query("typingIndicators")
//       .withIndex("by_expires", (q) => q.lt("expiresAt", now))
//       .collect();

//     for (const ind of expired) {
//       await ctx.db.delete(ind._id);
//     }
//   },
// });
"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface Props {
  userId: string;
  small?: boolean;
}

export default function OnlineIndicator({ userId, small = false }: Props) {
  const presence = useQuery(api.presence.getPresence, { userIds: [userId] });
  const isOnline = presence?.[userId]?.isOnline ?? false;

  if (!isOnline) return null;

  return (
    <span
      className={`absolute bottom-0 right-0 block rounded-full bg-[#00a884] ring-2 ring-[#111b21] ${
        small ? "w-3 h-3" : "w-3.5 h-3.5"
      }`}
    />
  );
}