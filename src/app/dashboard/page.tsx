import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { PlayCircle, Trophy, BookOpen } from "lucide-react";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  // Security check: If no session, redirect to login
  if (!session?.user?.email) {
    redirect("/login");
  }

  // Fetch User with Enrolled Courses and Progress
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      enrolledCourses: {
        include: {
          lessons: { 
            select: { id: true } 
          },
          _count: { 
            select: { lessons: true } 
          }
        }
      },
      // Assuming 'progress' is the relation to UserProgress model
      progress: {
        where: { isCompleted: true },
        select: { lessonId: true }
      }
    }
  });

  return (
    <div className="min-h-screen bg-white p-8 md:p-12">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <header className="mb-12 flex justify-between items-end">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">
              Welcome Back, {user?.name?.split(' ')[0] || 'Scholar'}!
            </h1>
            <p className="text-slate-500 mt-2 font-medium">Continue your journey to English mastery.</p>
          </div>
          <div className="hidden md:block text-right">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Courses in Progress</span>
            <p className="text-2xl font-black text-slate-900">{user?.enrolledCourses.length || 0}</p>
          </div>
        </header>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {user?.enrolledCourses.map((course) => {
            
            // PROGRESS CALCULATION
            // We count how many lesson IDs in the course match the lesson IDs in user.progress
            const completedCount = user.progress.filter(p => 
              course.lessons.some(l => l.id === p.lessonId)
            ).length;
            
            const totalLessons = course._count.lessons;
            const percentage = totalLessons > 0 
              ? Math.round((completedCount / totalLessons) * 100) 
              : 0;

            const isFullyCompleted = percentage === 100;

            return (
              <div 
                key={course.id} 
                className="group bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100 flex flex-col hover:bg-white hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] transition-all duration-500"
              >
                <div className="mb-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-white rounded-2xl shadow-sm">
                      <BookOpen size={24} className="text-slate-900" />
                    </div>
                    {isFullyCompleted && (
                      <div className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                        <Trophy size={12} /> Finished
                      </div>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-black text-slate-900 mb-2 group-hover:text-yellow-600 transition-colors">
                    {course.title}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                    <span className={isFullyCompleted ? "text-green-500" : "text-slate-900"}>
                      {completedCount}
                    </span> 
                    <span>/</span> 
                    <span>{totalLessons} LESSONS COMPLETED</span>
                  </div>
                </div>

                {/* Progress Bar UI */}
                <div className="space-y-3 mb-8">
                  <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ease-out ${
                        isFullyCompleted ? "bg-green-500" : "bg-yellow-400"
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">
                      {percentage}% Complete
                    </p>
                  </div>
                </div>

                {/* Action Button */}
                <Link 
                  href={`/courses/${course.id}`} 
                  className={`mt-auto py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all active:scale-95 ${
                    isFullyCompleted 
                    ? "bg-white border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white" 
                    : "bg-slate-900 text-white hover:bg-yellow-400 hover:text-slate-900 shadow-lg shadow-slate-200"
                  }`}
                >
                  <PlayCircle size={20}/> {isFullyCompleted ? "REVIEW COURSE" : "RESUME"}
                </Link>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {user?.enrolledCourses.length === 0 && (
          <div className="text-center py-24 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
             <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                <BookOpen size={40} className="text-slate-200" />
             </div>
             <h2 className="text-2xl font-black text-slate-900 mb-2">Ready to start?</h2>
             <p className="text-slate-400 font-medium mb-8">You haven't enrolled in any courses yet.</p>
             <Link 
               href="/courses" 
               className="bg-yellow-400 text-slate-900 px-10 py-4 rounded-2xl font-black hover:bg-yellow-300 transition-all shadow-xl shadow-yellow-400/20"
             >
               Explore Courses
             </Link>
          </div>
        )}
      </div>
    </div>
  );
}