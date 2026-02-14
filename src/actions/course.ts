'use server'

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"

/**
 * Action to enroll a student in a course
 * Updated for Explicit Many-to-Many (Enrollment Model)
 */
export async function enrollInCourse(courseId: string) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    throw new Error("You must be logged in to enroll")
  }

  // 1. First, we need the User's ID (not just their email)
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true }
  })

  if (!user) throw new Error("User not found")

  // 2. Check if the user is already enrolled to prevent duplicates
  const existingEnrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: user.id,
        courseId: courseId
      }
    }
  })

  if (existingEnrollment) {
    return { success: false, message: "Already enrolled" }
  }

  // 3. Create the Enrollment record
  // This bridges the User and the Course
  await prisma.enrollment.create({
    data: {
      userId: user.id,
      courseId: courseId
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
  
  if (!session?.user?.email) throw new Error("Unauthorized")

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true }
  })

  if (!user) throw new Error("User not found")

  const existingProgress = await prisma.userProgress.findUnique({
    where: {
      userId_lessonId: {
        userId: user.id,
        lessonId: lessonId
      }
    }
  })

  if (existingProgress) {
    await prisma.userProgress.delete({
      where: {
        userId_lessonId: {
          userId: user.id,
          lessonId: lessonId
        }
      }
    })
  } else {
    await prisma.userProgress.create({
      data: {
        userId: user.id,
        lessonId: lessonId,
        isCompleted: true
      }
    })
  }

  revalidatePath('/dashboard')
  revalidatePath(`/lessons/${lessonId}`)
  
  return { success: true }
}