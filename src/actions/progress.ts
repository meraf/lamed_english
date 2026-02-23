"use server"
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function markMaterialAsRead(userId: string, materialId: string) {
  await prisma.materialProgress.upsert({
    where: { userId_materialId: { userId, materialId } },
    update: { completed: true },
    create: { userId, materialId, completed: true }
  });
  revalidatePath("/learn");
}

export async function markAnnouncementAsViewed(userId: string, announcementId: string) {
  await prisma.announcementView.upsert({
    where: { announcementId_userId: { announcementId, userId } },
    update: { viewedAt: new Date() },
    create: { announcementId, userId }
  });
  revalidatePath("/learn");
}