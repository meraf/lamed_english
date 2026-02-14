'use server'

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"

/**
 * Action to enroll a student in a course
 */
export async function enrollInCourse(courseId: string) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    throw new Error("You must be logged in to enroll")
  }

  // We find the user by email and connect them to the course
  // The field name 'enrolledCourses' must match your User model in schema.prisma
  await prisma.user.update({
    where: { email: session.user.email },
    data: {
      enrolledCourses: {
        connect: { id: courseId }
      }
    }
  })

  revalidatePath('/dashboard')
  revalidatePath(`/courses/${courseId}`)
  
  return { success: true }
}

/**
 * Action to toggle lesson completion (Mark as Done / Undone)
 */
export async function toggleLessonProgress(lessonId: string) {
  const session = await getServerSession(authOptions)
  
  // 1. Security Check
  if (!session?.user?.email) throw new Error("Unauthorized")

  // 2. Find the User ID from the email
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true }
  })

  if (!user) throw new Error("User not found")

  // 3. Check if progress already exists using the unique compound index
  const existingProgress = await prisma.userProgress.findUnique({
    where: {
      userId_lessonId: {
        userId: user.id,
        lessonId: lessonId
      }
    }
  })

  if (existingProgress) {
    // If it exists, delete it (Unmark as complete)
    await prisma.userProgress.delete({
      where: {
        userId_lessonId: {
          userId: user.id,
          lessonId: lessonId
        }
      }
    })
  } else {
    // If it doesn't exist, create it (Mark as complete)
    await prisma.userProgress.create({
      data: {
        userId: user.id,
        lessonId: lessonId,
        isCompleted: true
      }
    })
  }

  // 4. Refresh the data cache so the UI updates immediately
  revalidatePath('/dashboard')
  revalidatePath(`/lessons/${lessonId}`)
  
  return { success: true }
}