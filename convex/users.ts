// import { v } from "convex/values";
// import { mutation, query } from "./_generated/server";

// // Register user with duplicate handling
// export const register = mutation({
//   args: { name: v.string() },
//   handler: async (ctx, args) => {
//     // Trim and validate
//     const trimmedName = args.name.trim();
//     if (!trimmedName) {
//       throw new Error("Name is required");
//     }

//     // Store display name (original case)
//     const displayName = trimmedName;
    
//     // Convert to lowercase for uniqueness check
//     const lowerName = trimmedName.toLowerCase();

//     // Get all existing users
//     const allUsers = await ctx.db.query("users").collect();
    
//     // Check if name exists (case-insensitive)
//     const existingUser = allUsers.find(
//       (user) => user.name === lowerName
//     );

//     if (!existingUser) {
//       // Name is unique - create user
//       const userId = await ctx.db.insert("users", {
//         name: lowerName,
//         displayName: displayName,
//         isOnline: true,
//         lastSeen: Date.now(),
//         createdAt: Date.now(),
//       });
//       return { success: true, name: lowerName, userId };
//     }

//     // Name exists - find unique name with counter
//     let counter = 1;
//     let uniqueName = `${lowerName}${counter}`;
    
//     while (allUsers.some((user) => user.name === uniqueName)) {
//       counter++;
//       uniqueName = `${lowerName}${counter}`;
//     }

//     // Create user with unique name
//     const userId = await ctx.db.insert("users", {
//       name: uniqueName,
//       displayName: `${displayName}${counter}`,
//       isOnline: true,
//       lastSeen: Date.now(),
//       createdAt: Date.now(),
//     });

//     return { 
//       success: true, 
//       name: uniqueName, 
//       displayName: `${displayName}${counter}`,
//       userId,
//       wasRenamed: true,
//       originalName: lowerName,
//     };
//   },
// });

// // Get all users ordered A-Z (excluding current user)
// export const getAllUsers = query({
//   args: { currentUserName: v.string() },
//   handler: async (ctx, args) => {
//     const users = await ctx.db.query("users").collect();
    
//     // Filter out current user and sort by display name
//     return users
//       .filter((user) => user.name !== args.currentUserName)
//       .sort((a, b) => a.displayName.localeCompare(b.displayName));
//   },
// });

// // Search users by name
// export const searchUsers = query({
//   args: { 
//     currentUserName: v.string(),
//     searchQuery: v.string() 
//   },
//   handler: async (ctx, args) => {
//     const users = await ctx.db.query("users").collect();
    
//     return users
//       .filter(
//         (user) =>
//           user.name !== args.currentUserName &&
//           user.displayName.toLowerCase().includes(args.searchQuery.toLowerCase())
//       )
//       .sort((a, b) => a.displayName.localeCompare(b.displayName));
//   },
// });

// // Get user by name
// export const getUserByName = query({
//   args: { name: v.string() },
//   handler: async (ctx, args) => {
//     return await ctx.db
//       .query("users")
//       .withIndex("by_name", (q) => q.eq("name", args.name))
//       .unique();
//   },
// });

// // Set user online status
// export const setOnlineStatus = mutation({
//   args: { 
//     userName: v.string(),
//     isOnline: v.boolean() 
//   },
//   handler: async (ctx, args) => {
//     const user = await ctx.db
//       .query("users")
//       .withIndex("by_name", (q) => q.eq("name", args.userName))
//       .unique();

//     if (!user) return;

//     await ctx.db.patch(user._id, {
//       isOnline: args.isOnline,
//       lastSeen: Date.now(),
//     });
//   },
// });

// // Add friend (manual creation)
// export const addFriend = mutation({
//   args: { 
//     currentUserName: v.string(),
//     friendName: v.string() 
//   },
//   handler: async (ctx, args) => {
//     // Use same registration logic for friend
//     const trimmedName = args.friendName.trim();
//     if (!trimmedName) {
//       throw new Error("Friend name is required");
//     }

