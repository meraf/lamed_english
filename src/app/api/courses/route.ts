import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Validation: Ensure required fields are present
    if (!body.title || !body.teacherId || !body.price) {
      return NextResponse.json(
        { error: "Title, Teacher, and Price are mandatory." },
        { status: 400 }
      );
    }

    // 2. Create the course
    const course = await prisma.course.create({
      data: {
        title: body.title,
        description: body.description,
        thumbnail: body.thumbnail || null,
        price: parseFloat(body.price), // Convert string from form to Float
        teacherId: body.teacherId,     // Link to the teacher
      }
    });

    return NextResponse.json(course);
  } catch (error: any) {
    console.error("COURSE_POST_ERROR:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

// GET all courses
export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      include: { teacher: true },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(courses);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
  }
}