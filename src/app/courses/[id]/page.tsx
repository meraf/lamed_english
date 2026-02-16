import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PlayCircle, CheckCircle, Lock, ChevronLeft, Menu } from "lucide-react";

// Helper function to get clean Embed URL from YouTube/Vimeo
function getEmbedUrl(url: string) {
  if (!url) return "";
  
  // Handle YouTube
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    let videoId = "";
    if (url.includes("v=")) {
      videoId = url.split("v=")[1].split("&")[0];
    } else if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1];
    }
    return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
  }
  
  // Handle Vimeo
  if (url.includes("vimeo.com")) {
    const videoId = url.split("vimeo.com/")[1];
    return `https://player.vimeo.com/video/${videoId}`;
  }

  return url;
}

interface CoursePageProps {
  params: { courseId: string };
  searchParams: { lessonId?: string };
}

export default async function CourseClassroomPage({ params, searchParams }: CoursePageProps) {
  // 1. Fetch the Course and ALL its lessons (ordered by your 'order' number)
  const course = await prisma.course.findUnique({
    where: { id: params.courseId },
    include: {
      lessons: {
        orderBy: { order: 'asc' }
      }
    }
  });

  if (!course) {
    return <div className="p-20 text-center font-bold text-slate-400">Course not found.</div>;
  }

  // 2. Determine which lesson to show
  // If ?lessonId=... is in the URL, use that. Otherwise, use the very first lesson.
  const activeLesson = searchParams.lessonId 
    ? course.lessons.find(l => l.id === searchParams.lessonId) 
    : course.lessons[0];

  // If no lessons exist yet
  if (!activeLesson) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <h1 className="text-3xl font-black text-yellow-400 mb-4">{course.title}</h1>
        <p className="text-slate-400">No lessons have been uploaded to this course yet.</p>
        <Link href="/courses" className="mt-8 text-sm font-bold underline hover:text-white">Go Back</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      
      {/* --- LEFT SIDE: VIDEO PLAYER & CONTENT --- */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <div className="lg:hidden p-4 bg-slate-900 text-white flex items-center justify-between">
           <Link href="/courses" className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
             <ChevronLeft size={16} /> Courses
           </Link>
           <span className="font-bold truncate max-w-[200px]">{course.title}</span>
        </div>

        {/* Video Player Container */}
        <div className="bg-black aspect-video w-full relative group">
           <iframe 
             src={getEmbedUrl(activeLesson.videoUrl)} 
             className="w-full h-full absolute top-0 left-0"
             allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
             allowFullScreen
           />
        </div>

        {/* Lesson Details */}
        <div className="p-8 max-w-4xl">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              {activeLesson.title}
            </h1>
            <span className="text-xs font-bold bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full uppercase tracking-widest">
              Lesson {activeLesson.order}
            </span>
          </div>
          
          <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed">
            {/* If you add a description field to lessons later, render it here */}
            <p>Watch the video above carefully. Make sure to take notes on the new vocabulary and grammar points introduced in this session.</p>
          </div>

          {/* Navigation Buttons (Next/Prev) */}
          <div className="mt-12 flex items-center justify-between border-t border-slate-200 pt-8">
             <Link href="/courses" className="text-slate-400 hover:text-slate-900 font-bold text-sm flex items-center gap-2">
                <ChevronLeft size={16}/> Back to Course List
             </Link>
             {/* Logic for Next Lesson Button could go here */}
          </div>
        </div>
      </div>

      {/* --- RIGHT SIDE: LESSON PLAYLIST SIDEBAR --- */}
      <div className="w-full lg:w-96 bg-white border-l border-slate-200 flex flex-col h-auto lg:h-screen sticky top-0 overflow-y-auto">
        <div className="p-6 border-b border-slate-100 bg-slate-50">
          <h2 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-1">Course Content</h2>
          <h3 className="font-black text-xl text-slate-900 leading-tight">{course.title}</h3>
          <p className="text-xs font-bold text-slate-500 mt-2">{course.lessons.length} Lessons</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {course.lessons.map((lesson, index) => {
            const isActive = lesson.id === activeLesson.id;
            return (
              <Link 
                key={lesson.id} 
                href={`/courses/${course.id}?lessonId=${lesson.id}`}
                className={`group flex items-start gap-4 p-4 border-b border-slate-50 transition-all cursor-pointer ${
                  isActive 
                    ? "bg-slate-900 border-l-4 border-l-yellow-400" 
                    : "hover:bg-slate-50 border-l-4 border-l-transparent"
                }`}
              >
                <div className={`mt-1 ${isActive ? "text-yellow-400" : "text-slate-300 group-hover:text-slate-400"}`}>
                  {isActive ? <PlayCircle size={20} fill="currentColor" className="text-slate-900" /> : <PlayCircle size={20} />}
                </div>
                <div>
                  <h4 className={`text-sm font-bold leading-snug ${isActive ? "text-white" : "text-slate-700"}`}>
                    {index + 1}. {lesson.title}
                  </h4>
                  <span className={`text-[10px] uppercase font-bold tracking-wider ${isActive ? "text-slate-500" : "text-slate-400"}`}>
                    12 Mins
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

    </div>
  );
}