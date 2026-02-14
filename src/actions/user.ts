'use server'
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function updateProfile(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) throw new Error("Unauthorized")

  const name = formData.get("name") as string

  await prisma.user.update({
    where: { email: session.user.email },
    data: { name }
  })

  revalidatePath("/profile")
  return { success: true }
}