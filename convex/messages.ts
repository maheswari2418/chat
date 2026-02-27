// import { v } from "convex/values";
// import { mutation, query } from "./_generated/server";

// // Send message
// export const send = mutation({
//   args: {
//     conversationId: v.id("conversations"),
//     senderName: v.string(),
//     content: v.string(),
//   },
//   handler: async (ctx, args) => {
//     const conversation = await ctx.db.get(args.conversationId);
//     if (!conversation) throw new Error("Conversation not found");

//     if (!conversation.participants.includes(args.senderName)) {
//       throw new Error("Not authorized");
//     }

//     // Insert message
//     const messageId = await ctx.db.insert("messages", {
//       conversationId: args.conversationId,
//       senderName: args.senderName,
//       content: args.content,
//       createdAt: Date.now(),
//       isDeleted: false,
//       reactions: [],
//     });

//     // Update conversation's last message time
//     await ctx.db.patch(args.conversationId, {
//       lastMessageAt: Date.now(),
//     });

//     // Increment unread count for other participants
//     const otherParticipants = conversation.participants.filter(
//       (name) => name !== args.senderName
//     );

//     for (const participantName of otherParticipants) {
//       const existingUnread = await ctx.db
//         .query("unreadCounts")
//         .withIndex("by_user_conversation", (q) =>
//           q.eq("userName", participantName).eq("conversationId", args.conversationId)
//         )
//         .unique();

//       if (existingUnread) {
//         await ctx.db.patch(existingUnread._id, {
//           count: existingUnread.count + 1,
//         });
//       } else {
//         await ctx.db.insert("unreadCounts", {
//           userName: participantName,
//           conversationId: args.conversationId,
//           count: 1,
//           lastReadAt: Date.now(),
//         });
//       }
//     }

//     return messageId;
//   },
// });

// // Get messages for conversation
// export const list = query({
//   args: { 
//     conversationId: v.id("conversations"),
//     userName: v.string(),
//   },
//   handler: async (ctx, args) => {
//     const conversation = await ctx.db.get(args.conversationId);
//     if (!conversation || !conversation.participants.includes(args.userName)) {
//       return [];
//     }

//     const messages = await ctx.db
//       .query("messages")
//       .withIndex("by_conversation_created", (q) =>
//         q.eq("conversationId", args.conversationId)
//       )
//       .order("asc")
//       .collect();

//     // Enrich with sender details
//     const enrichedMessages = await Promise.all(
//       messages.map(async (message) => {
//         const sender = await ctx.db
//           .query("users")
//           .withIndex("by_name", (q) => q.eq("name", message.senderName))
//           .unique();

//         return {
//           ...message,
//           sender,
//         };
//       })
//     );

//     return enrichedMessages;
//   },
// });

// // Delete message
// export const deleteMessage = mutation({
//   args: { 
//     messageId: v.id("messages"),
//     userName: v.string(),
//   },
//   handler: async (ctx, args) => {
//     const message = await ctx.db.get(args.messageId);
//     if (!message) throw new Error("Message not found");

//     if (message.senderName !== args.userName) {
//       throw new Error("Not authorized");
//     }

//     await ctx.db.patch(args.messageId, {
//       isDeleted: true,
//     });
//   },
// });

// // Add reaction
// export const addReaction = mutation({
//   args: {
//     messageId: v.id("messages"),
//     userName: v.string(),
//     emoji: v.string(),
//   },
//   handler: async (ctx, args) => {
//     const message = await ctx.db.get(args.messageId);
//     if (!message) throw new Error("Message not found");

//     const existingReaction = message.reactions.find(
//       (r) => r.userName === args.userName && r.emoji === args.emoji
//     );

//     if (existingReaction) {
//       // Remove reaction
//       await ctx.db.patch(args.messageId, {
//         reactions: message.reactions.filter(
//           (r) => !(r.userName === args.userName && r.emoji === args.emoji)
//         ),
//       });
//     } else {
//       // Add reaction
//       await ctx.db.patch(args.messageId, {
//         reactions: [
//           ...message.reactions,
//           { userName: args.userName, emoji: args.emoji },
//         ],
//       });
//     }
//   },
// });
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const sendMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    senderId: v.string(),
    text: v.string(),
    replyToMessageId: v.optional(v.id("messages")),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: args.senderId,
      text: args.text,
      replyToMessageId: args.replyToMessageId,
      isDeleted: false,
      reactions: [],
      createdAt: Date.now(),
    });
    await ctx.db.patch(args.conversationId, { lastMessageTime: Date.now() });
    return messageId;
  },
});

export const getMessages = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .order("asc")
      .collect();
  },
});

export const deleteMessage = mutation({
  args: {
    messageId: v.id("messages"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Message not found");
    if (message.senderId !== args.userId) throw new Error("Unauthorized");
    await ctx.db.patch(args.messageId, { isDeleted: true });
  },
});

export const toggleReaction = mutation({
  args: {
    messageId: v.id("messages"),
    userId: v.string(),
    emoji: v.string(),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Message not found");

    const reactions = [...(message.reactions ?? [])];
    const idx = reactions.findIndex(
      (r) => r.emoji === args.emoji && r.userId === args.userId
    );
    if (idx >= 0) {
      reactions.splice(idx, 1);
    } else {
      reactions.push({ emoji: args.emoji, userId: args.userId });
    }
    await ctx.db.patch(args.messageId, { reactions });
  },
});
