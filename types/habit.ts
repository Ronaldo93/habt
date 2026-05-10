import z from "zod";

export const habitSchema = z.object({
    name: z.string(),
    isGood: z.boolean(),
    target: z.optional(z.number()),
    notes: z.optional(z.string()),
    duration: z.number(),
    status: z.string(),
    unit: z.string(),
})
