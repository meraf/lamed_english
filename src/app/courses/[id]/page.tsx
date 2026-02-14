export const dynamic = "force-dynamic"; // <--- THIS FIXES THE VERCEL ERROR

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";

interface Props {
  params: { id: string };
}

export default async function CoursePage({ params }: Props) {
  const session = await getServerSession(authOptions);
  
  // 1. Fetch Course
  const course = await prisma.course.findUnique({
    where: { id: params.id },
    include: {
      lessons: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!course) {
    return notFound();
  }

  // 2. Check if user is enrolled
  let isEnrolled = false;
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { enrollments: true },
    });
    
    // Check if any enrollment matches this course ID
    if (user?.enrollments.some((e) => e.courseId === course.id)) {
      isEnrolled = true;
    }
  }

  // 3. Logic: If enrolled, 'Resume' takes them to first lesson. If not, 'Enroll' button.
  const firstLessonId = course.lessons[0]?.id;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
        <p className="text-gray-600 mb-6">{course.description}</p>
        
        <div className="flex gap-4">
          {isEnrolled ? (
             /* RESUME BUTTON */
             <Link 
               href={firstLessonId ? `/courses/${course.id}/lessons/${firstLessonId}` : "#"}
               className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
             >
               Resume Course
             </Link>
          ) : (
             /* ENROLL BUTTON */
             <form action="/api/enroll" method="POST">
               <input type="hidden" name="courseId" value={course.id} />
               <button 
                 type="submit"
                 className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
               >
                 Enroll Now
               </button>
             </form>
          )}
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-3">Course Curriculum</h2>
          <ul className="space-y-2">
            {course.lessons.map((lesson, index) => (
              <li key={lesson.id} className="border-b py-2 flex justify-between">
                <span className="text-gray-700">
                  {index + 1}. {lesson.title}
                </span>
                {isEnrolled && (
                   <Link 
                     href={`/courses/${course.id}/lessons/${lesson.id}`}
                     className="text-blue-500 text-sm hover:underline"
                   >
                     Start
                   </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}