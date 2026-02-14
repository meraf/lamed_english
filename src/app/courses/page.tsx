import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { BookOpen, Clock, Star, ArrowRight, Zap } from "lucide-react";

export default async function PublicCoursesPage() {
  // Fetch all courses with the count of lessons for each
  const courses = await prisma.course.findMany({
    include: {
      _count: {
        select: { lessons: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Header */}
      <section className="bg-slate-900 py-24 px-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-yellow-400/5 skew-x-12 transform translate-x-1/2"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <span className="bg-yellow-400 text-slate-900 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6 inline-block">
            Elevate Your English
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter">
            Master the Language of <br/>
            <span className="text-yellow-400">Global Opportunity.</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl leading-relaxed">
            From Business English to IELTS preparation, choose a world-class course designed by expert linguists.
          </p>
        </div>
      </section>

      {/* Course Grid */}
      <main className="max-w-7xl mx-auto px-8 -mt-16 pb-32">
        {courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {courses.map((course) => (
              <div key={course.id} className="group bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-yellow-400/10 transition-all duration-500 flex flex-col overflow-hidden">
                
                {/* Visual Header */}
                <div className="h-48 bg-slate-100 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
                    <Zap size={60} className="text-yellow-400 opacity-20 group-hover:scale-110 group-hover:opacity-100 transition-all duration-500" />
                  </div>
                  <div className="absolute top-6 right-6 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1 border border-white/20">
                    <Star size={12} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-[10px] font-bold text-white uppercase">4.9 Rating</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 flex-grow flex flex-col">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                      Best Seller
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {course._count.lessons} Lessons
                    </span>
                  </div>

                  <h3 className="text-2xl font-black text-slate-900 mb-3 group-hover:text-yellow-600 transition-colors">
                    {course.title}
                  </h3>
                  
                  <p className="text-slate-500 text-sm leading-relaxed mb-8 line-clamp-2">
                    {course.description}
                  </p>

                  {/* Footer Info */}
                  <div className="mt-auto">
                    <div className="flex items-center justify-between mb-6 pt-6 border-t border-slate-50">
                      <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                        <Clock size={16} />
                        <span>12 Hours Content</span>
                      </div>
                      <div className="text-2xl font-black text-slate-900">
                        ${course.price}
                      </div>
                    </div>

                    <Link 
                      href={`/courses/${course.id}`}
                      className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-yellow-400 hover:text-slate-900 transition-all active:scale-95"
                    >
                      VIEW COURSE <ArrowRight size={18} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-50 rounded-[3rem] p-20 text-center border-2 border-dashed border-slate-200">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Our catalog is coming soon</h3>
            <p className="text-slate-500">We are currently preparing world-class content for you.</p>
          </div>
        )}
      </main>
    </div>
  );
}