import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get('file') as File;
  const assignmentId = formData.get('assignmentId') as string;

  if (!file || !assignmentId) return NextResponse.json({ error: "Missing data" }, { status: 400 });

  // 1. Upload to Vercel Blob
  const blob = await put(file.name, file, { access: 'public' });

  // 2. Save link to Prisma
  await prisma.submission.create({
    data: {
      assignmentId,
      userId: (await prisma.user.findUnique({ where: { email: session.user?.email! } }))?.id!,
      fileUrl: blob.url,
      status: "SUBMITTED"
    }
  });

  return NextResponse.redirect(new URL(request.headers.get('referer') || '/dashboard', request.url));
}