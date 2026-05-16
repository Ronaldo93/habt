import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  habits: defineTable({
    name: v.string(),
    isGood: v.boolean(),
    amountDone: v.optional(v.number()), // Kept as optional for backwards compatibility
    target: v.optional(v.number()),
    notes: v.optional(v.string()),
    duration: v.number(),
    // todo: this will be changed later to enum

    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    status: v.string(),
    unit: v.string(),
    initialAmount: v.optional(v.number()),
  }),
  habitEntries: defineTable({
    habitId: v.id("habits"),
    date: v.string(),
    amountDone: v.number(),
  }).index("by_habit_and_date", ["habitId", "date"]),
})
