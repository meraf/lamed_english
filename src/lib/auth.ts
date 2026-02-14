import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions } from "next-auth";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
  // Connects NextAuth to your database via Prisma
  adapter: PrismaAdapter(prisma),
  
  providers: [
    // 1. Google Login
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // 2. Email & Password Login
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter both email and password.');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.hashedPassword) {
          throw new Error('No account found with this email. Try Google login.');
        }

        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        );

        if (!isPasswordCorrect) {
          throw new Error('Incorrect password.');
        }

        return user;
      }
    })
  ],

  pages: {
    signIn: '/login',
  },

  session: {
    strategy: "jwt", 
  },

  // ⬇️ THIS IS THE IMPORTANT PART WE UPDATED ⬇️
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        // @ts-ignore - Pass the role to the token
        token.role = user.role; 
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // @ts-ignore - Pass the id to the session
        session.user.id = token.sub;
        // @ts-ignore - Pass the role to the session so Middleware can see it
        session.user.role = token.role; 
      }
      return session;
    }
  },

  secret: process.env.NEXTAUTH_SECRET,
};