import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { PlayCircle, ChevronLeft, BookOpen, Video } from "lucide-react";

// In Next.js 15/16, params and searchParams must be treated as Promises
interface CoursePageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ lessonId?: string }>;
}

function getEmbedUrl(url: string) {
  if (!url) return "";
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    const videoId = url.includes("v=") 
      ? url.split("v=")[1].split("&")[0] 
      : url.split("youtu.be/")[1];
    return `https://www.youtube.com/embed/${videoId}?rel=0`;
  }
  return url;
}

export default async function CourseClassroomPage({ params, searchParams }: CoursePageProps) {
  // 1. AWAIT the params to extract the ID
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  // 2. Use 'resolvedParams.id' (matching your folder name [id])
  const course = await prisma.course.findUnique({
    where: { 
      id: resolvedParams.id 
    },
    include: {
      lessons: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!course) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h2 className="text-2xl font-black text-slate-900">Course not found</h2>
          <Link href="/dashboard" className="text-blue-600 font-bold hover:underline">Return to Dashboard</Link>
        </div>
      </div>
    );
  }

  // 3. Select the lesson to display
  const activeLesson = resolvedSearchParams.lessonId 
    ? course.lessons.find((l) => l.id === resolvedSearchParams.lessonId) 
    : course.lessons[0];

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row">
      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-xs font-black uppercase text-slate-400 hover:text-white transition-all">
            <ChevronLeft size={16} /> Dashboard
          </Link>
          <span className="text-xs font-bold text-slate-400 truncate max-w-[200px]">{course.title}</span>
        </div>

        {activeLesson ? (
          <>
            <div className="bg-black aspect-video w-full">
              <iframe 
                src={getEmbedUrl(activeLesson.videoUrl)} 
                className="w-full h-full" 
                allowFullScreen 
              />
            </div>
            <div className="p-8 max-w-4xl">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-4">{activeLesson.title}</h1>
              <p className="text-slate-500 font-medium leading-relaxed">
                Welcome to this session. Focus on the core concepts and take notes.
              </p>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <Video size={48} className="mb-4 opacity-20" />
            <p className="font-bold">No lessons uploaded yet.</p>
          </div>
        )}
      </div>

      {/* --- SIDEBAR --- */}
      <div className="w-full lg:w-96 border-l border-slate-200 h-screen overflow-y-auto sticky top-0 bg-slate-50">
        <div className="p-6 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen size={16} className="text-blue-600" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Course Lessons</span>
          </div>
          <h2 className="font-black text-slate-900 text-lg leading-tight">{course.title}</h2>
        </div>

        <div className="divide-y divide-slate-100">
          {course.lessons.map((lesson, index) => {
            const isActive = lesson.id === activeLesson?.id;
            return (
              <Link 
                key={lesson.id}
                href={`/courses/${resolvedParams.id}?lessonId=${lesson.id}`}
                className={`flex items-start gap-4 p-5 transition-all ${
                  isActive ? "bg-white border-l-4 border-l-blue-600 shadow-sm" : "hover:bg-slate-100 border-l-4 border-l-transparent"
                }`}
              >
                <div className={`mt-1 ${isActive ? "text-blue-600" : "text-slate-300"}`}>
                  <PlayCircle size={20} fill={isActive ? "currentColor" : "none"} />
                </div>
                <div>
                  <h4 className={`text-sm font-bold leading-tight ${isActive ? "text-slate-900" : "text-slate-500"}`}>
                    {index + 1}. {lesson.title}
                  </h4>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}