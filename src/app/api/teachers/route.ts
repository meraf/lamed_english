import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // We must include the 'user' to get the name for your dropdown
    const teachers = await prisma.teacher.findMany({
      include: {
        user: {
          select: {
            name: true,
          }
        }
      }
    });

    // We map it so the frontend gets a clean "name" property
    const formattedTeachers = teachers.map(t => ({
      id: t.id,
      name: t.user?.name || "Unknown Instructor"
    }));

    return NextResponse.json(formattedTeachers);
  } catch (error) {
    console.error("[TEACHERS_GET]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}