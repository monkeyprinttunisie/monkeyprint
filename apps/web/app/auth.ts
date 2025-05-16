import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { ZodError } from "zod";
import { comparePassword } from "@monkeyprint/utils/hash";
import { signInSchema } from "@monkeyprint/utils/zod";
import { db } from "@monkeyprint/db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [
    Google,
    Facebook,
    Credentials({
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        let user = null;
        try {
          const { email, password } =
            await signInSchema.parseAsync(credentials);

          user = await db.user.findUnique({
            where: { email },
          });

          if (!user) {
            throw new Error("No existing user with this email.");
          }
          if (!user.password) {
            throw new Error("Please log in using an OAuth provider.");
          }
          const isSamePassword = await comparePassword(password, user.password);

          if (!isSamePassword) {
            throw new Error("Invalid password.");
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          };
        } catch (error) {
          if (error instanceof ZodError) {
            return null;
          }
        }
        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (!account) return true; // Handle credentials sign-in normally

      const existingUser = await db.user.findUnique({
        where: { email: user.email! },
        include: { accounts: true },
      });

      if (existingUser) {
        // Check if the account already exists
        const linkedAccount = existingUser.accounts.find(
          (acc) => acc.provider === account.provider
        );

        if (!linkedAccount) {
          // ✅ Link new OAuth provider to the existing user
          await db.account.create({
            data: {
              userId: existingUser.id,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              type: account.type,
              access_token: account.access_token,
              refresh_token: account.refresh_token,
              expires_at: account.expires_at,
              token_type: account.token_type,
              scope: account.scope,
              id_token: account.id_token,
            },
          });
        }
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.email = user.email as string;;
        token.name = user.name as string;;
        token.picture = user.image as string;;

        const userWithStore = await db.user.findUnique({
          where: { id: user.id },
          include: {
            StoreCollaborator: {
              include: { store: true },
            },
          },
        });

        if (
          userWithStore?.StoreCollaborator &&
          userWithStore.StoreCollaborator.length > 0
        ) {
          console.log(
            "Found store relation:",
            userWithStore.StoreCollaborator[0]
          );

          token.storeId = userWithStore.StoreCollaborator[0].storeId;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id as string,
          email: token.email as string,
          name: token.name || "",
          image: token.picture || "",
          emailVerified: null,
          storeId: token.storeId as string,
        };
      }
      return session;
    },
  },
});
