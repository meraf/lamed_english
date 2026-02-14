import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { courseId } = await req.json();

  try {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Create the enrollment link
    await prisma.enrollment.create({
      data: {
        userId: user.id,
        courseId: courseId,
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    // If they are already enrolled, Prisma throws an error because of the @@unique constraint
    return NextResponse.json({ error: "Already enrolled" }, { status: 400 });
  }
}