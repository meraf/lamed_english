import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log("🌊 Flooding the database with data...");

  // --- CLEANUP ---
  // Delete in order to respect foreign key constraints
  const tabels = [
    prisma.message, prisma.announcementView, prisma.examResult, prisma.submission,
    prisma.materialProgress, prisma.userProgress, prisma.appointment, prisma.enrollment,
    prisma.exam, prisma.assignment, prisma.material, prisma.lesson,
    prisma.announcement, prisma.course, prisma.teacher, prisma.user
  ];
  for (const table of tabels) { await table.deleteMany(); }

  // --- 1. THE TEACHER: FASIKA MASRESHA ---
  const fasika = await prisma.user.create({
    data: {
      name: "Fasika Masresha",
      email: "fasika@lamed.com",
      role: "TEACHER",
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/photo_2025-05-29_07-25-22-Lz7p...jpg", // Your uploaded photo
      teacherProfile: {
        create: {
          bio: "Top-tier English educator with a focus on psychological linguistics and exam success.",
          expertise: ["IELTS", "TOEFL", "Business English", "Phonetics"],
          image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/photo_2025-05-29_07-25-22-Lz7p...jpg"
        }
      }
    }
  });
  const teacher = await prisma.teacher.findUnique({ where: { userId: fasika.id } });

  // --- 2. THE STUDENTS (15 Total) ---
  const students = [];
  for (let i = 1; i <= 15; i++) {
    const student = await prisma.user.create({
      data: {
        name: `Student ${i}`,
        email: `student${i}@example.com`,
        image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
        role: "USER"
      }
    });
    students.push(student);
  }

  // --- 3. THE COURSES (4 Diverse Courses) ---
  const categories = [
    { title: "IELTS Mastery 2026", cat: "Exam Prep", level: "Advanced", price: 299 },
    { title: "English for Tech Interviews", cat: "Business", level: "Intermediate", price: 150 },
    { title: "Zero to Hero: Basic Grammar", cat: "General", level: "Beginner", price: 80 },
    { title: "Public Speaking & Confidence", cat: "Soft Skills", level: "Advanced", price: 120 }
  ];

  for (const item of categories) {
    const course = await prisma.course.create({
      data: {
        title: item.title,
        description: `This is the ultimate ${item.title} course. Join Fasika Masresha to master these skills through 8 intensive modules, real-world exams, and direct feedback.`,
        category: item.cat,
        level: item.level,
        price: item.price,
        teacherId: teacher.id,
        image: `https://res.cloudinary.com/lamed-english/image/upload/v1771664869/yhzhyrcx2kyphyvstaow.jpg`,
        
        // Add 8 Lessons per course
        lessons: {
          create: Array.from({ length: 8 }).map((_, i) => ({
            title: `Module ${i + 1}: ${item.title} deep dive`,
            order: i + 1,
            content: "Full lesson transcript including vocabulary lists and grammar rules...",
            videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            materials: {
              create: [
                { title: "Reading Material PDF", fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
                { title: "Audio Practice Link", fileUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" }
              ]
            },
            assignments: {
              create: [{ title: "Critical Thinking Task", description: "Write 500 words on the lesson topic." }]
            },
            exams: {
              create: [{ title: "Module Competency Exam" }]
            }
          }))
        },
        announcements: {
          create: [
            { title: "Welcome Students!", content: "Get ready for a life-changing experience." },
            { title: "New Material Uploaded", content: "Check the resources tab for the latest PDF." }
          ]
        }
      },
      include: { lessons: { include: { exams: true, assignments: true, materials: true } } }
    });

    // --- 4. THE INTERACTION (Enrollments, Progress, Results) ---
    for (const student of students) {
      const enrollment = await prisma.enrollment.create({
        data: {
          userId: student.id,
          courseId: course.id,
          googleMeetLink: "https://meet.google.com/xyz-pdqr-abc",
          appointments: {
            create: [
              { dayOfWeek: "Monday", startTime: "09:00" },
              { dayOfWeek: "Thursday", startTime: "14:00" }
            ]
          }
        }
      });

      // Populate random progress for each student
      for (let j = 0; j < 4; j++) {
        const lesson = course.lessons[j];
        await prisma.userProgress.create({ data: { userId: student.id, lessonId: lesson.id, completed: true } });

        // Add Exam Results with random scores
        if (lesson.exams[0]) {
          await prisma.examResult.create({
            data: {
              userId: student.id,
              examId: lesson.exams[0].id,
              score: Math.floor(Math.random() * 41) + 60, // 60-100
              textAnswer: "My understanding of the modal verbs has improved significantly."
            }
          });
        }

        // Add Submission
        if (lesson.assignments[0]) {
          await prisma.submission.create({
            data: {
              userId: student.id,
              assignmentId: lesson.assignments[0].id,
              content: "This is my essay submission. Please provide feedback.",
              status: "GRADED",
              score: Math.floor(Math.random() * 20) + 80
            }
          });
        }
      }
    }
  }

  console.log("✅ DATABASE IS FULL TO THE BRIM!");
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });