const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Starting Big Seed...");

  // 1. CLEANUP (Delete in order to respect Foreign Key constraints)
  console.log("🧹 Cleaning old data...");
  await prisma.userProgress.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.course.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  // 2. TEACHERS & USERS
  console.log("👥 Creating Teachers and Students...");
  
  const teacher1 = await prisma.user.create({
    data: {
      name: "Sarah Miller",
      email: "sarah@lamed.com",
      role: "ADMIN",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
    }
  });

  const teacher2 = await prisma.user.create({
    data: {
      name: "James Wilson",
      email: "james@lamed.com",
      role: "ADMIN",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=James"
    }
  });

  const student1 = await prisma.user.create({
    data: {
      name: "Alex Smith",
      email: "alex@example.com",
      role: "USER"
    }
  });

  // 3. COURSES & LESSONS
  console.log("📚 Creating Courses...");

  // COURSE A: Beginner
  const courseA = await prisma.course.create({
    data: {
      title: "English Foundations: Level 1",
      description: "Perfect for absolute beginners. We cover phonics, basic grammar, and daily greetings.",
      price: 19.99,
      lessons: {
        create: [
          { title: "The Sound of English", content: "Mastering vowels and consonants.", order: 1, videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
          { title: "Meeting New People", content: "How to introduce yourself properly.", order: 2, videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
          { title: "Numbers & Counting", content: "Counting from 1 to 1000.", order: 3, videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
        ]
      },
      users: { connect: { id: student1.id } } // Enroll Alex
    },
    include: { lessons: true }
  });

  // COURSE B: Business
  const courseB = await prisma.course.create({
    data: {
      title: "Mastering Business Emails",
      description: "Write professional emails that get results. Learn formal vs informal tones.",
      price: 45.00,
      lessons: {
        create: [
          { title: "The Anatomy of a Professional Email", content: "Subject lines and greetings.", order: 1, videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
          { title: "Asking for Favors", content: "How to be polite yet firm.", order: 2, videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
          { title: "Follow-up Strategies", content: "When and how to follow up.", order: 3, videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
        ]
      }
    },
    include: { lessons: true }
  });

  // COURSE C: Travel
  const courseC = await prisma.course.create({
    data: {
      title: "English for Travelers",
      description: "Essential phrases for airports, hotels, and restaurants.",
      price: 25.00,
      lessons: {
        create: [
          { title: "At the Airport", content: "Checking in and security.", order: 1, videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
          { title: "Ordering Food", content: "Common restaurant vocabulary.", order: 2, videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
        ]
      }
    }
  });

  // 4. USER PROGRESS
  console.log("📈 Creating Progress Records...");
  
  // Mark 2 lessons of Course A as completed for Alex
  await prisma.userProgress.createMany({
    data: [
      { userId: student1.id, lessonId: courseA.lessons[0].id, isCompleted: true },
      { userId: student1.id, lessonId: courseA.lessons[1].id, isCompleted: true },
    ]
  });

  console.log(`
  ✅ SEEDING COMPLETE!
  ---------------------
  Teachers: 2
  Students: 1
  Courses:  3
  Lessons:  8
  Progress: 2
  ---------------------
  `);
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });