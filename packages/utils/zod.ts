// packages/utils/zod.ts
import * as z from "zod";

export const RoleEnum = z.enum(["SUPER_ADMIN", "ADMIN"]);

// Define a schema for input validation
export const registerSchema = z.object({
  name: z.string().min(1, "Username is required").max(100),
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must have more than 8 characters"),
  role: RoleEnum,
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phoneNumber: z.string().optional(),
  image: z.string().optional(),
});

import { object, string } from "zod";

export const signInSchema = object({
  email: string({ required_error: "Email is required" })
    .min(1, "Email is required")
    .email("Invalid email"),
  password: string({ required_error: "Password is required" })
    .min(1, "Password is required")
    .min(8, "Password must be more than 8 characters"),
});

export const productUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().optional(),
  price: z.number().positive("Price must be a positive number"),
  imageUrl: z.string().min(1, "Image URL is required"),
  stock: z.number().int().nonnegative().optional(),
});
