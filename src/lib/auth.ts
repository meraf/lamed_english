import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions } from "next-auth";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
  // Connects NextAuth to your Supabase database via Prisma
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
        // Validation: Ensure fields aren't empty
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter both email and password.');
        }

        // Search for user in your Supabase 'User' table
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        // Error if user doesn't exist OR if they signed up with Google (no password)
        if (!user || !user.hashedPassword) {
          throw new Error('No account found with this email. Try Google login.');
        }

        // Compare the password typed in with the encrypted one in the DB
        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        );

        if (!isPasswordCorrect) {
          throw new Error('Incorrect password.');
        }

        // Success: Return user object to create a session
        return user;
      }
    })
  ],

  // Custom pages UI
  pages: {
    signIn: '/login', // Redirects users to our custom login page
  },

  // Session configuration
  session: {
    strategy: "jwt", // Required when using Credentials provider
  },

  callbacks: {
    // Adds the user's ID to the session so we can identify them in the Dashboard
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub;
      }
      return session;
    },
    // Ensures JWT token is created correctly
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    }
  },

  // Secret key for encrypting the session cookie
  secret: process.env.NEXTAUTH_SECRET,
};