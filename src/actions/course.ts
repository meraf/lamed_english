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

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true }
  })

  if (!user) throw new Error("User not found")

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
 * NEW: Action to remove a student from a course
 * This targets the explicit join table (Enrollment)
 */
export async function unenrollFromCourse(courseId: string, userId?: string) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) throw new Error("Unauthorized")

  // Use provided userId (Admin mode) or find current user's ID (Self-unenroll)
  let targetUserId = userId

  if (!targetUserId) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })
    if (!user) throw new Error("User not found")
    targetUserId = user.id
  }

  try {
    await prisma.enrollment.delete({
      where: {
        userId_courseId: {
          userId: targetUserId,
          courseId: courseId,
        },
      },
    })

    revalidatePath('/dashboard')
    revalidatePath('/admin/enrollments')
    revalidatePath(`/courses/${courseId}`)
    
    return { success: true }
  } catch (error) {
    console.error("UNENROLL_ERROR:", error)
    return { success: false, error: "Enrollment not found or already removed." }
  }
}

/**
 * Action to toggle lesson completion
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