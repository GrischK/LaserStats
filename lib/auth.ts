import type {NextAuthOptions, Session, User} from "next-auth";
import type {JWT} from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import {prisma} from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {label: "Email", type: "email"},
        password: {label: "Password", type: "password"},
      },
      async authorize(
        credentials: Record<"email" | "password", string> | undefined
      ) {
        const email = credentials?.email;
        const password = credentials?.password;

        if (!email || !password) {
          return null;
        }

        const dbUser = await prisma.user.findUnique({
          where: {email},
        });

        if (!dbUser || !dbUser.password) {
          return null;
        }

        const valid = await bcrypt.compare(password, dbUser.password);

        if (!valid) {
          return null;
        }

        return {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name,
        } as User;
      },
    }),
  ],
  callbacks: {
    async jwt({
                token,
                user,
              }: {
      token: JWT;
      user?: User;
    }) {
      if (user?.id) {
        token.id = user.id;
      }
      return token;
    },
    async session({
                    session,
                    token,
                  }: {
      session: Session;
      token: JWT;
    }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};