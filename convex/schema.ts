import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  habits: defineTable({
    isGood: v.boolean(),
    amountDone: v.number(),
    target: v.optional(v.number()),
    notes: v.optional(v.string()),
    duration: v.number(),
    // todo: this will be changed later to enum
    status: v.string(),
  }),
})
