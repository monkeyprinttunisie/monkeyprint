// packages/utils/zod.ts
import * as z from "zod";

export const RoleEnum = z.enum([
  "DROPSHIPPING",
  "ECOMMERCE_WEBSITE", 
  "DESIGNER_TOOL"
]);

// Define a schema for input validation
export const registerSchema = z.object({
  username: z.string().min(1, "Username is required").max(100),
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must have more than 8 characters"),
  role: RoleEnum
});
