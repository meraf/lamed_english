import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { submissionId, score, type } = await req.json();

  if (type === "exam") {
    await prisma.result.update({
      where: { id: submissionId },
      data: { score: parseFloat(score) }
    });
  } else {
    await prisma.submission.update({
      where: { id: submissionId },
      data: { 
        status: "GRADED",
        // Assuming your submission model has a score field
        // score: parseFloat(score) 
      }
    });
  }

  return NextResponse.json({ success: true });
}