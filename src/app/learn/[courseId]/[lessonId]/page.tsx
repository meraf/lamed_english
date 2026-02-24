export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import ClassroomClient from "./ClassroomClient";

export default async function LearnPage({ params }: { params: Promise<{ courseId: string; lessonId: string }> }) {
  // 1. Await params (Required in Next.js 15+)
  const { courseId, lessonId } = await params;

  // 2. Safety Check: If lessonId is missing, return 404
  if (!lessonId) return notFound();

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) notFound();

  // 3. Fetch lesson with deep nested exam questions and options
  // This matches the structure seen in your error log
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      course: {
        include: {
          lessons: { orderBy: { order: 'asc' } },
          announcements: { orderBy: { createdAt: 'desc' } },
          enrollments: {
            where: { userId: user.id }
          }
        }
      },
      materials: true,
      assignments: {
        include: { submissions: { where: { userId: user.id } } }
      },
      exams: {
        include: { 
          questions: {
            include: { options: { select: { id: true, text: true } } }
          },
          results: { where: { userId: user.id } } 
        }
      }
    }
  });

  if (!lesson) notFound();

  // Extract the specific enrollment for this user and course
  const enrollment = lesson.course.enrollments[0] || null;

  return (
    <ClassroomClient 
      user={user} 
      lesson={lesson} 
      course={lesson.course} 
      enrollment={enrollment} 
    />
  );
}