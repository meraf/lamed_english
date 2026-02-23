import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { put } from "@vercel/blob";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const formData = await req.formData();
    const examId = formData.get("examId") as string;
    const textAnswer = formData.get("textAnswer") as string;
    const fileAnswer = formData.get("fileAnswer") as File | null;

    if (!examId) {
      return new NextResponse("Missing Exam ID", { status: 400 });
    }

    // 1. Get User
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    let uploadedFileUrl = null;

    // 2. Attempt File Upload
    if (fileAnswer && fileAnswer.size > 0 && fileAnswer.name !== "undefined") {
      try {
        const blob = await put(`exams/${user.id}/${Date.now()}-${fileAnswer.name}`, fileAnswer, {
          access: 'public',
        });
        uploadedFileUrl = blob.url;
      } catch (blobError: any) {
        // Log the error but DON'T stop the process if the text answer exists
        console.error("[BLOB_UPLOAD_ERROR]", blobError.message);
        
        // If you want to REQUIRE a file, uncomment the line below:
        // return new NextResponse(`Upload Failed: ${blobError.message}`, { status: 500 });
      }
    }

    // 3. Create Exam Result (Always happens even if Blob fails)
    const examResult = await prisma.examResult.create({
      data: {
        examId,
        userId: user.id,
        textAnswer: textAnswer || "",
        fileUrl: uploadedFileUrl,
        score: 0, 
      },
    });

    // 4. Clean Redirect
    const referer = req.headers.get("referer");
    const redirectUrl = referer ? new URL(referer) : new URL("/dashboard", req.url);
    
    // Force the tab to remain on 'exam' after redirect
    redirectUrl.searchParams.set("tab", "exam");

    return NextResponse.redirect(redirectUrl.toString(), 303);

  } catch (error) {
    console.error("[EXAM_SUBMIT_GENERAL_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}