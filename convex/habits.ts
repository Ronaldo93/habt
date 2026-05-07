import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("habits").collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    isGood: v.boolean(),
    amountDone: v.number(),
    target: v.optional(v.number()),
    notes: v.optional(v.string()),
    duration: v.number(),
    status: v.string(),
    unit: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("habits", {
      name: args.name,
      isGood: args.isGood,
      amountDone: args.amountDone,
      target: args.target,
      notes: args.notes,
      duration: args.duration,
      status: args.status,
      unit: args.unit,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("habits"),
    name: v.optional(v.string()),
    isGood: v.optional(v.boolean()),
    amountDone: v.optional(v.number()),
    target: v.optional(v.number()),
    notes: v.optional(v.string()),
    duration: v.optional(v.number()),
    status: v.optional(v.string()),
    unit: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("habits") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
