import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { ZodError } from "zod";
import { comparePassword } from "@monkeyprint/utils/hash";
import { signInSchema } from "@monkeyprint/utils/zod";
import { db } from "@monkeyprint/db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        let user = null;
        try {
          const { email, password } =
            await signInSchema.parseAsync(credentials);

          user = await db.user.findUnique({
            where: {
              email: credentials.email as string,
            },
          });

          if (!user) {
            // No user found, so this is their first attempt to login
            // Optionally, this is also the place you could do a user registration
            throw new Error("No existing user with this email.");
          }

          const isSamePassword = await comparePassword(
            credentials.password as string,
            user.password,
          );

          if (!isSamePassword) {
            throw new Error("Invalid password.");
          }

          // return user object with their profile data
          return user;
        } catch (error) {
          if (error instanceof ZodError) {
            // Return `null` to indicate that the credentials are invalid
            return null;
          }
        }
        return null;
      },
    }),
  ],
});
