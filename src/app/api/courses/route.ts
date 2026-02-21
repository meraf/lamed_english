import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // ✅ Clean access thanks to our Module Augmentation in lib/auth.ts
    const userId = session?.user?.id;
    const userRole = session?.user?.role;

    // Only allow ADMIN or TEACHER to create courses
    if (!session || !userId || (userRole !== "ADMIN" && userRole !== "TEACHER")) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { title, description, image, category, level } = body;

    // 1. Ensure Teacher Profile exists
    let teacher = await prisma.teacher.findUnique({
      where: { userId: userId }
    });

    if (!teacher) {
      teacher = await prisma.teacher.create({
        data: {
          bio: "New Teacher Profile",
          user: { connect: { id: userId } }
        }
      });
      
      // Sync the user role in the DB if they weren't already marked
      await prisma.user.update({
        where: { id: userId },
        data: { role: "TEACHER" }
      });
    }

    // 2. Create the course
    const course = await prisma.course.create({
      data: {
        title,
        description,
        image,
        // Check if these fields exist in your schema before pushing
        ...(category && { category }),
        ...(level && { level }),
        teacher: { connect: { id: teacher.id } },
      },
    });

    return NextResponse.json(course);
  } catch (error) {
    console.error("[COURSES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}