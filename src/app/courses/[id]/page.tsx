export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Play, Lock } from "lucide-react";
import EnrollButton from "@/app/components/EnrollButton";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  const course = await prisma.course.findUnique({
    where: { id },
    include: { lessons: { orderBy: { order: 'asc' } }, teacher: true }
  });

  if (!course) notFound();

  let user = null;
  if (session?.user?.email) {
    user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return redirect("/api/auth/signout?callbackUrl=/api/auth/signin");
  }

  const enrollment = (user && id)
    ? await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId: user.id, courseId: id } }
      })
    : null;

  const firstLessonId = course.lessons[0]?.id;
  // ✅ FIXED: Now points to the NEW /learn folder
  const targetHref = firstLessonId ? `/learn/${id}/${firstLessonId}` : `/courses/${id}`;

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-slate-900 pt-20 pb-32 px-6">
        <div className="max-w-5xl mx-auto">
          <Link href="/dashboard" className="text-slate-400 hover:text-white flex items-center gap-2 mb-8 transition-colors font-bold text-sm">
            <ChevronLeft size={16} /> BACK TO DASHBOARD
          </Link>
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-1">
              <span className="bg-yellow-400 text-slate-900 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-4 inline-block">Course</span>
              <h1 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight">{course.title}</h1>
              <p className="text-slate-400 text-lg max-w-xl mb-8 leading-relaxed">{course.description}</p>
              
              {!enrollment ? (
                <EnrollButton courseId={id} userId={user?.id} />
              ) : (
                <Link href={targetHref} className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-black flex items-center gap-2 w-fit hover:bg-yellow-400 transition-all shadow-xl">
                  CONTINUE LEARNING <Play size={18} fill="currentColor"/>
                </Link>
              )}
            </div>
            <div className="w-full md:w-1/3 aspect-square bg-slate-800 rounded-[3rem] border border-slate-700 flex items-center justify-center shadow-2xl relative overflow-hidden group">
               {course.image && <img src={course.image} alt={course.title} className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-30 transition-opacity" />}
               <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-transparent opacity-50" />
               <Play size={80} className="text-white/20 group-hover:text-yellow-400 transition-colors relative z-10" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-16">
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="font-black text-slate-900 text-xl tracking-tight">Course Content</h2>
            <span className="text-slate-400 font-bold text-sm">{course.lessons.length} Lessons</span>
          </div>
          <div className="divide-y divide-slate-100">
            {course.lessons.map((lesson: any, idx: number) => (
              <div key={lesson.id} className="flex items-center justify-between p-6 hover:bg-slate-50 transition-all group">
                <div className="flex items-center gap-6">
                  <div className="text-slate-300 font-black text-2xl group-hover:text-slate-900 transition-colors w-8">{String(idx + 1).padStart(2, '0')}</div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">{lesson.title}</h3>
                    <p className="text-slate-400 text-sm font-medium">Video Lesson</p>
                  </div>
                </div>
                {enrollment ? (
                  // ✅ FIXED: Now points to the NEW /learn folder
                  <Link href={`/learn/${id}/${lesson.id}`} className="text-slate-900 hover:text-yellow-600 font-black text-sm flex items-center gap-1">
                    START <Play size={14} fill="currentColor" />
                  </Link>
                ) : (
                  <div className="flex items-center gap-2 text-slate-300">
                    <span className="text-[10px] font-black uppercase tracking-widest">Locked</span>
                    <Lock size={18} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="pb-20" />
    </div>
  );
}