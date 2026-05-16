import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const habits = await ctx.db.query("habits").collect();
    const today = new Date().toLocaleDateString('en-CA'); // e.g. "2024-05-10"
    
    return await Promise.all(habits.map(async (habit) => {
      const entry = await ctx.db
        .query("habitEntries")
        .withIndex("by_habit_and_date", (q) => q.eq("habitId", habit._id).eq("date", today))
        .unique();
        
      return {
        ...habit,
        amountDone: entry?.amountDone ?? 0,
      };
    }));
  },
});

// get one
// export const getOneByHabitId = query({
//   args: {
//     id: v.id("habits")
//   },
//   handler: async (ctx, args) => {
//     const habit = await ctx.db.get(args.id);
//     if (!habit) return null;
//     return habit;
//   }
// })

export const create = mutation({
  args: {
    name: v.string(),
    isGood: v.boolean(),
    target: v.optional(v.number()),
    notes: v.optional(v.string()),
    duration: v.number(),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    status: v.string(),
    unit: v.string(),
    initialAmount: v.number(),
  },
  handler: async (ctx, args) => {
    const habitId = await ctx.db.insert("habits", {
      name: args.name,
      isGood: args.isGood,
      target: args.target,
      notes: args.notes,
      duration: args.duration,
      startDate: args.startDate,
      endDate: args.endDate,
      status: args.status,
      unit: args.unit,
      initialAmount: args.initialAmount,
    });

    // we don't need to create an entry for the initial amount since we can't assume that user had done it in the beginning. they should log it manually.
    // if (args.initialAmount > 0) {
    //   const today = new Date().toLocaleDateString('en-CA');
    //   await ctx.db.insert("habitEntries", {
    //     habitId,
    //     date: today,
    //     amountDone: args.initialAmount,
    //   });
    // }

    return habitId;
  },
});

export const update = mutation({
  args: {
    id: v.id("habits"),
    name: v.optional(v.string()),
    isGood: v.optional(v.boolean()),
    target: v.optional(v.number()),
    notes: v.optional(v.string()),
    duration: v.optional(v.number()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
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

export const logActivity = mutation({
  args: {
    habitId: v.id("habits"),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    // Get today's date in YYYY-MM-DD format based on system time
    const today = new Date().toLocaleDateString('en-CA'); // e.g. "2024-05-10"

    const existingEntry = await ctx.db
      .query("habitEntries")
      .withIndex("by_habit_and_date", (q) =>
        q.eq("habitId", args.habitId).eq("date", today)
      )
      .unique();

    if (existingEntry) {
      await ctx.db.patch(existingEntry._id, {
        amountDone: existingEntry.amountDone + args.amount,
      });
    } else {
      await ctx.db.insert("habitEntries", {
        habitId: args.habitId,
        date: today,
        amountDone: args.amount,
      });
    }
  },
});

export const getEntries = query({
  args: {
    habitId: v.id("habits"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("habitEntries")
      .withIndex("by_habit_and_date", (q) => q.eq("habitId", args.habitId))
      .collect();
  },
});

export const getTodayEntries = query({
  args: {
    habitId: v.id("habits"),
  },
  handler: async (ctx, args) => {
    const today = new Date().toLocaleDateString('en-CA');
    return await ctx.db
      .query("habitEntries")
      .withIndex("by_habit_and_date", (q) =>
        q.eq("habitId", args.habitId).eq("date", today)
      )
      .collect();
  },
});
