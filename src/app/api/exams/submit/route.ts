import { NextResponse } from "next/server"; // Fix: Use next/server instead of next/form
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { examId, answers } = body as { examId: string; answers: Record<string, string> };

    // 1. Fetch real questions and correct answers securely from the server
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: { 
        questions: { 
          include: { options: true } 
        } 
      }
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    // 2. Calculate Score
    let correctCount = 0;
    const totalQuestions = exam.questions.length;

    // Fixed parameter 'question' type error
    exam.questions.forEach((question: any) => {
      const studentAnswerId = answers[question.id];
      // Fixed parameter 'opt' type error
      const correctOption = question.options.find((opt: any) => opt.isCorrect);
      
      if (correctOption && studentAnswerId === correctOption.id) {
        correctCount++;
      }
    });

    const scorePercentage = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

    // 3. Save Result
    const result = await prisma.examResult.create({
      data: {
        userId: user.id,
        examId: examId,
        answers: answers, // Ensure this field exists in your schema
        score: Math.round(scorePercentage),
        isGraded: true,   // Ensure this field exists in your schema
      }
    });

    return NextResponse.json({ success: true, score: result.score });
  } catch (error) {
    console.error("Exam Submit Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}