import { z } from "zod"

export const registerUserSchema = z.object({
  fullName: z.object({
    firstName: z.string().min(2, "firstName must be at least 2 characters"),
    lastName: z.string().min(2, "lastName must be at least 2 characters"),
  }),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters")
})

export const loginUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters")
})