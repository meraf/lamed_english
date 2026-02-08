import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth"; // Import what we just created

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };