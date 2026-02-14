import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// 1. THIS IS THE MISSING PIECE: The GET handler for your dropdown
export async function GET() {
  try {
    const teachers = await prisma.teacher.findMany({
      orderBy: { name: 'asc' }
    });
    
    // Always return an array. If no teachers exist, it returns []
    return NextResponse.json(teachers); 
  } catch (error) {
    console.error("GET_TEACHERS_ERROR:", error);
    return NextResponse.json({ error: "Failed to fetch teachers" }, { status: 500 });
  }
}

// 2. Your existing POST handler
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const teacher = await prisma.teacher.create({
      data: {
        name: body.name,
        role: body.role,
        image: body.image,
        bio: body.bio,
        expertise: typeof body.expertise === 'string' 
          ? body.expertise.split(',').map((s: string) => s.trim()).filter(Boolean)
          : body.expertise,
      }
    });
    return NextResponse.json(teacher);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}