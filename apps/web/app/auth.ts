import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { comparePassword } from "@monkeyprint/utils/hash";
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
        const user = await db.user.findUnique({
          where: {
            email: credentials.email as string,
          },
        });

        if (!user) {
          // No user found, so this is their first attempt to login
          // Optionally, this is also the place you could do a user registration
          throw new Error("Invalid email.");
        }

        //const isSamePassword = comparePassword(credentials.password as string, user.password)
        const isSamePassword = credentials.password === user.password;
        if (!isSamePassword) {
          throw new Error("Invalid password.");
        }
        console.log(user);

        // return user object with their profile data
        return user;
      },
    }),
  ],
});
