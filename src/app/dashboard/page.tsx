export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, CheckCircle, Clock, PlayCircle, GraduationCap } from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    redirect("/login");
  }

  // 1. Fetch User with Explicit Relationship structure
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      enrolledCourses: {
        include: {
          course: { 
            include: {
              lessons: {
                select: { id: true }
              },
              _count: {
                select: { lessons: true }
              }
            }
          }
        }
      },
      progress: {
        where: { isCompleted: true },
        orderBy: { createdAt: 'desc' }, // Order by most recent
        select: { 
          lessonId: true,
          createdAt: true // FIXED: Added this so p.createdAt works
        }
      }
    }
  });

  if (!user) redirect("/login");

  // Helper to calculate progress percentage
  const calculateProgress = (courseLessons: any[]) => {
    if (courseLessons.length === 0) return 0;
    const completedInThisCourse = courseLessons.filter(lesson => 
      user.progress.some(p => p.lessonId === lesson.id)
    ).length;
    return Math.round((completedInThisCourse / courseLessons.length) * 100);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header Section */}
      <div className="bg-slate-900 pt-32 pb-20 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <span className="text-yellow-400 font-black uppercase tracking-[0.3em] text-[10px] mb-4 block">
              Student Workspace
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter">
              Welcome back, <span className="text-slate-500">{user.name?.split(' ')[0]}</span>
            </h1>
          </div>
          <div className="flex gap-4">
            <div className="bg-white/5 backdrop-blur-md p-4 rounded-3xl border border-white/10 text-center min-w-[120px]">
              <div className="text-2xl font-black text-white">{user.enrolledCourses.length}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Courses</div>
            </div>
            <div className="bg-white/5 backdrop-blur-md p-4 rounded-3xl border border-white/10 text-center min-w-[120px]">
              <div className="text-2xl font-black text-yellow-400">{user.progress.length}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Completed</div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-8 -mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Active Courses List */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <PlayCircle size={18} /> Continue Learning
            </h2>

            {user.enrolledCourses.length > 0 ? (
              user.enrolledCourses.map((enrollment) => {
                const course = enrollment.course;
                const progressPercent = calculateProgress(course.lessons);

                return (
                  <div key={course.id} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                    <div className="flex flex-col md:flex-row gap-8 items-center">
                      <div className="w-full md:w-48 h-32 bg-slate-100 rounded-3xl overflow-hidden shrink-0 relative">
                        {course.thumbnail ? (
                          <img src={course.thumbnail} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><BookOpen className="text-slate-300" /></div>
                        )}
                        <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-transparent transition-all" />
                      </div>

                      <div className="flex-grow space-y-4">
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">{course.title}</h3>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <span>Progress</span>
                            <span>{progressPercent}%</span>
                          </div>
                          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-yellow-400 transition-all duration-1000" 
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <Link 
                            href={`/courses/${course.id}/learn`}
                            className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-yellow-400 hover:text-slate-900 transition-all shadow-lg"
                          >
                            Go to Class
                          </Link>
                          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                            {course._count.lessons} Lessons Total
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-white rounded-[3rem] p-20 text-center border-2 border-dashed border-slate-200">
                <GraduationCap size={48} className="mx-auto text-slate-200 mb-4" />
                <h3 className="text-xl font-black text-slate-400 mb-6">You aren't enrolled in any courses yet.</h3>
                <Link href="/courses" className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black hover:bg-yellow-400 hover:text-slate-900 transition-all">
                  Browse Catalog
                </Link>
              </div>
            )}
          </div>

          {/* Sidebar - Achievements/Stats */}
          <div className="space-y-8">
            <div className="bg-yellow-400 rounded-[3rem] p-10 shadow-xl shadow-yellow-400/20">
              <h3 className="text-2xl font-black text-slate-900 mb-2">Weekly Goal</h3>
              <p className="text-slate-900/60 text-xs font-bold uppercase tracking-widest mb-6">3 Lessons to go</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className={`h-12 w-full rounded-2xl border-2 ${i <= 2 ? 'bg-slate-900 border-slate-900' : 'border-slate-900/10'}`} />
                ))}
              </div>
            </div>

            <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 border-b pb-4">Recent Milestones</h3>
              <div className="space-y-6">
                {user.progress.length > 0 ? (
                  user.progress.slice(0, 3).map((p, i) => (
                    <div key={i} className="flex gap-4 items-start">
                      <div className="bg-green-100 text-green-600 p-2 rounded-xl"><CheckCircle size={16} /></div>
                      <div>
                        <p className="text-xs font-black text-slate-900">Lesson Completed</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">
                          {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'Recently'}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs font-bold text-slate-400 italic">No activity recorded yet.</p>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}