export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import ClassroomClient from "./ClassroomClient";

export default async function LearnPage({ params }: { params: Promise<{ courseId: string; lessonId: string }> }) {
  const { courseId, lessonId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      progress: true,
      materialProgress: true,
      examResults: true,
      announcementViews: true,
    }
  });

  if (!user) notFound();

  // Fetch everything needed for the classroom
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      course: {
        include: {
          lessons: { orderBy: { order: 'asc' } },
          announcements: { orderBy: { createdAt: 'desc' } }
        }
      },
      materials: true,
      assignments: {
        include: { submissions: { where: { userId: user.id } } }
      },
      exams: {
        include: { results: { where: { userId: user.id } } }
      }
    }
  });

  if (!lesson) notFound();

  return (
    <ClassroomClient 
      user={user}
      lesson={lesson}
      course={lesson.course}
    />
  );
}