const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  // 1. Create a Sample Course
  const course = await prisma.course.create({
    data: {
      title: "Mastering Conversational English",
      description: "Take your English from basic to fluent with this native-led course.",
      price: 49.99,
      lessons: {
        create: [
          {
            title: "Introduction to the Course",
            videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Placeholder
            content: "Welcome to Lamed English! In this lesson, we outline your path to fluency.",
            order: 1,
          },
          {
            title: "The 5 Core Tenses",
            videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            content: "Master the tenses that native speakers actually use every day.",
            order: 2,
          },
          {
            title: "Common Idioms in Business",
            videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            content: "Learn how to sound professional in meetings and emails.",
            order: 3,
          },
        ],
      },
    },
  })

  console.log({ course })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })