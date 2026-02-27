import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Delete all users with old schema
export const deleteOldUsers = mutation({
  args: {},
  handler: async (ctx) => {
    const allUsers = await ctx.db.query("users").collect();
    
    let deleted = 0;
    for (const user of allUsers) {
      // Check if it has old field names
      if ('image' in user || 'online' in user || !('imageUrl' in user) || !('isOnline' in user)) {
        await ctx.db.delete(user._id);
        deleted++;
        console.log(`Deleted old user: ${user._id}`);
      }
    }
    
    return { deleted, message: `Deleted ${deleted} old user records` };
  },
});

// Fix users with old field names
export const fixOldUsers = mutation({
  args: {},
  handler: async (ctx) => {
    const allUsers = await ctx.db.query("users").collect();
    
    let fixed = 0;
    for (const user of allUsers as any[]) {
      const updates: any = {};
      
      // Map old field names to new ones
      if (user.image && !user.imageUrl) {
        updates.imageUrl = user.image;
      }
      
      if (user.online !== undefined && user.isOnline === undefined) {
        updates.isOnline = user.online;
      }
      
      if (!user.email) {
        updates.email = "";
      }

      if (user.createdAt === undefined) {
        updates.createdAt = Date.now();
      }

      if (user.isOnline === undefined) {
        updates.isOnline = false;
      }

      if (user.lastSeen === undefined) {
        updates.lastSeen = Date.now();
      }
      
      // If we have updates, patch the record
      if (Object.keys(updates).length > 0) {
        await ctx.db.patch(user._id, updates);
        fixed++;
        console.log(`Fixed user: ${user._id}`, updates);
      }
    }
    
    return { fixed, message: `Fixed ${fixed} user records` };
  },
});

// Nuclear option: Delete ALL users
export const deleteAllUsers = mutation({
  args: {},
  handler: async (ctx) => {
    const allUsers = await ctx.db.query("users").collect();
    
    for (const user of allUsers) {
      await ctx.db.delete(user._id);
    }
    
    return { deleted: allUsers.length, message: `Deleted all ${allUsers.length} users` };
  },
});
