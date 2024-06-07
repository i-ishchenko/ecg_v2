import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import User from "@/models/userModel";
import { connectDB } from "@/lib/connectDB";
import { NextAuthOptions } from "next-auth";

async function login(
  credentials: Record<"password" | "email", string> | undefined
) {
  connectDB();
  const user = await User.findOne({ email: credentials?.email });
  if (!user) throw new Error("Wrong credentials.");
  const isCorrect = await bcrypt.compare(
    credentials?.password as string,
    user.password
  );
  if (!isCorrect) throw new Error("Wrong credentials.");
  return user;
}

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: "/auth/signin",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "jsmith" },
        password: { label: "Password", text: "password" },
      },
      async authorize(credentials) {
        const user = await login(credentials);
        return user;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.email = user.email;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token) {
        session.user.email = token.email;
        session.user.id = token.id;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
