const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding...");

  // 1. Clean the database (Optional, but recommended for development)
  // Delete in order of dependencies (child records first)
  await prisma.submission.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.examResult.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.userProgress.deleteMany();
  await prisma.materialProgress.deleteMany();
  await prisma.material.deleteMany();
  await prisma.announcementView.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.course.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create a Teacher
  const teacher = await prisma.teacher.create({
    data: {
      name: "Dr. Sarah Jenkins",
      role: "Senior Full Stack Developer",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
      bio: "Expert in Next.js and Database Architecture with 10+ years of experience.",
      rating: 4.9,
      expertise: ["React", "Prisma", "PostgreSQL", "Tailwind CSS"],
    },
  });

  // 3. Create a User (Student)
  const student = await prisma.user.create({
    data: {
      name: "John Doe",
      email: "student@example.com",
      role: "USER",
    },
  });

  // 4. Create a Course
  const course = await prisma.course.create({
    data: {
      title: "Mastering Prisma & Next.js",
      description: "A comprehensive guide to building modern web applications with typesafe databases.",
      price: 49.99,
      image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee",
      teacherId: teacher.id,
    },
  });

  // 5. Enroll the student in the course
  await prisma.enrollment.create({
    data: {
      userId: student.id,
      courseId: course.id,
    },
  });

  // 6. Create Lessons
  const lesson1 = await prisma.lesson.create({
    data: {
      title: "Introduction to ORMs",
      content: "In this lesson, we cover the basics of Object-Relational Mapping.",
      order: 1,
      courseId: course.id,
      videoUrl: "https://www.youtube.com/watch?v=reP1px1fshA",
    },
  });

  const lesson2 = await prisma.lesson.create({
    data: {
      title: "Setting up your Schema",
      content: "Learning how to define models and relations in Prisma.",
      order: 2,
      courseId: course.id,
      videoUrl: "https://www.youtube.com/watch?v=F_fP8K_uO_0",
    },
  });

  // 7. Create Materials for Lesson 1
  await prisma.material.create({
    data: {
      title: "Getting Started PDF",
      fileUrl: "https://example.com/guide.pdf",
      fileType: "PDF",
      lessonId: lesson1.id,
    },
  });

  // 8. Create an Assignment for Lesson 2
  const assignment = await prisma.assignment.create({
    data: {
      title: "Schema Design Challenge",
      description: "Create a schema for a blog application.",
      lessonId: lesson2.id,
    },
  });

  // 9. Create an Announcement for the Course
  await prisma.announcement.create({
    data: {
      title: "Welcome to the Course!",
      content: "I'm excited to have you all here. Let's start building!",
      courseId: course.id,
    },
  });

  // 10. Create an Exam for Lesson 2
  await prisma.exam.create({
    data: {
      title: "Prisma Basics Quiz",
      lessonId: lesson2.id,
    },
  });

  console.log("Seeding finished successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });