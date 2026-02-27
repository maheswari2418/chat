// import { v } from "convex/values";
// import { mutation, query } from "./_generated/server";

// // Get or create conversation between two users
// export const getOrCreateConversation = mutation({
//   args: {
//     currentUserName: v.string(),
//     otherUserName: v.string(),
//   },
//   handler: async (ctx, args) => {
//     // Sort participants for consistent lookup
//     const participants = [args.currentUserName, args.otherUserName].sort();

//     // Check if conversation exists
//     const allConversations = await ctx.db.query("conversations").collect();
    
//     const existing = allConversations.find((conv) => {
//       if (conv.type !== "direct") return false;
//       const sortedParticipants = [...conv.participants].sort();
//       return (
//         sortedParticipants.length === 2 &&
//         sortedParticipants[0] === participants[0] &&
//         sortedParticipants[1] === participants[1]
//       );
//     });

//     if (existing) {
//       return existing._id;
//     }

//     // Create new conversation
//     return await ctx.db.insert("conversations", {
//       participants,
//       type: "direct",
//       lastMessageAt: Date.now(),
//     });
//   },
// });

// // Get all conversations for user (sorted by last message)
// export const getMyConversations = query({
//   args: { userName: v.string() },
//   handler: async (ctx, args) => {
//     const allConversations = await ctx.db.query("conversations").collect();

//     // Filter conversations where user is participant
//     const myConversations = allConversations.filter((conv) =>
//       conv.participants.includes(args.userName)
//     );

//     // Sort by last message time
//     myConversations.sort((a, b) => b.lastMessageAt - a.lastMessageAt);

//     // Enrich with participant details
//     const enrichedConversations = await Promise.all(
//       myConversations.map(async (conv) => {
//         // Get other participant(s)
//         const otherParticipantNames = conv.participants.filter(
//           (name) => name !== args.userName
//         );

//         const otherUsers = await Promise.all(
//           otherParticipantNames.map(async (name) => {
//             return await ctx.db
//               .query("users")
//               .withIndex("by_name", (q) => q.eq("name", name))
//               .unique();
//           })
//         );

//         // Get last message
//         const messages = await ctx.db
//           .query("messages")
//           .withIndex("by_conversation", (q) => q.eq("conversationId", conv._id))
//           .order("desc")
//           .take(1);

//         const lastMessage = messages[0];

//         // Get unread count
//         const unreadCount = await ctx.db
//           .query("unreadCounts")
//           .withIndex("by_user_conversation", (q) =>
//             q.eq("userName", args.userName).eq("conversationId", conv._id)
//           )
//           .unique();

//         return {
//           ...conv,
//           otherUsers: otherUsers.filter(Boolean),
//           lastMessage,
//           unreadCount: unreadCount?.count || 0,
//         };
//       })
//     );

//     return enrichedConversations;
//   },
// });

// // Get conversation by ID
// export const getConversationById = query({
//   args: { 
//     conversationId: v.id("conversations"),
//     userName: v.string(),
//   },
//   handler: async (ctx, args) => {
//     const conversation = await ctx.db.get(args.conversationId);
//     if (!conversation) return null;

//     // Check if user is participant
//     if (!conversation.participants.includes(args.userName)) {
//       return null;
//     }

//     // Get other participants
//     const otherParticipantNames = conversation.participants.filter(
//       (name) => name !== args.userName
//     );

//     const otherUsers = await Promise.all(
//       otherParticipantNames.map(async (name) => {
//         return await ctx.db
//           .query("users")
//           .withIndex("by_name", (q) => q.eq("name", name))
//           .unique();
//       })
//     );

//     return {
//       ...conversation,
//       otherUsers: otherUsers.filter(Boolean),
//     };
//   },
// });
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getOrCreateConversation = mutation({
  args: {
    currentUserId: v.string(),
    otherUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const all = await ctx.db.query("conversations").collect();
    const existing = all.find(
      (c) =>
        !c.isGroup &&
        c.participants.includes(args.currentUserId) &&
        c.participants.includes(args.otherUserId) &&
        c.participants.length === 2
    );
    if (existing) return existing._id;

    return await ctx.db.insert("conversations", {
      participants: [args.currentUserId, args.otherUserId],
      isGroup: false,
      createdAt: Date.now(),
    });
  },
});

export const createGroupConversation = mutation({
  args: {
    currentUserId: v.string(),
    memberIds: v.array(v.string()),
    groupName: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("conversations", {
      participants: [args.currentUserId, ...args.memberIds],
      isGroup: true,
      groupName: args.groupName,
      createdBy: args.currentUserId,
      createdAt: Date.now(),
    });
  },
});

export const getUserConversations = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const all = await ctx.db.query("conversations").collect();
    const mine = all.filter((c) => c.participants.includes(args.userId));

    const enriched = await Promise.all(
      mine.map(async (convo) => {
        const lastMessage = await ctx.db
          .query("messages")
          .withIndex("by_conversationId", (q) => q.eq("conversationId", convo._id))
          .order("desc")
          .first();

        const otherIds = convo.participants.filter((p) => p !== args.userId);
        const otherUsers = await Promise.all(
          otherIds.map((id) =>
            ctx.db
              .query("users")
              .withIndex("by_clerkId", (q) => q.eq("clerkId", id))
              .first()
          )
        );

        const readReceipt = await ctx.db
          .query("readReceipts")
          .withIndex("by_conversation_user", (q) =>
            q.eq("conversationId", convo._id).eq("userId", args.userId)
          )
          .first();

        const lastReadTime = readReceipt?.lastReadTime ?? 0;
        const allMsgs = await ctx.db
          .query("messages")
          .withIndex("by_conversationId", (q) => q.eq("conversationId", convo._id))
          .collect();
        const unreadCount = allMsgs.filter(
          (m) => m.senderId !== args.userId && m.createdAt > lastReadTime
        ).length;

        return {
          ...convo,
          lastMessage,
          otherUsers: otherUsers.filter(Boolean),
          unreadCount,
        };
      })
    );

    return enriched.sort(
      (a, b) =>
        (b.lastMessage?.createdAt ?? b.createdAt) -
        (a.lastMessage?.createdAt ?? a.createdAt)
    );
  },
});

export const getConversation = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.conversationId);
  },
});