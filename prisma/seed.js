import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Starting complete database seed...");

  // 1. Create a Teacher
  const teacher = await prisma.teacher.upsert({
    where: { id: 'teacher-1' },
    update: {},
    create: {
      id: 'teacher-1',
      name: "Sarah Johnson",
      role: "Senior English Instructor",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
      bio: "Expert in ESL and Proficiency Exam preparation with 10 years of experience.",
      expertise: ["IELTS", "TOEFL", "Business English"],
    },
  });

  // 2. Create a Course
  const course = await prisma.course.upsert({
    where: { id: 'course-1' },
    update: {},
    create: {
      id: 'course-1',
      title: "Mastering Advanced English",
      description: "A comprehensive course covering advanced grammar and speaking.",
      price: 49.99,
      thumbnail: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8",
      teacherId: teacher.id,
    },
  });

  // 3. Create Lessons
  const lesson1 = await prisma.lesson.upsert({
    where: { id: 'lesson-1' },
    update: {},
    create: {
      id: 'lesson-1',
      title: "Introduction to Advanced Syntax",
      content: "In this lesson, we explore complex sentence structures and nuances.",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      order: 1,
      courseId: course.id,
    },
  });

  const lesson2 = await prisma.lesson.upsert({
    where: { id: 'lesson-2' },
    update: {},
    create: {
      id: 'lesson-2',
      title: "Idioms and Phrasal Verbs",
      content: "Mastering common expressions used by native speakers.",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      order: 2,
      courseId: course.id,
    },
  });

  // 4. Create Exams for Lesson 1
  await prisma.exam.upsert({
    where: { id: 'exam-1' },
    update: { lessonId: lesson1.id },
    create: {
      id: 'exam-1',
      title: "Syntax Proficiency Test",
      lessonId: lesson1.id,
    },
  });

  // 5. Create Assignments for Lesson 1
  await prisma.assignment.upsert({
    where: { id: 'assignment-1' },
    update: { lessonId: lesson1.id },
    create: {
      id: 'assignment-1',
      title: "Essay: Structural Analysis",
      lessonId: lesson1.id,
    },
  });

  // 6. Create Course Announcements
  await prisma.announcement.upsert({
    where: { id: 'ann-1' },
    update: { courseId: course.id },
    create: {
      id: 'ann-1',
      title: "Welcome to the Masterclass!",
      content: "We are excited to have you here. Check the curriculum to get started.",
      courseId: course.id,
    },
  });

  console.log({
    message: "✅ Seed successful",
    teacher: teacher.name,
    course: course.title,
    lessons: 2,
  });
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });