// import { defineSchema, defineTable } from "convex/server";
// import { v } from "convex/values";

// export default defineSchema({
//   users: defineTable({
//     name: v.string(), // Unique name (case-insensitive)
//     displayName: v.string(), // Original case for display
//     isOnline: v.boolean(),
//     lastSeen: v.number(),
//     createdAt: v.number(),
//   })
//     .index("by_name", ["name"]) // For uniqueness check
//     .index("by_display_name", ["displayName"]), // For A-Z sorting

//   conversations: defineTable({
//     participants: v.array(v.string()), // Array of user names
//     type: v.union(v.literal("direct"), v.literal("group")),
//     lastMessageAt: v.number(),
//     groupName: v.optional(v.string()),
//   }).index("by_last_message", ["lastMessageAt"]),

//   messages: defineTable({
//     conversationId: v.id("conversations"),
//     senderName: v.string(), // User name
//     content: v.string(),
//     createdAt: v.number(),
//     isDeleted: v.boolean(),
//     reactions: v.array(
//       v.object({
//         userName: v.string(),
//         emoji: v.string(),
//       })
//     ),
//   })
//     .index("by_conversation", ["conversationId"])
//     .index("by_conversation_created", ["conversationId", "createdAt"]),

//   typingIndicators: defineTable({
//     conversationId: v.id("conversations"),
//     userName: v.string(),
//     expiresAt: v.number(),
//   })
//     .index("by_conversation", ["conversationId"])
//     .index("by_user_conversation", ["userName", "conversationId"])
//     .index("by_expires", ["expiresAt"]),

//   unreadCounts: defineTable({
//     userName: v.string(),
//     conversationId: v.id("conversations"),
//     count: v.number(),
//     lastReadAt: v.number(),
//   })
//     .index("by_user", ["userName"])
//     .index("by_conversation", ["conversationId"])
//     .index("by_user_conversation", ["userName", "conversationId"]),
// });
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
 users: defineTable({
	  clerkId: v.string(),
	  name: v.string(),
	  // Optional for legacy docs created before email was stored.
	  email: v.optional(v.string()),
	  imageUrl: v.optional(v.string()),
	  // Optional for legacy docs created before createdAt was stored.
	  createdAt: v.optional(v.float64()),
	  // Optional for legacy docs from older auth/online-status implementations.
	  isOnline: v.optional(v.boolean()),
	  lastSeen: v.optional(v.float64()),
	})
	.index("by_clerkId", ["clerkId"])
	.index("by_name", ["name"]),

  conversations: defineTable({
    participants: v.array(v.string()),
    isGroup: v.boolean(),
    groupName: v.optional(v.string()),
    createdBy: v.optional(v.string()),
    lastMessageTime: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_lastMessageTime", ["lastMessageTime"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.string(),
    text: v.string(),
    replyToMessageId: v.optional(v.id("messages")),
    isDeleted: v.boolean(),
    reactions: v.optional(
      v.array(v.object({ emoji: v.string(), userId: v.string() }))
    ),
    createdAt: v.number(),
  })
    .index("by_conversation", ["conversationId", "createdAt"])
    .index("by_conversationId", ["conversationId"]),

  readReceipts: defineTable({
    conversationId: v.id("conversations"),
    userId: v.string(),
    lastReadTime: v.number(),
  })
    .index("by_conversation_user", ["conversationId", "userId"])
    .index("by_userId", ["userId"]),

  typingIndicators: defineTable({
    conversationId: v.id("conversations"),
    userId: v.string(),
    updatedAt: v.number(),
  })
    .index("by_conversation", ["conversationId"])
    .index("by_conversation_user", ["conversationId", "userId"]),

  presence: defineTable({
    userId: v.string(),
    lastSeen: v.number(),
    isOnline: v.boolean(),
  }).index("by_userId", ["userId"]),
});
