"use server"

import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

type AuthResponse = {
  error?: string;
  success?: string;
};

// --- 1. USER REGISTRATION ---
export async function registerUser(formData: FormData): Promise<AuthResponse> {
  try {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password || !name) {
      return { error: "Please fill in all fields." };
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (existingUser) {
      return { error: "An account with this email already exists." };
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        hashedPassword: hashedPassword, 
      }
    });

    return { success: "Account created successfully! Please sign in below." };
  } catch (err: any) {
    console.error("REGISTRATION_ERROR:", err);
    return { error: "Something went wrong while saving to the database." };
  }
}

// --- 2. COURSE ENROLLMENT (The Missing Function) ---
export async function createLesson(formData: FormData) {
  const title = formData.get("title") as string;
  const videoUrl = formData.get("videoUrl") as string;
  const courseId = formData.get("courseId") as string;
  const order = parseInt(formData.get("order") as string || "0");

  await prisma.lesson.create({
    data: {
      title,
      videoUrl,
      courseId,
      order,
    },
  });

  revalidatePath(`/courses/${courseId}`);
  return { success: true };
}
export async function enrollInCourse(courseId: string, formData: FormData) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  try {
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        enrolledCourses: {
          connect: { id: courseId }
        }
      }
    });
  } catch (error) {
    console.error("Enrollment error:", error);
    return { error: "Failed to enroll" };
  }

  // Refresh data and send them to the course
  revalidatePath('/dashboard');
  revalidatePath(`/courses/${courseId}`);
  redirect(`/courses/${courseId}`); 
}