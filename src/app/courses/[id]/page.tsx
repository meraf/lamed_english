import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PlayCircle, CheckCircle, ArrowLeft } from "lucide-react";

export default async function CoursePage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  // NEXT.JS 15 FIX: We must await params
  const { id } = await params;
  
  const session = await getServerSession(authOptions);

  const course = await prisma.course.findUnique({
    where: { id: id },
    include: {
      lessons: {
        orderBy: { order: "asc" },
      },
      _count: {
        select: { users: true }
      }
    },
  });

  if (!course) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header / Hero Area */}
      <div className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-8">
          <Link href="/" className="flex items-center gap-2 text-yellow-400 mb-8 hover:gap-4 transition-all">
            <ArrowLeft size={20} />
            <span className="font-bold text-sm tracking-widest uppercase">Back to Courses</span>
          </Link>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="bg-yellow-400 text-slate-900 px-4 py-1 rounded-full text-xs font-black uppercase mb-6 inline-block">
                Premium Course
              </span>
              <h1 className="text-5xl font-black mb-6 leading-tight">{course.title}</h1>
              <p className="text-xl text-slate-400 leading-relaxed mb-8">
                {course.description}
              </p>
              <div className="flex items-center gap-6">
                <div className="flex -space-x-2">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-700"></div>
                  ))}
                </div>
                <span className="text-sm text-slate-400 font-medium">
                  Join <span className="text-white font-bold">{course._count.users + 124}</span> students already learning
                </span>
              </div>
            </div>

            <div className="bg-slate-800 rounded-3xl p-8 border border-slate-700 shadow-2xl">
              <div className="flex justify-between items-center mb-8">
                <span className="text-4xl font-black text-white">${course.price}</span>
                <span className="text-yellow-400 text-sm font-bold uppercase tracking-widest">Lifetime Access</span>
              </div>
              <button className="w-full bg-yellow-400 text-slate-900 py-4 rounded-2xl font-black text-lg hover:bg-yellow-300 transition-all shadow-[0_0_30px_rgba(250,204,21,0.2)]">
                ENROLL IN COURSE
              </button>
              <p className="text-center text-slate-500 text-xs mt-6">
                30-Day Money-Back Guarantee • Secure Payment
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Curriculum Section */}
      <main className="max-w-7xl mx-auto px-8 py-20">
        <h2 className="text-3xl font-black text-slate-900 mb-12 flex items-center gap-4">
          Course Curriculum
          <div className="h-1 w-20 bg-yellow-400 rounded-full"></div>
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-4">
            {course.lessons.length > 0 ? (
              course.lessons.map((lesson, index) => (
                <div key={lesson.id} className="group flex items-center justify-between p-6 bg-slate-50 rounded-2xl hover:bg-white hover:shadow-xl hover:shadow-slate-100 transition-all border border-transparent hover:border-slate-100">
                  <div className="flex items-center gap-6">
                    <span className="text-slate-300 font-black text-2xl group-hover:text-yellow-500 transition-colors">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{lesson.title}</h4>
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-tighter mt-1 italic">Video Lesson • 15 Mins</p>
                    </div>
                  </div>
                  <PlayCircle className="text-slate-300 group-hover:text-slate-900 transition-colors" />
                </div>
              ))
            ) : (
              <div className="p-12 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                <p className="text-slate-400 font-bold">No lessons uploaded yet for this course.</p>
              </div>
            )}
          </div>

          <div className="space-y-8">
            <div className="bg-white border border-slate-100 p-8 rounded-3xl shadow-sm">
              <h3 className="font-black text-slate-900 mb-6 uppercase tracking-widest text-sm">What you'll learn</h3>
              <ul className="space-y-4">
                {["Fluent Conversation", "Grammar Mastery", "Professional Vocabulary"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-600 text-sm">
                    <CheckCircle size={18} className="text-green-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}