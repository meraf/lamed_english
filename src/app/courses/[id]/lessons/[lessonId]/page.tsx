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
  const activeTab = resolvedSearchParams.tab || "video";

  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) redirect("/api/auth/signin");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true }
  });

  if (!user) redirect("/api/auth/signin");

  // 1. DATA FETCHING (Optimized to prevent Connection Pool Timeout)
  // Removed the unused _count queries to make this even faster
  const [lesson, userProgress, announcements] = await Promise.all([
    prisma.lesson.findUnique({
      where: { id: lessonUrlId }, 
      include: {
        course: {
          include: {
            lessons: { orderBy: { order: 'asc' } }
          }
        },
        exams: {
          include: { results: { where: { userId: user.id } } }
        },
        assignments: {
          include: { submissions: { where: { userId: user.id } } }
        }
      }
    }),
    prisma.userProgress.findMany({
      where: { userId: user.id },
      select: { lessonId: true }
    }),
    prisma.announcement.findMany({
      where: { courseId: courseUrlId },
      orderBy: { createdAt: 'desc' }
    })
  ]);

  if (!lesson) notFound();

  const completedLessonIds = new Set(userProgress.map(p => p.lessonId));
  const isCurrentLessonDone = completedLessonIds.has(lessonUrlId);
  
  const allLessons = lesson.course.lessons;
  const currentIndex = allLessons.findIndex(l => l.id === lessonUrlId);
  const nextLesson = allLessons[currentIndex + 1];
  const prevLesson = allLessons[currentIndex - 1];

  const tabs = [
    { id: "video", label: "Video", icon: <PlayCircle size={14} /> },
    { id: "reading", label: "Reading", icon: <BookOpen size={14} /> },
    { id: "exam", label: "Exam", icon: <Award size={14} /> },
    { id: "assignments", label: "Assignments", icon: <PenTool size={14} /> },
    { id: "announcements", label: "News", icon: <FileText size={14} /> },
  ];

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-white h-screen overflow-hidden">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-full lg:w-80 bg-slate-50 border-r border-slate-100 flex flex-col h-full shrink-0">
        <div className="p-6 border-b border-slate-200 bg-white">
          <Link href={`/dashboard`} className="text-[10px] font-black text-slate-400 hover:text-slate-900 flex items-center gap-1 mb-4 tracking-widest uppercase">
            <ChevronLeft size={14}/> BACK TO DASHBOARD
          </Link>
          <h2 className="font-black text-slate-900 leading-tight mb-4 uppercase tracking-tighter text-lg">{lesson.course.title}</h2>

          <div className="flex flex-wrap gap-1.5">
            {tabs.map((tab) => (
              <Link
                key={tab.id}
                href={`?tab=${tab.id}`}
                className={`group flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${
                  activeTab === tab.id 
                    ? "bg-slate-900 text-white shadow-md scale-105" 
                    : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  {tab.icon} 
                  <span>{tab.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
        
        <nav className="p-4 space-y-2 flex-1 overflow-y-auto custom-scrollbar">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2 mb-2">Curriculum</p>
          {allLessons.map((l, idx) => {
            const isActive = l.id === lessonUrlId;
            const isDone = completedLessonIds.has(l.id);
            return (
              <Link 
                key={l.id} 
                href={`/courses/${courseUrlId}/lessons/${l.id}?tab=${activeTab}`}
                className={`flex items-center justify-between p-4 rounded-2xl text-sm font-bold transition-all ${
                  isActive ? "bg-slate-900 text-white shadow-lg scale-[1.02]" : "text-slate-500 hover:bg-white hover:shadow-sm"
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

        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-blue-600">
              <Calendar size={16} />
              <span className="text-[10px] font-black uppercase tracking-wider">Next Live Class</span>
            </div>
            <p className="text-xs font-black text-slate-900">Feb 24 • 10:00 AM</p>
            <button className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black py-2 rounded-xl transition-all active:scale-95 shadow-md">
              JOIN ZOOM
            </button>
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-grow overflow-y-auto bg-slate-50/30">
        <div className="max-w-5xl mx-auto p-6 md:p-12">
          
          <div className="mb-12 min-h-[400px]">
            {activeTab === "video" && (
              <div className="aspect-video bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-200">
                {lesson.videoUrl ? (
                  <iframe 
                    className="w-full h-full" 
                    src={lesson.videoUrl.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/")} 
                    allowFullScreen 
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500">
                    <PlayCircle size={48} className="mb-2 opacity-20" />
                    <p className="font-bold text-xs uppercase tracking-widest">No video uploaded</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "reading" && (
              <div className="bg-white p-10 md:p-16 rounded-[2.5rem] border border-slate-200 shadow-sm">
                <h2 className="text-3xl font-black text-slate-900 mb-6 uppercase tracking-tighter">Lesson Notes</h2>
                <div className="prose prose-slate max-w-none text-slate-600 text-lg leading-relaxed">
                  {lesson.content || "Welcome to the text portion of this lesson."}
                </div>
              </div>
            )}

            {activeTab === "exam" && (
              <div className="space-y-6">
                <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Module Exams</h2>
                {lesson.exams.length > 0 ? lesson.exams.map(exam => (
                  <div key={exam.id} className="bg-white p-8 rounded-[2rem] border border-slate-200 flex justify-between items-center shadow-sm">
                    <div>
                      <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">{exam.title}</h3>
                      <p className="text-slate-500 text-sm">Status: {exam.results.length > 0 ? "Completed" : "Not Started"}</p>
                    </div>
                    <button className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-yellow-400 hover:text-slate-900 transition-all">
                      {exam.results.length > 0 ? "View Results" : "Start Exam"}
                    </button>
                  </div>
                )) : (
                  <div className="bg-white p-20 rounded-[2.5rem] text-center border-2 border-dashed border-slate-200 text-slate-400">
                    <Award size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="font-bold uppercase text-[10px]">No exams for this module</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "assignments" && (
              <div className="space-y-6">
                <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Assignments</h2>
                {lesson.assignments.length > 0 ? lesson.assignments.map(ass => (
                  <div key={ass.id} className="bg-white p-8 rounded-[2rem] border border-slate-200 flex justify-between items-center shadow-sm">
                    <div>
                      <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">{ass.title}</h3>
                      <p className="text-slate-500 text-sm">Status: {ass.submissions.length > 0 ? "Submitted" : "Pending"}</p>
                    </div>
                    <button className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all">
                      {ass.submissions.length > 0 ? "Review Work" : "Submit Work"}
                    </button>
                  </div>
                )) : (
                  <div className="bg-white p-20 rounded-[2.5rem] text-center border-2 border-dashed border-slate-200 text-slate-400">
                    <PenTool size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="font-bold uppercase text-[10px]">No assignments for this lesson</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "announcements" && (
              <div className="space-y-6">
                <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Course Announcements</h2>
                {announcements.length > 0 ? announcements.map(ann => (
                  <div key={ann.id} className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-2">{ann.title}</h3>
                    <p className="text-slate-600 leading-relaxed">{ann.content}</p>
                  </div>
                )) : (
                  <div className="bg-white p-20 rounded-[2.5rem] text-center border-2 border-dashed border-slate-200 text-slate-400">
                    <FileText size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="font-bold uppercase text-[10px]">No announcements</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pt-8 border-t border-slate-100">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-2">{lesson.title}</h1>
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Lesson {currentIndex + 1} of {allLessons.length}</p>
            </div>
            <CompleteButton lessonId={lessonUrlId} isCompleted={isCurrentLessonDone} />
          </div>

          <div className="flex justify-between pt-8 mb-12">
             {prevLesson ? (
               <Link href={`/courses/${courseUrlId}/lessons/${prevLesson.id}?tab=${activeTab}`} className="flex items-center gap-2 font-black text-slate-400 hover:text-slate-900 transition-all text-[10px] tracking-widest uppercase">
                 <ChevronLeft size={20}/> PREVIOUS
               </Link>
             ) : <div />}
             
             {nextLesson ? (
               <Link href={`/courses/${courseUrlId}/lessons/${nextLesson.id}?tab=${activeTab}`} className="flex items-center gap-2 font-black text-slate-900 hover:text-blue-600 transition-all text-[10px] tracking-widest uppercase">
                 NEXT <ChevronRight size={20}/>
               </Link>
             ) : <div />}
          </div>
        </div>
      </main>
    </div>
  );
}