import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { PlayCircle, ChevronLeft, BookOpen, Clock } from "lucide-react";

// Helper to convert YouTube/Vimeo links to Embed links
function getEmbedUrl(url: string) {
  if (!url) return "";
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    const videoId = url.includes("v=") ? url.split("v=")[1].split("&")[0] : url.split("youtu.be/")[1];
    return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
  }
  if (url.includes("vimeo.com")) {
    const videoId = url.split("vimeo.com/")[1];
    return `https://player.vimeo.com/video/${videoId}`;
  }
  return url;
}

export default async function LearnPage({ params, searchParams }: any) {
  // 1. Get IDs from URL (using await for Next.js 15 compatibility)
  const { courseId } = await params;
  const { lessonId } = await searchParams;

  // 2. Fetch Course & Lessons
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: { lessons: { orderBy: { order: 'asc' } } }
  });

  if (!course) return <div className="p-20 text-center font-black">Course not found.</div>;

  // 3. Set Active Lesson (either from URL or first in list)
  const activeLesson = lessonId 
    ? course.lessons.find(l => l.id === lessonId) 
    : course.lessons[0];

  if (!activeLesson) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-6">
        <h1 className="text-2xl font-black mb-4">No lessons in this course yet.</h1>
        <Link href="/dashboard" className="bg-yellow-400 text-slate-900 px-6 py-2 rounded-xl font-bold">Return to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 flex flex-col lg:flex-row">
      
      {/* --- VIDEO AREA --- */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <div className="p-4 bg-[#1e293b] border-b border-slate-800 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-xs font-black text-slate-400 hover:text-white transition-all uppercase tracking-widest">
            <ChevronLeft size={16} /> Exit Classroom
          </Link>
          <span className="text-xs font-black text-yellow-400 uppercase tracking-tighter">{course.title}</span>
        </div>

        {/* Player Container */}
        
        <div className="w-full aspect-video bg-black shadow-2xl overflow-hidden rounded-xl">
  {activeLesson.videoUrl ? (
    <iframe 
      src={getEmbedUrl(activeLesson.videoUrl)} 
      className="w-full h-full" 
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen 
    />
  ) : (
    <div className="flex items-center justify-center h-full text-slate-500 font-bold">
      No video available for this lesson
    </div>
  )}
</div>


        {/* Lesson Description Area */}
        <div className="p-8 md:p-12 max-w-4xl">
          <h1 className="text-3xl font-black text-white tracking-tight mb-4">{activeLesson.title}</h1>
          <div className="flex items-center gap-4 mb-6">
            <span className="px-3 py-1 bg-slate-800 rounded-full text-[10px] font-black uppercase text-yellow-500 border border-slate-700">
              Module {activeLesson.order}
            </span>
          </div>
          <p className="text-slate-400 leading-relaxed font-medium text-lg">
            Focus on the video above. Take notes and prepare any questions for your instructor. 
            Consistency is the key to mastering English.
          </p>
        </div>
      </div>

      {/* --- PLAYLIST SIDEBAR --- */}
      <div className="w-full lg:w-[400px] bg-[#1e293b] border-l border-slate-800 flex flex-col h-screen overflow-hidden">
        <div className="p-6 border-b border-slate-800 bg-[#1e293b]/50">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen size={16} className="text-yellow-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Curriculum</span>
          </div>
          <h2 className="font-black text-white text-lg leading-tight">{course.title}</h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          {course.lessons.map((lesson, index) => {
            const isActive = lesson.id === activeLesson.id;
            return (
              <Link 
                key={lesson.id}
                href={`/learn/${courseId}?lessonId=${lesson.id}`}
                className={`flex items-center gap-4 p-5 border-b border-slate-800/50 transition-all ${isActive ? 'bg-slate-800/50 border-l-4 border-l-yellow-400 shadow-inner' : 'hover:bg-slate-800/30 border-l-4 border-l-transparent'}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-black text-sm ${isActive ? 'bg-yellow-400 text-slate-900' : 'bg-slate-700 text-slate-400'}`}>
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`text-sm font-bold truncate ${isActive ? 'text-white' : 'text-slate-400'}`}>
                    {lesson.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                     <PlayCircle size={12} className={isActive ? 'text-yellow-400' : 'text-slate-600'} />
                     <span className={`text-[9px] font-bold uppercase tracking-widest ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>Session Video</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
