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

// --- 2. LESSON CREATION ---
export async function createLesson(formData: FormData) {
  const title = formData.get("title") as string;
  const videoUrl = formData.get("videoUrl") as string;
  const courseId = formData.get("courseId") as string;
  const order = parseInt(formData.get("order") as string || "0");

  if (!title || !videoUrl || !courseId) {
    throw new Error("Missing lesson data");
  }

  await prisma.lesson.create({
    data: {
      title,
      videoUrl,
      courseId,
      order,
    },
  });

  revalidatePath(`/courses/${courseId}`);
  revalidatePath('/admin');
  return { success: true };
}

// --- 3. COURSE ENROLLMENT ---
export async function enrollInCourse(courseId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!user) throw new Error("User not found");

    await prisma.enrollment.create({
      data: {
        userId: user.id,
        courseId: courseId,
      }
    });

  } catch (error: any) {
    if (error.code === 'P2002') {
       console.log("User already enrolled.");
    } else {
       console.error("Enrollment error:", error);
       return { error: "Failed to enroll" };
    }
  }

  revalidatePath('/dashboard');
  revalidatePath(`/courses/${courseId}`);
  redirect(`/courses/${courseId}`); 
}

// --- 4. COURSE UNENROLLMENT (The Missing Function) ---
export async function unenrollFromCourse(courseId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!user) throw new Error("User not found");

    // Deleting from the explicit bridge table using the composite ID
    await prisma.enrollment.delete({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: courseId,
        }
      }
    });

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error("Unenrollment error:", error);
    return { error: "Failed to unenroll" };
  }
}