//     const displayName = trimmedName;
//     const lowerName = trimmedName.toLowerCase();

//     // Get all existing users
//     const allUsers = await ctx.db.query("users").collect();
    
//     // Check if name exists
//     const existingUser = allUsers.find(
//       (user) => user.name === lowerName
//     );

//     if (!existingUser) {
//       // Create friend
//       const userId = await ctx.db.insert("users", {
//         name: lowerName,
//         displayName: displayName,
//         isOnline: false,
//         lastSeen: Date.now(),
//         createdAt: Date.now(),
//       });
//       return { success: true, name: lowerName, userId };
//     }

//     // Name exists - find unique name
//     let counter = 1;
//     let uniqueName = `${lowerName}${counter}`;
    
//     while (allUsers.some((user) => user.name === uniqueName)) {
//       counter++;
//       uniqueName = `${lowerName}${counter}`;
//     }

//     const userId = await ctx.db.insert("users", {
//       name: uniqueName,
//       displayName: `${displayName}${counter}`,
//       isOnline: false,
//       lastSeen: Date.now(),
//       createdAt: Date.now(),
//     });

//     return { 
//       success: true, 
//       name: uniqueName,
//       displayName: `${displayName}${counter}`,
//       userId,
//       wasRenamed: true,
//     };
//   },
// });
import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";

export const upsertUser = mutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
    email: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
	    const existing = await ctx.db
	      .query("users")
	      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
	      .first();
	
    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name,
        ...(args.email !== undefined ? { email: args.email } : {}),
        imageUrl: args.imageUrl,
        ...(existing.createdAt == null ? { createdAt: Date.now() } : {}),
        ...(existing.lastSeen == null ? { lastSeen: Date.now() } : {}),
        ...(existing.isOnline == null ? { isOnline: false } : {}),
      });
      return existing._id;
    }

    return await ctx.db.insert("users", {
      clerkId: args.clerkId,
      name: args.name,
      ...(args.email !== undefined ? { email: args.email } : {}),
      imageUrl: args.imageUrl,
      createdAt: Date.now(),
      isOnline: false,
      lastSeen: Date.now(),
    });
  },
});

// Used by Convex HTTP actions (e.g. Clerk webhooks) to keep user records in sync.
export const store = internalMutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
    email: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name,
        ...(args.email !== undefined ? { email: args.email } : {}),
        imageUrl: args.imageUrl,
        ...(existing.createdAt == null ? { createdAt: Date.now() } : {}),
        ...(existing.lastSeen == null ? { lastSeen: Date.now() } : {}),
        ...(existing.isOnline == null ? { isOnline: false } : {}),
      });
      return existing._id;
    }

    return await ctx.db.insert("users", {
      clerkId: args.clerkId,
      name: args.name,
      ...(args.email !== undefined ? { email: args.email } : {}),
      imageUrl: args.imageUrl,
      createdAt: Date.now(),
      isOnline: false,
      lastSeen: Date.now(),
    });
  },
});

export const getAllUsers = query({
  args: { currentClerkId: v.string() },
  handler: async (ctx, args) => {
    const users = await ctx.db.query("users").collect();
    return users
      .filter((u) => u.clerkId !== args.currentClerkId)
      .sort((a, b) => a.name.localeCompare(b.name));
  },
});

export const searchUsers = query({
  args: { query: v.string(), currentClerkId: v.string() },
  handler: async (ctx, args) => {
    const users = await ctx.db.query("users").collect();
    const q = args.query.toLowerCase();
    return users.filter(
      (u) =>
        u.clerkId !== args.currentClerkId &&
        u.name.toLowerCase().includes(q)
    );
  },
});

export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();
  },
});

export const getUsersByClerkIds = query({
  args: { clerkIds: v.array(v.string()) },
  handler: async (ctx, args) => {
    const users = await ctx.db.query("users").collect();
    return users.filter((u) => args.clerkIds.includes(u.clerkId));
  },
});
