import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description, thumbnail, price, teacherId } = body;

    const course = await prisma.course.create({
      data: {
        title: title,
        description: description,
        image: thumbnail, // Schema says 'image', Frontend sends 'thumbnail'
        price: parseFloat(price),
        // Level and Category have defaults in schema, but we can set them here
        level: "Beginner",
        category: "English",
        teacher: {
          connect: { id: teacherId }
        }
      },
    });

    return NextResponse.json(course);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}