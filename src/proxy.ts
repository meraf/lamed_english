import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Protection logic based on the role we injected into the token
    const isAdmin = token?.role === "ADMIN";
    const isTeacher = token?.role === "TEACHER";

    // 1. Protect Admin routes (Only ADMIN allowed)
    if (path.startsWith("/admin") && !isAdmin) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // 2. Protect Teacher routes (TEACHER or ADMIN allowed)
    if (path.startsWith("/teacher") && !isTeacher && !isAdmin) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  },
  {
    callbacks: {
      // The middleware only runs if the user is logged in
      authorized: ({ token }) => !!token,
    },
  }
);

// This determines which folders the middleware "listens" to
export const config = {
  matcher: [
    "/admin/:path*",
    "/teacher/:path*",
    "/dashboard/:path*",
    "/learn/:path*", // Protect the classroom too
  ],
};