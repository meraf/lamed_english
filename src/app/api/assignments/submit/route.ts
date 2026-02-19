import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { put } from "@vercel/blob";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const formData = await req.formData();
    const assignmentId = formData.get("assignmentId") as string;
    const fileAnswer = formData.get("submissionFile") as File | null;

    if (!assignmentId) return new NextResponse("Missing fields", { status: 400 });

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });
    if (!user) return new NextResponse("User not found", { status: 404 });

    let uploadedFileUrl = null;

    // FIX: Safety check for empty files
    if (fileAnswer && fileAnswer.size > 0) {
      const blob = await put(`assignments/${Date.now()}-${fileAnswer.name}`, fileAnswer, {
        access: 'public',
      });
      uploadedFileUrl = blob.url;
    } else {
      // Assignments require a file
      return new NextResponse("File is required", { status: 400 });
    }

    // Save the submission
    await prisma.submission.create({
      data: {
        assignmentId: assignmentId,
        userId: user.id,
        fileUrl: uploadedFileUrl,
        status: "SUBMITTED",
      },
    });

    const referer = req.headers.get("referer");
    return NextResponse.redirect(new URL(referer || "/", req.url));

  } catch (error) {
    console.error("[ASSIGNMENT_SUBMIT_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}