import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { PlayCircle, ChevronLeft, BookOpen } from "lucide-react";

// Helper to convert YouTube/Vimeo links to Embed links
// Updated to accept string | null to match Prisma types
function getEmbedUrl(url: string | null) {
  if (!url) return "";
  
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
  
  return url;
}

interface PageProps {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ lessonId?: string }>;
}

export default async function LearnPage({ params, searchParams }: PageProps) {
  // 1. Await params for Next.js 15 compatibility
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  const courseId = resolvedParams.courseId;
  const lessonId = resolvedSearchParams.lessonId;

  // 2. Fetch Course & Lessons
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: { lessons: { orderBy: { order: 'asc' } } }
  });

  if (!course) {
    return (
      <div className="p-20 text-center flex flex-col items-center gap-4">
        <h1 className="text-2xl font-black">Course not found.</h1>
        <Link href="/dashboard" className="text-blue-500 underline">Back to Dashboard</Link>
      </div>
    );
  }

  // 3. Set Active Lesson
  const activeLesson = lessonId 
    ? course.lessons.find(l => l.id === lessonId) 
    : course.lessons[0];

  if (!activeLesson) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center text-white p-6">
        <h1 className="text-2xl font-black mb-4 uppercase italic">No lessons in this course yet.</h1>
        <Link href="/dashboard" className="bg-yellow-400 text-slate-900 px-6 py-2 rounded-xl font-black border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 flex flex-col lg:flex-row">
      
      {/* --- VIDEO AREA --- */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <div className="p-4 bg-[#1e293b] border-b border-slate-800 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-white transition-all uppercase tracking-[0.2em]">
            <ChevronLeft size={14} /> Exit Classroom
          </Link>
          <span className="text-[10px] font-black text-yellow-400 uppercase tracking-widest">{course.title}</span>
        </div>

        {/* Player Container */}
        <div className="w-full aspect-video bg-black shadow-2xl relative">
          {activeLesson.videoUrl ? (
            <iframe 
              src={getEmbedUrl(activeLesson.videoUrl)} 
              className="w-full h-full" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen 
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-2">
              <PlayCircle size={48} className="opacity-20" />
              <p className="font-black uppercase tracking-tighter italic">No video available for this session</p>
            </div>
          )}
        </div>

        {/* Lesson Description Area */}
        <div className="p-8 md:p-12 max-w-4xl">
          <div className="flex items-center gap-4 mb-4">
            <span className="px-3 py-1 bg-yellow-400/10 rounded-lg text-[10px] font-black uppercase text-yellow-500 border border-yellow-400/20">
              Module {activeLesson.order}
            </span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic mb-6">
            {activeLesson.title}
          </h1>
          
          <div className="prose prose-invert max-w-none">
            <p className="text-slate-400 leading-relaxed font-medium text-lg border-l-4 border-slate-700 pl-6 italic">
              {activeLesson.content || "Focus on the video above. Take notes and prepare any questions for your instructor. Consistency is the key to mastering English."}
            </p>
          </div>
        </div>
      </div>

      {/* --- PLAYLIST SIDEBAR --- */}
      <div className="w-full lg:w-[400px] bg-[#1e293b] border-l border-slate-800 flex flex-col h-screen overflow-hidden">
        <div className="p-6 border-b border-slate-800 bg-[#1e293b]/50">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen size={16} className="text-yellow-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Curriculum</span>
          </div>
          <h2 className="font-black text-white text-lg leading-tight uppercase italic">{course.title}</h2>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
          {course.lessons.map((lesson, index) => {
            const isActive = lesson.id === activeLesson.id;
            return (
              <Link 
                key={lesson.id}
                href={`/learn/${courseId}?lessonId=${lesson.id}`}
                className={`flex items-center gap-4 p-5 border-b border-slate-800/50 transition-all ${
                  isActive 
                    ? 'bg-slate-800/80 border-l-4 border-l-yellow-400' 
                    : 'hover:bg-slate-800/30 border-l-4 border-l-transparent'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-sm border-2 ${
                  isActive 
                    ? 'bg-yellow-400 text-slate-900 border-slate-900 shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)]' 
                    : 'bg-slate-700 text-slate-400 border-slate-800'
                }`}>
                  {String(index + 1).padStart(2, '0')}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`text-sm font-black truncate uppercase italic ${isActive ? 'text-white' : 'text-slate-400'}`}>
                    {lesson.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                     <PlayCircle size={12} className={isActive ? 'text-yellow-400' : 'text-slate-600'} />
                     <span className={`text-[9px] font-black uppercase tracking-widest ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>
                        {isActive ? 'Currently Watching' : 'Session Video'}
                     </span>
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
