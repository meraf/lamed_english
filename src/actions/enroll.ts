"use server"

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function enrollUser(courseId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user) throw new Error("User not found");

  // Check if already enrolled
  const existing = await prisma.userProgress.findFirst({
    where: { userId: user.id, lesson: { courseId: courseId } }
  });

  if (existing) return { success: true };

  // Get the first lesson to start them off
  const firstLesson = await prisma.lesson.findFirst({
    where: { courseId },
    orderBy: { order: 'asc' }
  });

  if (firstLesson) {
    // We create a progress entry for the first lesson to "enroll" them
    await prisma.userProgress.create({
      data: {
        userId: user.id,
        lessonId: firstLesson.id,
    completed: true // ✅ Correct: matches your schema.prisma
      }
    });
  }

  revalidatePath('/dashboard');
  revalidatePath(`/courses/${courseId}`);
  return { success: true };
}