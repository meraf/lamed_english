export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image"; 
import { BookOpen, CheckCircle, PlayCircle, ArrowRight } from "lucide-react";
import { UnenrollButton } from "@/app/components/UnenrollButton";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    redirect("/login");
  }

  const now = new Date();
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      enrolledCourses: {
        include: {
          course: { 
            include: {
              lessons: { orderBy: { order: 'asc' } },
              _count: { select: { lessons: true } }
            }
          }
        }
      },
      progress: {
        where: { completed: true },
        orderBy: { updatedAt: 'desc' },
        include: {
          lesson: { select: { title: true } }
        }
      }
    }
  });

  if (!user) redirect("/login");

  const calculateProgress = (courseLessons: any[]) => {
    if (courseLessons.length === 0) return 0;
    const completedIds = new Set(user.progress.map((p: any) => p.lessonId));
    const completedInThisCourse = courseLessons.filter(lesson => completedIds.has(lesson.id)).length;
    return Math.round((completedInThisCourse / courseLessons.length) * 100);
  };

  const weeklyGoal = 5;
  const lessonsThisWeek = user.progress.filter((p: any) => new Date(p.updatedAt) >= startOfWeek).length;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-slate-900 pt-32 pb-20 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <span className="text-yellow-400 font-black uppercase tracking-[0.3em] text-[10px] mb-4 block">Student Workspace</span>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter">
              Welcome, <span className="text-slate-500">{user.name?.split(' ')[0]}</span>
            </h1>
          </div>
          <div className="flex gap-4">
            <div className="bg-white/5 backdrop-blur-md p-4 rounded-3xl border border-white/10 text-center min-w-[120px]">
              <div className="text-2xl font-black text-white">{user.enrolledCourses.length}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Courses</div>
            </div>
            <div className="bg-white/5 backdrop-blur-md p-4 rounded-3xl border border-white/10 text-center min-w-[120px]">
              <div className="text-2xl font-black text-yellow-400">{user.progress.length}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lessons Done</div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-8 -mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <PlayCircle size={18} /> Continue Learning
            </h2>

            {user.enrolledCourses.length === 0 && (
              <div className="bg-white rounded-[2.5rem] p-20 text-center border border-dashed border-slate-300">
                <p className="font-bold text-slate-400 uppercase tracking-widest">No courses enrolled yet</p>
                <Link href="/courses" className="text-yellow-500 font-black text-xs uppercase mt-4 block">Browse Catalog</Link>
              </div>
            )}

            {user.enrolledCourses.map((enrollment: any) => {
              const course = enrollment.course;
              const progressPercent = calculateProgress(course.lessons);

              return (
                <div key={course.id} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                  <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="w-full md:w-48 h-32 bg-slate-100 rounded-3xl overflow-hidden shrink-0 relative">
                      {course.image ? (
                        <Image src={course.image} alt="" fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-200"><BookOpen className="text-slate-400" /></div>
                      )}
                    </div>

                    <div className="flex-grow space-y-4 w-full">
                      <div className="flex justify-between items-start">
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">{course.title}</h3>
                        <UnenrollButton courseId={course.id} />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                          <span>Progress</span>
                          <span>{progressPercent}%</span>
                        </div>
                        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-yellow-400 transition-all duration-1000" style={{ width: `${progressPercent}%` }} />
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-4 pt-2">
                        <Link 
                          href={`/learn/${course.id}/${course.lessons[0]?.id || ''}`} 
                          className="flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black hover:bg-yellow-400 hover:text-slate-900 transition-all text-sm uppercase tracking-widest"
                        >
                          Open Classroom <ArrowRight size={16} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="space-y-8">
            <div className="bg-yellow-400 rounded-[3rem] p-10 shadow-xl shadow-yellow-400/20">
              <h3 className="text-2xl font-black text-slate-900 mb-2">Weekly Goal</h3>
              <p className="text-slate-900/60 text-xs font-bold uppercase tracking-widest mb-6">
                {lessonsThisWeek} of {weeklyGoal} lessons completed
              </p>
              <div className="flex gap-2">
                {[...Array(weeklyGoal)].map((_, i: number) => (
                  <div key={i} className={`h-12 w-full rounded-2xl border-2 ${i < lessonsThisWeek ? 'bg-slate-900 border-slate-900' : 'border-slate-900/10'}`} />
                ))}
              </div>
            </div>

            <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 border-b pb-4">Recent Milestones</h3>
              <div className="space-y-6">
                {user.progress.length === 0 && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No activity yet</p>}
                {user.progress.slice(0, 5).map((p: any, i: number) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="bg-green-100 text-green-600 p-2 rounded-xl"><CheckCircle size={16} /></div>
                    <div>
                      <p className="text-xs font-black text-slate-900 line-clamp-1">{p.lesson?.title || "Lesson Completed"}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{new Date(p.updatedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}