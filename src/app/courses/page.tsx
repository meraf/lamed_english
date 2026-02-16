export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Clock, Star, ArrowRight, Zap, User } from "lucide-react";

export default async function PublicCoursesPage({ searchParams }: { searchParams: Promise<{ teacherId?: string }> }) {
  const { teacherId } = await searchParams;

  const courses = await prisma.course.findMany({
    where: teacherId ? { teacherId } : {},
    include: {
      teacher: true,
      _count: { select: { lessons: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-slate-900 py-24 px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <span className="bg-yellow-400 text-slate-900 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6 inline-block">
            {teacherId ? "Teacher's Catalog" : "Elevate Your English"}
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter">
            {teacherId ? "Masterclass Sessions" : "Master the Language of Global Opportunity."}
          </h1>
        </div>
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400/10 rounded-full blur-[120px] -mr-48 -mt-48" />
      </section>

      <main className="max-w-7xl mx-auto px-8 -mt-16 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {courses.map((course) => (
            <div key={course.id} className="group bg-white rounded-[2.5rem] border border-slate-100 shadow-xl transition-all duration-500 flex flex-col overflow-hidden hover:-translate-y-2">
              {/* Course Thumbnail */}
              <div className="h-48 bg-slate-900 relative overflow-hidden">
                 {course.thumbnail ? (
                   <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-500" />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center">
                     <Zap size={60} className="text-yellow-400 opacity-20" />
                   </div>
                 )}
              </div>

              {/* Course Content */}
              <div className="p-8 flex-grow flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {/* FIXED: Added optional chaining and fallback for teacher image */}
                    <img 
                        src={course.teacher?.image || `https://ui-avatars.com/api/?name=${course.teacher?.name || 'Teacher'}`} 
                        className="w-6 h-6 rounded-full border border-slate-200 object-cover" 
                        alt="Instructor"
                    />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {course.teacher?.name || "Expert Instructor"}
                    </span>
                  </div>
                  <span className="text-[10px] font-black uppercase text-slate-400">{course._count.lessons} Lessons</span>
                </div>

                <h3 className="text-2xl font-black text-slate-900 mb-3 group-hover:text-yellow-600 transition-colors">
                  {course.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-8 line-clamp-2">
                  {course.description}
                </p>

                {/* Footer / Price & Action */}
                <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                  <div>
                    <span className="block text-[10px] font-black text-slate-300 uppercase tracking-widest">Investment</span>
                    <div className="text-2xl font-black text-slate-900">${course.price}</div>
                  </div>
                  <Link 
                    href={`/courses/${course.id}`}
                    className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-yellow-400 hover:text-slate-900 transition-all shadow-lg active:scale-95"
                  >
                    START <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {courses.length === 0 && (
          <div className="text-center py-40">
            <div className="bg-slate-50 inline-block p-10 rounded-[3rem] border-2 border-dashed border-slate-200">
               <User size={48} className="mx-auto text-slate-200 mb-4" />
               <h3 className="text-xl font-black text-slate-400">No courses found in this category.</h3>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}