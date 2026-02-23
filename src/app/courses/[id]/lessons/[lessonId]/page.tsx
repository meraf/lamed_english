export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import FileViewSection from "@/app/components/FileViewSection";
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
  RefreshCcw // Added for resubmission
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

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonUrlId },
    include: {
      course: {
        include: {
          lessons: { orderBy: { order: 'asc' } },
          announcements: { orderBy: { createdAt: 'desc' } },
          enrollments: {
            where: { user: { email: session.user.email } },
            select: { 
              user: {
                select: {
                  id: true,
                  progress: { select: { lessonId: true } }
                }
              }
            }
          }
        }
      },
      materials: { 
        include: { 
          progress: { where: { user: { email: session.user.email } } } 
        } 
      },
      exams: { 
        include: { 
          results: { where: { user: { email: session.user.email } } } 
        } 
      },
      assignments: { 
        include: { 
          submissions: { where: { user: { email: session.user.email } } } 
        } 
      }
    }
  });

  if (!lesson) notFound();

  const enrollment = lesson.course.enrollments[0];
  const user = enrollment?.user;
  if (!user) redirect("/api/auth/signin");

  const completedLessonIds = new Set(user.progress.map((p) => p.lessonId));
  const isCurrentLessonDone = completedLessonIds.has(lessonUrlId);
  const allLessons = lesson.course.lessons;
  const currentIndex = allLessons.findIndex((l) => l.id === lessonUrlId);
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
      {/* SIDEBAR */}
      <aside className="w-full lg:w-80 bg-slate-50 border-r border-slate-100 flex flex-col h-full shrink-0">
        <div className="p-6 border-b border-slate-200 bg-white">
          <Link href={`/dashboard`} className="text-[10px] font-black text-slate-400 hover:text-slate-900 flex items-center gap-1 mb-4 tracking-widest uppercase">
            <ChevronLeft size={14}/> BACK TO DASHBOARD
          </Link>
          <h2 className="font-black text-slate-900 leading-tight mb-4 uppercase tracking-tighter text-lg">
            {lesson.course?.title}
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {tabs.map((tab) => (
              <Link key={tab.id} href={`/courses/${courseUrlId}/lessons/${lessonUrlId}?tab=${tab.id}`} className={`group flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === tab.id ? "bg-slate-900 text-white shadow-md" : "bg-slate-100 text-slate-400 hover:bg-slate-200"}`}>
                {tab.icon} <span>{tab.label}</span>
              </Link>
            ))}
          </div>
        </div>
        <nav className="p-4 space-y-2 flex-1 overflow-y-auto custom-scrollbar">
          {allLessons.map((l, idx) => (
            <Link key={l.id} href={`/courses/${courseUrlId}/lessons/${l.id}?tab=${activeTab}`} className={`flex items-center justify-between p-3 rounded-xl transition-all ${l.id === lessonUrlId ? "bg-white shadow-sm border border-slate-200" : "hover:bg-slate-100"}`}>
              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-black ${l.id === lessonUrlId ? "text-slate-900" : "text-slate-400"}`}>{(idx + 1).toString().padStart(2, '0')}</span>
                <span className={`text-xs font-bold ${l.id === lessonUrlId ? "text-slate-900" : "text-slate-500"}`}>{l.title}</span>
              </div>
              {completedLessonIds.has(l.id) && <CheckCircle2 size={14} className="text-green-500" />}
            </Link>
          ))}
        </nav>
      </aside>

      {/* MAIN CONTENT - Added KEY to force refresh */}
      <main key={lessonUrlId} className="flex-grow overflow-y-auto bg-slate-50/30">
        <div className="max-w-6xl mx-auto p-6 md:p-12">
          
          <div className="mb-12">
            {activeTab === "video" && (
              <div className="aspect-video bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-200">
                {lesson.videoUrl ? (
                  <iframe 
                    key={lesson.videoUrl} // Force iframe reload
                    className="w-full h-full" 
                    src={lesson.videoUrl.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/")} 
                    allowFullScreen 
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500">
                    <PlayCircle size={48} className="mb-2 opacity-20" />
                    <p className="font-bold text-xs uppercase">No video uploaded</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "exam" && (
              <div className="space-y-10">
                <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Module Exams</h2>
                {lesson.exams.map((exam) => {
                  const result = exam.results[0];
                  return (
                    <div key={exam.id} className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                      <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col h-[500px]">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Exam Instructions</h3>
{/* Replace the old description line with this */}
<p className="text-slate-700 text-sm font-medium leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
  Please complete this exam for {exam.title}. Ensure all questions are answered before submission.
</p>
                      </div>

                      <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-6">{exam.title}</h3>
                        {!result ? (
                          <form action="/api/exams/submit" method="POST" encType="multipart/form-data" className="space-y-4">
                            <input type="hidden" name="examId" value={exam.id} />
                            <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center">
                              <p className="text-[10px] font-black uppercase text-slate-400 mb-3">Upload Exam Answer (PDF/Image)</p>
                              <input type="file" name="file" required className="text-xs w-full cursor-pointer"/>
                            </div>
                            <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all">Submit Exam</button>
                          </form>
                        ) : (
                          <div className="text-center p-10 bg-green-50/50 rounded-3xl border border-green-100">
                            <CheckCircle2 size={56} className="text-green-500 mx-auto mb-4" />
                            <p className="font-black uppercase text-slate-900">Exam Submitted</p>
                            <p className="text-xs text-slate-500 mt-2">Score: {result.score ?? "Waiting for grading"}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === "assignments" && (
              <div className="space-y-10">
                <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Assignments</h2>
                {lesson.assignments.map((ass) => {
                  const submission = ass.submissions[0];
                  return (
                    <div key={ass.id} className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                      <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
                        <h3 className="text-lg font-black uppercase tracking-tighter mb-2">{ass.title}</h3>
                        <p className="text-slate-600 text-sm leading-relaxed">{ass.description || "No specific instructions provided."}</p>
                      </div>

                      <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                        {!submission ? (
                          <form action="/api/assignments/submit" method="POST" encType="multipart/form-data" className="space-y-6">
                            <input type="hidden" name="assignmentId" value={ass.id} />
                            <div className="border-4 border-dashed border-slate-100 rounded-[2rem] p-8 text-center hover:bg-slate-50 transition-colors">
                              <PenTool size={32} className="text-slate-200 mx-auto mb-4" />
                              <input type="file" name="file" required className="text-xs w-full"/>
                            </div>
                            <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all">Upload Work</button>
                          </form>
                        ) : (
                          <div className="text-center p-8 bg-blue-50/50 rounded-3xl border border-blue-100">
                            <CheckCircle2 size={40} className="text-blue-500 mx-auto mb-4" />
                            <p className="font-black uppercase text-slate-900">Submitted</p>
{/* Change the href to use a nullish coalescing operator */}
<a 
  href={submission.fileUrl ?? "#"} 
  target="_blank" 
  className="text-[10px] font-black text-blue-600 uppercase mt-4 block hover:underline"
>
  View Your File
</a>
                            {/* Allow Resubmission */}
                            <form action="/api/assignments/delete" method="POST" className="mt-4">
                                <input type="hidden" name="submissionId" value={submission.id} />
                                <button type="submit" className="text-[9px] flex items-center gap-1 mx-auto text-slate-400 hover:text-red-500 font-black uppercase"><RefreshCcw size={10}/> Resubmit</button>
                            </form>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === "reading" && (
              <div className="bg-white p-10 md:p-16 rounded-[2.5rem] border border-slate-200 shadow-sm">
                <h2 className="text-3xl font-black text-slate-900 mb-6 uppercase tracking-tighter">Lesson Notes</h2>
                <div className="prose prose-slate max-w-none text-slate-600 text-lg leading-relaxed mb-10 pb-10 border-b">
                  {lesson.content || "Welcome to the reading portion of this lesson."}
                </div>
              </div>
            )}
          </div>

          {/* Footer Navigation */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pt-8 border-t border-slate-100">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">{lesson.title}</h1>
              <p className="text-slate-400 font-bold uppercase text-[10px]">Module Progress: {currentIndex + 1} / {allLessons.length}</p>
            </div>
            {(activeTab === "video" || activeTab === "reading") && <CompleteButton lessonId={lessonUrlId} isCompleted={isCurrentLessonDone} />}
          </div>

          <div className="flex justify-between pt-8 pb-20">
             {prevLesson ? (
               <Link href={`/courses/${courseUrlId}/lessons/${prevLesson.id}?tab=${activeTab}`} className="group font-black text-slate-400 hover:text-slate-900 text-[10px] tracking-widest uppercase flex items-center gap-2">
                 <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white"><ChevronLeft size={18}/></div> PREVIOUS
               </Link>
             ) : <div />}
             {nextLesson ? (
               <Link href={`/courses/${courseUrlId}/lessons/${nextLesson.id}?tab=${activeTab}`} className="group font-black text-slate-900 hover:text-blue-600 text-[10px] tracking-widest uppercase flex items-center gap-2">
                 NEXT <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center group-hover:bg-blue-600"><ChevronRight size={18}/></div>
               </Link>
             ) : <div />}
          </div>
        </div>
      </main>
    </div>
  );
}