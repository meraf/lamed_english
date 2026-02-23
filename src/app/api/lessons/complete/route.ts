import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });

    const { lessonId, isCompleted } = await req.json();

    if (!lessonId) return new NextResponse("Lesson ID missing", { status: 400 });

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!user) return new NextResponse("User not found", { status: 404 });

    if (isCompleted) {
      // ✅ Using "completed" to match your schema.prisma
      await prisma.userProgress.upsert({
        where: { 
          userId_lessonId: { 
            userId: user.id, 
            lessonId: lessonId 
          } 
        },
        update: { 
          completed: true 
        },
        create: { 
          userId: user.id, 
          lessonId: lessonId, 
          completed: true 
        },
      });
    } else {
      await prisma.userProgress.deleteMany({
        where: { 
          userId: user.id, 
          lessonId: lessonId 
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[LESSON_COMPLETE_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}