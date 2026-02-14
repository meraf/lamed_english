import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(courses);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const course = await prisma.course.create({
      data: {
        title: body.title,
        description: body.description,
        price: parseFloat(body.price),
        thumbnail: body.thumbnail,
        teacherId: body.teacherId,
      }
    });
    return NextResponse.json(course);
  } catch (error) {
    console.error("Course POST Error:", error);
    return NextResponse.json({ error: "Failed to create course" }, { status: 500 });
  }
}