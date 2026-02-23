import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  // Check if session exists and user has the correct role
  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { submissionId, score, type } = await req.json();

    if (type === "exam") {
      // ✅ Changed 'result' to 'examResult' to match your schema
      await prisma.examResult.update({
        where: { id: submissionId },
        data: { score: parseFloat(score) }
      });
    } else {
      // ✅ Using 'submission' and enabling the 'score' field
      await prisma.submission.update({
        where: { id: submissionId },
        data: { 
          status: "GRADED",
          score: parseFloat(score) 
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[GRADING_ERROR]", error);
    return NextResponse.json({ error: "Failed to update grade" }, { status: 500 });
  }
}