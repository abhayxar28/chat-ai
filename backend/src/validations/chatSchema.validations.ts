import { z } from "zod"


export const chatInputSchema = z.object({
    title: z.string().min(1, "Title must be at least 2 characters")
})

export const chatEditSchema = z.object({
    title: z.string().min(1, "Title must be at least 2 characters")
})