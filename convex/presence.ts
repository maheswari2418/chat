import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const updatePresence = mutation({
  args: { userId: v.string(), isOnline: v.boolean() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("presence")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { isOnline: args.isOnline, lastSeen: Date.now() });
    } else {
      await ctx.db.insert("presence", {
        userId: args.userId,
        isOnline: args.isOnline,
        lastSeen: Date.now(),
      });
    }
  },
});

export const getPresence = query({
  args: { userIds: v.array(v.string()) },
  handler: async (ctx, args) => {
    const all = await ctx.db.query("presence").collect();
    const map: Record<string, { isOnline: boolean; lastSeen: number }> = {};
    for (const p of all) {
      if (args.userIds.includes(p.userId)) {
        // Stale after 30 seconds
        const isOnline = p.isOnline && Date.now() - p.lastSeen < 30000;
        map[p.userId] = { isOnline, lastSeen: p.lastSeen };
      }
    }
    return map;
  },
});

export const setTyping = mutation({
  args: {
    conversationId: v.id("conversations"),
    userId: v.string(),
    isTyping: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("typingIndicators")
      .withIndex("by_conversation_user", (q) =>
        q.eq("conversationId", args.conversationId).eq("userId", args.userId)
      )
      .first();

    if (args.isTyping) {
      if (existing) {
        await ctx.db.patch(existing._id, { updatedAt: Date.now() });
      } else {
        await ctx.db.insert("typingIndicators", {
          conversationId: args.conversationId,
          userId: args.userId,
          updatedAt: Date.now(),
        });
      }
    } else if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});

export const getTypingUsers = query({
  args: {
    conversationId: v.id("conversations"),
    currentUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const records = await ctx.db
      .query("typingIndicators")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .collect();

    // Only active (< 3s) and not current user
    const active = records.filter(
      (t) => t.userId !== args.currentUserId && Date.now() - t.updatedAt < 3000
    );

    const users = await Promise.all(
      active.map((t) =>
        ctx.db
          .query("users")
          .withIndex("by_clerkId", (q) => q.eq("clerkId", t.userId))
          .first()
      )
    );
    return users.filter(Boolean);
  },
});

export const markAsRead = mutation({
  args: {
    conversationId: v.id("conversations"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("readReceipts")
      .withIndex("by_conversation_user", (q) =>
        q.eq("conversationId", args.conversationId).eq("userId", args.userId)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { lastReadTime: Date.now() });
    } else {
      await ctx.db.insert("readReceipts", {
        conversationId: args.conversationId,
        userId: args.userId,
        lastReadTime: Date.now(),
      });
    }
  },
});