import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions, DefaultSession } from "next-auth";
import { Adapter } from "next-auth/adapters"; // Import Adapter specifically
import bcrypt from "bcryptjs";

// ✅ 1. MODULE AUGMENTATION: Correctly extending the types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string; // Ensure id is recognized
    role: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    sub: string;
    role: string;
  }
}

export const authOptions: NextAuthOptions = {
  // ✅ 2. FIX: Casting the adapter to "Adapter" breaks the type mismatch loop
  adapter: PrismaAdapter(prisma) as Adapter,
  
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

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

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role, 
        };
      }
    })
  ],

  pages: {
    signIn: '/login',
  },

  session: {
    strategy: "jwt", 
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.role = user.role; 
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub;
        session.user.role = token.role; 
      }
      return session;
    }
  },

  secret: process.env.NEXTAUTH_SECRET,
};