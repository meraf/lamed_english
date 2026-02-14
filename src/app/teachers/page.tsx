export const dynamic = "force-dynamic";
import React from 'react';
import { prisma } from "@/lib/prisma";
import Link from 'next/link';
import { Star, Award, BookOpen, MessageCircle, ArrowRight } from 'lucide-react';

export default async function TeachersPage() {
  // Fetch real teachers from the DB
  const teachers = await prisma.teacher.findMany({
    include: {
      _count: {
        select: { courses: true }
      }
    }
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-slate-900 text-white py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400 rounded-full blur-[150px] opacity-10 translate-x-1/2 -translate-y-1/2"></div>
        <div className="max-w-7xl mx-auto px-8 relative z-10 text-center">
          <span className="text-yellow-400 font-bold tracking-widest uppercase text-sm mb-4 block">
            World-Class Instructors
          </span>
          <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tight">
            Meet Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200">Mentors</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Choose a mentor who fits your learning style. Our teachers are verified experts ready to help you succeed.
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-8 -mt-20 pb-24 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {teachers.map((teacher) => (
            <div key={teacher.id} className="group bg-white rounded-[2.5rem] p-4 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-300/50 transition-all duration-500 hover:-translate-y-2">
              <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden mb-6">
                <img 
                  src={teacher.image} 
                  alt={teacher.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg">
                  <Star size={14} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-xs font-bold text-slate-900">{teacher.rating.toFixed(1)}</span>
                </div>
                <div className="absolute bottom-6 left-6 text-white">
                  <p className="text-yellow-400 text-xs font-bold uppercase tracking-wider mb-1">{teacher.role}</p>
                  <h3 className="text-2xl font-black">{teacher.name}</h3>
                </div>
              </div>

              <div className="px-4 pb-4">
                <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-3 italic">
                  "{teacher.bio}"
                </p>

                <div className="flex items-center gap-6 mb-6 border-t border-slate-100 pt-6">
                  <div className="flex items-center gap-2">
                    <BookOpen size={16} className="text-slate-400" />
                    <span className="text-sm font-bold text-slate-700">{teacher._count.courses} Courses</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award size={16} className="text-slate-400" />
                    <span className="text-sm font-bold text-slate-700">Verified</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-8">
                  {teacher.expertise.map((skill, i) => (
                    <span key={i} className="bg-slate-50 text-slate-600 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide border border-slate-100">
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Now this links directly to the courses taught by this specific teacher */}
                <Link href={`/courses?teacherId=${teacher.id}`} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 group-hover:bg-yellow-400 group-hover:text-slate-900 transition-all">
                  <BookOpen size={18} />
                  View My Courses
                  <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}