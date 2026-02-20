import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { PlayCircle, ChevronLeft, BookOpen } from "lucide-react";

// 1. Updated helper to strictly handle nulls
function getEmbedUrl(url: string | null): string {
  if (!url) return "";
  
  try {
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const videoId = url.includes("v=") 
        ? url.split("v=")[1].split("&")[0] 
        : url.split("youtu.be/")[1];
      return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
    }
    
    if (url.includes("vimeo.com")) {
      const videoId = url.split("vimeo.com/")[1];
      return `https://player.vimeo.com/video/${videoId}`;
    }
  } catch (e) {
    return "";
  }
  
  return url;
}

interface PageProps {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ lessonId?: string }>;
}

export default async function LearnPage({ params, searchParams }: PageProps) {
  // 2. Await params for Next.js 15+ compatibility
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  const courseId = resolvedParams.courseId;
  const lessonId = resolvedSearchParams.lessonId;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: { lessons: { orderBy: { order: 'asc' } } }
  });

  if (!course) return <div className="p-20 text-center font-black">Course not found.</div>;

  const activeLesson = lessonId 
    ? course.lessons.find(l => l.id === lessonId) 
    : course.lessons[0];

  if (!activeLesson) return <div className="p-20 text-center">No lessons found.</div>;

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 flex flex-col lg:flex-row">
      <div className="flex-1 flex flex-col">
        <div className="p-4 bg-[#1e293b] border-b border-slate-800 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-white uppercase tracking-widest">
            <ChevronLeft size={16} /> Exit Classroom
          </Link>
          <span className="text-[10px] font-black text-yellow-400 uppercase">{course.title}</span>
        </div>

        <div className="w-full aspect-video bg-black shadow-2xl overflow-hidden rounded-xl">
          {/* ✅ FIXED: Added null check and fallback for videoUrl */}
          {activeLesson.videoUrl ? (
            <iframe 
              src={getEmbedUrl(activeLesson.videoUrl)} 
              className="w-full h-full" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen 
            />
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500 font-bold uppercase italic">
              No video available for this lesson
            </div>
          )}
        </div>

        <div className="p-8 md:p-12 max-w-4xl">
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic mb-4">{activeLesson.title}</h1>
          <p className="text-slate-400 leading-relaxed font-medium text-lg border-l-4 border-slate-700 pl-6 italic">
            {activeLesson.content || "Take notes and prepare any questions for your instructor."}
          </p>
        </div>
      </div>

      <div className="w-full lg:w-[400px] bg-[#1e293b] border-l border-slate-800 flex flex-col h-screen overflow-hidden">
        <div className="p-6 border-b border-slate-800">
           <h2 className="font-black text-white text-lg uppercase italic">{course.title}</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {course.lessons.map((lesson, index) => {
            const isActive = lesson.id === activeLesson.id;
            return (
              <Link 
                key={lesson.id}
                href={`/learn/${courseId}?lessonId=${lesson.id}`}
                className={`flex items-center gap-4 p-5 border-b border-slate-800/50 transition-all ${isActive ? 'bg-slate-800/50 border-l-4 border-l-yellow-400' : 'hover:bg-slate-800/30 border-l-4 border-l-transparent'}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black ${isActive ? 'bg-yellow-400 text-slate-900' : 'bg-slate-700 text-slate-400'}`}>
                  {index + 1}
                </div>
                <div className="flex-1 truncate font-bold uppercase text-sm">{lesson.title}</div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
