import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const teachers = await prisma.teacher.findMany({
      include: {
        user: {
          select: {
            name: true,
            image: true, // The profile picture from Google/Auth
          }
        }
      }
    });

    const formattedTeachers = teachers.map(t => ({
      id: t.id,
      name: t.user?.name || "Unknown",
      image: t.image || t.user?.image || "", // Use Teacher image or fallback to User image
      role: t.role || "Instructor",
      bio: t.bio,
      expertise: t.expertise
    }));

    return NextResponse.json(formattedTeachers);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch teachers" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const teacher = await prisma.teacher.create({
      data: {
        userId: body.userId, // This must be a valid ID from the User table
        role: body.role,
        image: body.image,
        bio: body.bio,
        expertise: body.expertise, 
      }
    });
    return NextResponse.json(teacher);
  } catch (error) {
    console.error("Teacher Create Error:", error);
    return NextResponse.json({ error: "Check if userId exists and fields match" }, { status: 500 });
  }
}