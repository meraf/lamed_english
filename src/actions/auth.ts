'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function registerUser(formData: FormData) {
  const email = formData.get('email') as string
  const name = formData.get('name') as string

  if (!email) {
    throw new Error("Email is required")
  }

  try {
    const user = await prisma.user.create({
      data: {
        email,
        name,
      },
    })

    revalidatePath('/')
    return { success: true, user }
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { error: "This email is already registered." }
    }
    return { error: "Something went wrong. Please try again." }
  }
}