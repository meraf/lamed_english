import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const lesson = await prisma.lesson.create({
      data: {
        title: body.title,
        videoUrl: body.videoUrl,
        content: body.content,
        order: parseInt(body.order),
        courseId: body.courseId,
      }
    });
    return NextResponse.json(lesson);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create lesson" }, { status: 500 });
  }
}