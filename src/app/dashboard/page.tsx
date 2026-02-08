import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, PlayCircle, Clock, Trophy } from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  // Guard: If not logged in, send to login
  if (!session?.user?.email) {
    redirect("/login");
  }

  // Fetch the user and their specific enrolled courses
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      enrolledCourses: {
        include: {
          _count: { select: { lessons: true } }
        }
      }
    }
  });

  const courses = user?.enrolledCourses || [];

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Dashboard Header */}
      <div className="bg-slate-900 text-white pt-16 pb-24">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6">
            <div>
              <h1 className="text-4xl font-black mb-2">Welcome back, {session.user.name || 'Student'}!</h1>
              <p className="text-slate-400">Track your progress and continue your English mastery.</p>
            </div>
            <div className="flex gap-4">
              <div className="bg-slate-800 border border-slate-700 p-4 rounded-2xl flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-400/10 rounded-xl flex items-center justify-center text-yellow-400">
                  <Trophy size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">Courses</p>
                  <p className="text-xl font-black">{courses.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Grid */}
      <main className="max-w-7xl mx-auto px-8 -mt-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-2 w-2 bg-yellow-400 rounded-full animate-pulse"></div>
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900">My Enrolled Courses</h2>
        </div>

        {courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
            {courses.map((course) => (
              <div key={course.id} className="group bg-white rounded-[2rem] overflow-hidden border border-slate-200 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500">
                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-yellow-400 group-hover:scale-110 transition-transform">
                      <BookOpen size={24} />
                    </div>
                    <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-3 py-1 rounded-full uppercase tracking-tighter">
                      {course._count.lessons} Lessons
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-slate-500 text-sm line-clamp-2 mb-8 italic">
                    {course.description}
                  </p>

                  <div className="space-y-4">
                    {/* Progress Bar Placeholder (UI matching the theme) */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                        <span>Progress</span>
                        <span>0%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-400 rounded-full w-[5%]"></div>
                      </div>
                    </div>

                    <Link 
                      href={`/courses/${course.id}`}
                      className="flex items-center justify-center gap-2 w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-yellow-400 hover:text-slate-900 transition-all active:scale-95"
                    >
                      CONTINUE LEARNING <PlayCircle size={18} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[3rem] p-20 text-center border-2 border-dashed border-slate-200">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
              <BookOpen size={40} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">No courses yet</h3>
            <p className="text-slate-500 mb-8">Start your journey today by exploring our catalog.</p>
            <Link href="/courses" className="bg-yellow-400 text-slate-900 px-8 py-3 rounded-full font-bold hover:shadow-lg transition-all">
              Browse Courses
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}