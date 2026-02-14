import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET: Fetch all teachers (used by the Course Create form)
export async function GET() {
  try {
    const teachers = await prisma.teacher.findMany({
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(teachers);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch teachers" }, { status: 500 });
  }
}

// POST: Create a new teacher (your existing code)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const teacher = await prisma.teacher.create({
      data: {
        name: body.name,
        role: body.role,
        image: body.image,
        bio: body.bio,
        expertise: body.expertise, // Expecting an array of strings
      }
    });
    return NextResponse.json(teacher);
  } catch (error) {
    console.error("Teacher Create Error:", error);
    return NextResponse.json({ error: "Failed to create teacher" }, { status: 500 });
  }
}