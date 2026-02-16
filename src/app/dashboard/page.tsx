export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image"; 
import { BookOpen, CheckCircle, PlayCircle, GraduationCap, ArrowRight } from "lucide-react";
import { UnenrollButton } from "@/app/components/UnenrollButton";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    redirect("/login");
  }

  // Calculate the start of the current week (Sunday or Monday)
  const now = new Date();
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      enrolledCourses: {
        include: {
          course: { 
            include: {
              lessons: { select: { id: true } },
              _count: { select: { lessons: true } }
            }
          }
        }
      },
      // Fetch ALL progress to calculate course percentages
      progress: {
        where: { isCompleted: true },
        orderBy: { createdAt: 'desc' },
        include: {
          lesson: { select: { title: true } } // Added to show lesson names in milestones
        }
      }
    }
  });

  if (!user) redirect("/login");

  // 1. REAL PROGRESS LOGIC
  const calculateProgress = (courseLessons: any[]) => {
    if (courseLessons.length === 0) return 0;
    const completedIds = new Set(user.progress.map(p => p.lessonId));
    const completedInThisCourse = courseLessons.filter(lesson => completedIds.has(lesson.id)).length;
    return Math.round((completedInThisCourse / courseLessons.length) * 100);
  };

  // 2. REAL WEEKLY GOAL LOGIC (Goal: 5 lessons per week)
  const weeklyLessons = user.progress.filter(p => new Date(p.createdAt) >= startOfWeek);
  const weeklyGoal = 5;
  const completedCount = weeklyLessons.length;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* HEADER SECTION */}
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
          
          {/* LEFT COLUMN: ENROLLED COURSES */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <PlayCircle size={18} /> Continue Learning
            </h2>

            {user.enrolledCourses.length > 0 ? (
              user.enrolledCourses.map((enrollment) => {
                const course = enrollment.course;
                const progressPercent = calculateProgress(course.lessons);
                const imageUrl = (course as any).thumbnail || (course as any).image;

                return (
                  <div key={course.id} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                    <div className="flex flex-col md:flex-row gap-8 items-center">
                      <div className="w-full md:w-48 h-32 bg-slate-100 rounded-3xl overflow-hidden shrink-0 relative">
                        {imageUrl ? (
                          <Image 
                            src={imageUrl} 
                            alt={course.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="text-slate-300" />
                          </div>
                        )}
                      </div>

                      <div className="flex-grow space-y-4 w-full">
                        <div className="flex justify-between items-start">
                          <h3 className="text-2xl font-black text-slate-900 tracking-tight">{course.title}</h3>
                          <UnenrollButton courseId={course.id} />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <span>Overall Progress</span>
                            <span>{progressPercent}%</span>
                          </div>
                          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-yellow-400 transition-all duration-1000" 
                              style={{ width: `${progressPercent}%` }} 
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-4 pt-2">
                          <Link 
                            href={`/courses/${course.id}`}
                            className="flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black hover:bg-yellow-400 hover:text-slate-900 transition-all text-sm uppercase tracking-widest"
                          >
                            Go to Class <ArrowRight size={16} />
                          </Link>
                          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                            {course._count.lessons} Lessons
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
                <h3 className="text-xl font-black text-slate-400 mb-6">No active enrollments.</h3>
                <Link href="/courses" className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black hover:bg-yellow-400 hover:text-slate-900 transition-all">
                  Browse Catalog
                </Link>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: REAL GOALS & STATS */}
          <div className="space-y-8">
            <div className="bg-yellow-400 rounded-[3rem] p-10 shadow-xl shadow-yellow-400/20">
              <h3 className="text-2xl font-black text-slate-900 mb-2">Weekly Goal</h3>
              <p className="text-slate-900/60 text-xs font-bold uppercase tracking-widest mb-6">
                {completedCount} of {weeklyGoal} lessons completed
              </p>
              <div className="flex gap-2">
                {[...Array(weeklyGoal)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-12 w-full rounded-2xl border-2 transition-colors duration-500 ${
                      i < completedCount ? 'bg-slate-900 border-slate-900' : 'border-slate-900/10'
                    }`} 
                  />
                ))}
              </div>
              {completedCount >= weeklyGoal && (
                <p className="mt-4 text-[10px] font-black uppercase text-slate-900">🔥 Goal Smashed!</p>
              )}
            </div>

            <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 border-b pb-4">Recent Milestones</h3>
              <div className="space-y-6">
                {user.progress.length > 0 ? (
                  user.progress.slice(0, 5).map((p, i) => (
                    <div key={i} className="flex gap-4 items-start">
                      <div className="bg-green-100 text-green-600 p-2 rounded-xl">
                        <CheckCircle size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900 line-clamp-1">
                          {(p as any).lesson?.title || "Lesson Completed"}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">
                          {new Date(p.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Start learning to see milestones!</p>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}