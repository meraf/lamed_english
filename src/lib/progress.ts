"use server"
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Ensure 'export' is here and the name is 'toggleProgress'
export async function toggleProgress(userId: string, lessonId: string, courseId: string) {
  try {
    const existingProgress = await prisma.userProgress.findUnique({
      where: {
        userId_lessonId: { userId, lessonId }
      }
    });

    if (existingProgress) {
      await prisma.userProgress.delete({
        where: { id: existingProgress.id }
      });
    } else {
      await prisma.userProgress.create({
        data: { userId, lessonId }
      });
    }

    revalidatePath(`/courses/${courseId}/lessons/${lessonId}`);
    return { success: true };
  } catch (error) {
    console.error("PROGRESS_ERROR", error);
    return { error: "Could not update progress" };
  }
}