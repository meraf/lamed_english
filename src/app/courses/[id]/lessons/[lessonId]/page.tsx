export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { 
  ChevronLeft, 
  ChevronRight, 
  PlayCircle, 
  CheckCircle2, 
  BookOpen, 
  FileText, 
  PenTool, 
  Award, 
  Calendar,
  Clock 
} from "lucide-react";
import Link from "next/link";
import CompleteButton from "@/app/components/CompleteButton";

type PageProps = {
  params: Promise<{ id: string; lessonId: string }>;
  searchParams: Promise<{ tab?: string }>;
};

export default async function LessonPage({ params, searchParams }: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  const courseUrlId = resolvedParams.id;
  const lessonUrlId = resolvedParams.lessonId;
  const activeTab = resolvedSearchParams.tab || "video"; // Default tab is video

  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) redirect("/api/auth/signin");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true }
  });

  if (!user) redirect("/api/auth/signin");

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

  if (!lesson) notFound();

  const userProgress = await prisma.userProgress.findMany({
    where: { userId: user.id },
    select: { lessonId: true }
  });

  const completedLessonIds = new Set(userProgress.map(p => p.lessonId));
  const isCompleted = completedLessonIds.has(lessonUrlId);

  const allLessons = lesson.course.lessons;
  const currentIndex = allLessons.findIndex(l => l.id === lessonUrlId);
  const nextLesson = allLessons[currentIndex + 1];
  const prevLesson = allLessons[currentIndex - 1];

  // Define the tabs
  const tabs = [
    { id: "video", label: "Video", icon: <PlayCircle size={14} /> },
    { id: "reading", label: "Reading", icon: <BookOpen size={14} /> },
    { id: "files", label: "Files", icon: <FileText size={14} /> },
    { id: "assignments", label: "Assignments", icon: <PenTool size={14} /> },
    { id: "exam", label: "Exam", icon: <Award size={14} /> },
  ];

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-white h-screen overflow-hidden">
      
      {/* --- SIDEBAR CURRICULUM --- */}
      <aside className="w-full lg:w-80 bg-slate-50 border-r border-slate-100 flex flex-col h-full">
        
        {/* Course Title & New Tabs Area */}
        <div className="p-6 border-b border-slate-200 bg-white">
          <Link href={`/dashboard`} className="text-[10px] font-black text-slate-400 hover:text-slate-900 flex items-center gap-1 mb-4 tracking-widest uppercase">
            <ChevronLeft size={14}/> BACK TO COURSE LIST
          </Link>
          <h2 className="font-black text-slate-900 leading-tight mb-4">{lesson.course.title}</h2>

          {/* THE INTERACTIVE TABS (Exactly where your red arrow was) */}
          <div className="flex flex-wrap gap-1.5">
            {tabs.map((tab) => (
              <Link
                key={tab.id}
                href={`?tab=${tab.id}`}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${
                  activeTab === tab.id 
                    ? "bg-slate-900 text-white shadow-md scale-105" 
                    : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                }`}
              >
                {tab.icon} {tab.label}
              </Link>
            ))}
          </div>
        </div>
        
        {/* Scrollable Lesson List */}
        <nav className="p-4 space-y-2 flex-1 overflow-y-auto custom-scrollbar">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2 mb-2">Lessons</p>
          {allLessons.map((l, idx) => {
            const isActive = l.id === lessonUrlId;
            const isDone = completedLessonIds.has(l.id);

            return (
              <Link 
                key={l.id} 
                href={`/courses/${courseUrlId}/lessons/${l.id}?tab=${activeTab}`}
                className={`flex items-center justify-between p-4 rounded-2xl text-sm font-bold transition-all ${
                  isActive ? "bg-slate-900 text-white shadow-lg" : "text-slate-500 hover:bg-white hover:shadow-sm"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 ${
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

        {/* LIVE CLASS CALENDAR (Always at bottom) */}
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-blue-600">
              <Calendar size={16} />
              <span className="text-[10px] font-black uppercase tracking-wider">Next Live Class</span>
            </div>
            <div className="space-y-1 mb-3">
              <p className="text-xs font-black text-slate-900">Feb 24, 2026 • 10:00 AM</p>
              <p className="text-[10px] text-slate-500 font-bold leading-tight">IELTS Speaking Strategies</p>
            </div>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black py-2 rounded-xl transition-all active:scale-95 shadow-md">
              JOIN ZOOM MEETING
            </button>
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-grow overflow-y-auto bg-slate-50/30">
        <div className="max-w-5xl mx-auto p-6 md:p-12">
          
          {/* Conditional Content: Only show Video if Video tab is active */}
          {activeTab === "video" ? (
            <div className="aspect-video bg-slate-900 rounded-[2.5rem] mb-8 overflow-hidden shadow-2xl flex items-center justify-center relative border border-slate-200">
              {lesson.videoUrl ? (
                <iframe 
                  className="w-full h-full" 
                  src={lesson.videoUrl.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/")} 
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen 
                />
              ) : (
                <div className="text-center text-slate-500">
                  <PlayCircle size={64} className="mb-4 mx-auto opacity-20" />
                  <p className="font-bold text-xs uppercase tracking-widest">Video coming soon</p>
                </div>
              )}
            </div>
          ) : (
            /* Content for Reading, Files, etc. */
            <div className="bg-white p-16 rounded-[2.5rem] mb-8 border border-slate-200 shadow-sm text-center">
               <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-400">
                 {tabs.find(t => t.id === activeTab)?.icon}
               </div>
               <h2 className="text-2xl font-black text-slate-900 mb-2">{tabs.find(t => t.id === activeTab)?.label} Material</h2>
               <p className="text-slate-500">Content for the {activeTab} section is currently being updated for this lesson.</p>
            </div>
          )}

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">{lesson.title}</h1>
              <p className="text-slate-500 font-medium">Module {currentIndex + 1} of {allLessons.length}</p>
            </div>
            <CompleteButton lessonId={lessonUrlId} isCompleted={isCompleted} />
          </div>

          <div className="prose prose-slate max-w-none border-t border-slate-100 pt-8 text-slate-600 text-lg leading-relaxed">
            {lesson.content || "Welcome to the lesson! Use the curriculum to navigate."}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-20 pt-8 border-t border-slate-100 mb-12">
             {prevLesson ? (
               <Link href={`/courses/${courseUrlId}/lessons/${prevLesson.id}?tab=${activeTab}`} className="flex items-center gap-2 font-black text-slate-400 hover:text-slate-900 transition-all text-sm tracking-widest">
                 <ChevronLeft size={20}/> PREVIOUS
               </Link>
             ) : <div />}
             
             {nextLesson ? (
               <Link href={`/courses/${courseUrlId}/lessons/${nextLesson.id}?tab=${activeTab}`} className="flex items-center gap-2 font-black text-slate-900 hover:text-blue-600 transition-all text-sm tracking-widest">
                 NEXT <ChevronRight size={20}/>
               </Link>
             ) : <div />}
          </div>
        </div>
      </main>


    </div>
  );
}