const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding...");

  // 1. Clean the database in order of dependencies (Child records first)
  // These MUST match the models currently in your schema.prisma
  console.log("Cleaning old data...");
  await prisma.appointment.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.examResult.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.userProgress.deleteMany();
  await prisma.material.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.course.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create a Teacher
  const teacher = await prisma.teacher.create({
    data: {
      name: "Dr. Sarah Jenkins",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
      bio: "Expert in Next.js and Database Architecture with 10+ years of experience.",
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
      description: "A comprehensive guide to building modern web applications.",
      image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee",
      teacherId: teacher.id,
    },
  });

  // 5. Enroll the student & Set individual Mentorship details
  const enrollment = await prisma.enrollment.create({
    data: {
      userId: student.id,
      courseId: course.id,
      googleMeetLink: "https://meet.google.com/abc-defg-hij",
    },
  });

  // 6. Set Student Appointments (Mon/Wed/Fri)
  await prisma.appointment.createMany({
    data: [
      { enrollmentId: enrollment.id, dayOfWeek: "Monday", startTime: "10:00 AM" },
      { enrollmentId: enrollment.id, dayOfWeek: "Wednesday", startTime: "10:00 AM" },
    ]
  });

  // 7. Create Lessons
  const lesson1 = await prisma.lesson.create({
    data: {
      title: "Introduction to ORMs",
      content: "Basics of Object-Relational Mapping.",
      order: 1,
      courseId: course.id,
      videoUrl: "https://www.youtube.com/watch?v=reP1px1fshA",
    },
  });

  // 8. Create Material for Lesson 1
  await prisma.material.create({
    data: {
      title: "Getting Started PDF",
      fileUrl: "https://example.com/guide.pdf",
      lessonId: lesson1.id,
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