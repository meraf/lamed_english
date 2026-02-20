"use server"

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// 1. Setup Individual Student (Meet Link + Mon/Wed/Fri)
export async function updateStudentAccess(enrollmentId: string, meetLink: string, schedule: { day: string, time: string }[]) {
  await prisma.enrollment.update({
    where: { id: enrollmentId },
    data: { googleMeetLink: meetLink }
  });

  await prisma.appointment.deleteMany({ where: { enrollmentId } });
  await prisma.appointment.createMany({
    data: schedule.map(s => ({
      enrollmentId,
      dayOfWeek: s.day,
      startTime: s.time
    }))
  });
  revalidatePath(`/teacher/enrollments/${enrollmentId}`);
}

// 2. Grade Submissions (Exams or Assignments)
export async function gradeWork(id: string, score: number, type: 'EXAM' | 'ASSIGNMENT') {
  if (type === 'EXAM') {
    await prisma.examResult.update({ where: { id }, data: { score } });
  } else {
    await prisma.submission.update({ where: { id }, data: { score, status: "GRADED" } });
  }
  revalidatePath('/teacher/grading');
}

// 3. Create Content (Lessons, Assignments, Exams)
export async function addLessonContent(courseId: string, title: string, videoUrl: string, content: string) {
  await prisma.lesson.create({
    data: { title, videoUrl, content, order: 1, courseId }
  });
  revalidatePath(`/teacher/courses/${courseId}`);
}