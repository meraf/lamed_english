import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { ChevronLeft, ChevronRight, PlayCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import CompleteButton from "@/app/components/CompleteButton";

// Define the Props type for Next.js 15/16
type PageProps = {
  params: Promise<{ id: string; lessonId: string }>;
};

export default async function LessonPage({ params }: PageProps) {
  // 1. CRITICAL: Await the params to unlock the IDs
  const resolvedParams = await params;
  const courseUrlId = resolvedParams.id;
  const lessonUrlId = resolvedParams.lessonId;

  // 2. Auth Check
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true }
  });

  if (!user) redirect("/login");

  // 3. Fetch data using lessonUrlId (not 'id' which is for the course)
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonUrlId }, 
    include: {
      course: {
        include: {
          lessons: { orderBy: { order: 'asc' } }
        }
      }
    }
  });

  // If lessonUrlId is wrong/missing in DB, show 404
  if (!lesson) notFound();

  // 4. Progress Logic
  const userProgress = await prisma.userProgress.findMany({
    where: { userId: user.id },
    select: { lessonId: true }
  });

  const completedLessonIds = new Set(userProgress.map(p => p.lessonId));
  const isCompleted = completedLessonIds.has(lessonUrlId);

  // 5. Navigation Logic
  const allLessons = lesson.course.lessons;
  const currentIndex = allLessons.findIndex(l => l.id === lessonUrlId);
  const nextLesson = allLessons[currentIndex + 1];
  const prevLesson = allLessons[currentIndex - 1];

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-white">
      {/* Sidebar Curriculum */}
      <aside className="w-full lg:w-80 bg-slate-50 border-r border-slate-100 overflow-y-auto h-screen sticky top-0">
        <div className="p-6 border-b border-slate-200 bg-white">
          <Link href="/dashboard" className="text-xs font-bold text-slate-400 hover:text-slate-900 flex items-center gap-1 mb-4">
            <ChevronLeft size={14}/> BACK TO DASHBOARD
          </Link>
          <h2 className="font-black text-slate-900 leading-tight">{lesson.course.title}</h2>
        </div>
        
        <nav className="p-4 space-y-2">
          {allLessons.map((l, idx) => {
            const isActive = l.id === lessonUrlId;
            const isDone = completedLessonIds.has(l.id);

            return (
              <Link 
                key={l.id} 
                href={`/courses/${courseUrlId}/lessons/${l.id}`}
                className={`flex items-center justify-between p-4 rounded-2xl text-sm font-bold transition-all ${
                  isActive ? "bg-slate-900 text-white shadow-lg" : "text-slate-500 hover:bg-white hover:shadow-sm"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${
                    isActive ? "bg-yellow-400 text-slate-900" : isDone ? "bg-green-100 text-green-600" : "bg-slate-200"
                  }`}>
                    {isDone && !isActive ? <CheckCircle2 size={12} /> : idx + 1}
                  </div>
                  <span className="truncate w-40">{l.title}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow">
        <div className="max-w-5xl mx-auto p-6 md:p-12">
          <div className="aspect-video bg-slate-900 rounded-[2.5rem] mb-8 overflow-hidden shadow-2xl flex items-center justify-center relative">
             {lesson.videoUrl ? (
               <iframe className="w-full h-full" src={lesson.videoUrl} allowFullScreen />
             ) : (
               <div className="text-center text-slate-500">
                 <PlayCircle size={64} className="mb-4 mx-auto opacity-20" />
                 <p className="font-bold text-xs uppercase tracking-widest">Video coming soon</p>
               </div>
             )}
          </div>

          <div className="flex justify-between items-center mb-12">
            <div>
              <h1 className="text-3xl font-black text-slate-900">{lesson.title}</h1>
              <p className="text-slate-500 font-medium">Module {currentIndex + 1} of {allLessons.length}</p>
            </div>
            <CompleteButton lessonId={lessonUrlId} isCompleted={isCompleted} />
          </div>

          <div className="prose prose-slate max-w-none border-t border-slate-100 pt-8 text-slate-600 leading-relaxed">
            {lesson.content || "Welcome to the lesson! Use the curriculum to navigate."}
          </div>

          {/* Nav Buttons */}
          <div className="flex justify-between mt-20 pt-8 border-t border-slate-100">
             {prevLesson ? (
               <Link href={`/courses/${courseUrlId}/lessons/${prevLesson.id}`} className="flex items-center gap-2 font-black text-slate-400 hover:text-slate-900 transition-all">
                 <ChevronLeft size={20}/> PREVIOUS
               </Link>
             ) : <div />}
             
             {nextLesson ? (
               <Link href={`/courses/${courseUrlId}/lessons/${nextLesson.id}`} className="flex items-center gap-2 font-black text-slate-900 hover:text-yellow-600 transition-all">
                 NEXT <ChevronRight size={20}/>
               </Link>
             ) : <div />}
          </div>
        </div>
      </main>
    </div>
  );
}