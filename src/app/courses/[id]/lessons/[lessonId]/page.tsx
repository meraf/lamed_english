import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle, Lock, PlayCircle, SkipForward } from "lucide-react";

export default async function LessonPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  // NEXT.JS 15 FIX: Must await params
  const { id } = await params;

  const lesson = await prisma.lesson.findUnique({
    where: { id: id },
    include: {
      course: {
        include: {
          lessons: {
            orderBy: { order: "asc" }
          }
        }
      }
    }
  });

  if (!lesson) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Top Navigation Bar */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[1800px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link href={`/courses/${lesson.courseId}`} className="flex items-center gap-2 text-slate-400 hover:text-yellow-400 transition-colors">
            <ArrowLeft size={18} />
            <span className="text-sm font-bold tracking-tight uppercase">Back to Course</span>
          </Link>
          <div className="text-center hidden md:block">
            <p className="text-[10px] text-yellow-500 font-black uppercase tracking-[0.2em]">{lesson.course.title}</p>
            <h1 className="text-sm font-bold text-slate-200">{lesson.title}</h1>
          </div>
          <button className="bg-yellow-400 text-slate-900 px-4 py-1.5 rounded-lg font-bold text-xs hover:bg-yellow-300 transition-all flex items-center gap-2">
            COMPLETE <CheckCircle size={14} />
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden">
        
        {/* Left Side: Video Player Area */}
        <main className="flex-grow overflow-y-auto bg-black flex flex-col items-center justify-center p-4 lg:p-12">
          {/* The "Video" Placeholder */}
          <div className="w-full max-w-5xl aspect-video bg-slate-900 rounded-3xl border border-slate-800 flex flex-col items-center justify-center shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <PlayCircle size={80} className="text-yellow-400 opacity-20 group-hover:opacity-100 transition-all group-hover:scale-110" />
            <p className="mt-4 text-slate-500 font-medium group-hover:text-slate-300">Video player would load here...</p>
          </div>

          <div className="w-full max-w-5xl mt-10">
            <h2 className="text-3xl font-black mb-4">{lesson.title}</h2>
            <div className="flex items-center gap-4 text-slate-400 text-sm mb-8">
              <span className="bg-slate-800 px-3 py-1 rounded-md border border-slate-700 font-bold uppercase text-[10px]">Lesson {lesson.order}</span>
              <span className="w-1.5 h-1.5 bg-slate-700 rounded-full"></span>
              <span>15 Minutes Duration</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-lg">
              In this lesson, we dive deep into the core concepts. Make sure to download the resources attached below to follow along with the exercises.
            </p>
          </div>
        </main>

        {/* Right Side: Sidebar Curriculum */}
        <aside className="w-full lg:w-[400px] border-l border-slate-800 bg-slate-900/30 overflow-y-auto">
          <div className="p-6 border-b border-slate-800 bg-slate-900/50">
            <h3 className="font-black text-sm uppercase tracking-widest text-slate-200">Course Content</h3>
          </div>
          <div className="flex flex-col">
            {lesson.course.lessons.map((item, index) => {
              const isActive = item.id === id;
              return (
                <Link 
                  key={item.id} 
                  href={`/lessons/${item.id}`}
                  className={`flex items-center gap-4 p-5 transition-all border-b border-slate-800/50 group ${
                    isActive ? 'bg-yellow-400/10 border-l-4 border-l-yellow-400' : 'hover:bg-slate-800/50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${
                    isActive ? 'bg-yellow-400 text-slate-900' : 'bg-slate-800 text-slate-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-grow">
                    <p className={`text-sm font-bold ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                      {item.title}
                    </p>
                    <p className="text-[10px] text-slate-600 font-bold uppercase mt-1">12:45</p>
                  </div>
                  {!isActive && <Lock size={14} className="text-slate-700" />}
                </Link>
              );
            })}
          </div>
        </aside>

      </div>
    </div>
  );
}