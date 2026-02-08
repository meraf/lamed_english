import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Course } from '@prisma/client';
import { 
  BookOpen, 
  Users, 
  Award, 
  Globe, 
  ChevronRight, 
  Star,
  CheckCircle2
} from 'lucide-react';

export default async function Home() {
  // Fetch real courses from your Supabase database via Prisma
  const courses: Course[] = await prisma.course.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800">
      
      {/* 1. HERO SECTION */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white overflow-hidden">
        {/* Animated Background Blobs */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-1000"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 grid lg:grid-cols-2 gap-12 items-center relative z-10">
          
          {/* Hero Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-sm font-bold tracking-wide">
              <Star size={14} fill="currentColor" /> 
              NEW SEMESTER IS LIVE
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight tracking-tighter">
              Unlock Your <br />
              <span className="text-yellow-400 relative">
                English Potential
                <svg className="absolute w-full h-3 -bottom-2 left-0 text-yellow-400 opacity-60" viewBox="0 0 200 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2.00024 6.99999C33.5828 3.12328 108.858 -2.00004 198.001 3.50002" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                </svg>
              </span>
            </h1>
            
            <p className="text-xl text-slate-300 max-w-lg leading-relaxed">
              Master the language with native speakers and personalized curriculums designed to help you speak with confidence in months, not years.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/courses" className="bg-yellow-400 text-slate-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-yellow-300 transition-all shadow-lg hover:shadow-yellow-400/40 flex items-center justify-center gap-2">
                Start Learning <ChevronRight size={20} />
              </Link>
              <button className="border-2 border-slate-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-800 transition-all">
                Our Teachers
              </button>
            </div>
            
            {/* Social Proof */}
            <div className="pt-6 flex items-center gap-4 text-sm text-slate-400">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center overflow-hidden">
                     <div className="bg-slate-700 w-full h-full flex items-center justify-center text-[10px]">User</div>
                  </div>
                ))}
              </div>
              <p>Trusted by <span className="text-white font-semibold">1,200+ active students</span></p>
            </div>
          </div>

          {/* Hero Graphic */}
          <div className="relative flex items-center justify-center">
            <div className="relative w-full aspect-square max-w-lg bg-blue-800/20 rounded-[3rem] border border-white/10 backdrop-blur-md p-8 shadow-2xl flex items-center justify-center group overflow-hidden">
               <div className="absolute -top-6 -left-6 bg-white p-4 rounded-xl shadow-xl z-20">
                  <span className="text-slate-900 font-bold flex items-center gap-2">🇬🇧 Native Tutors</span>
               </div>
               <div className="absolute -bottom-6 -right-6 bg-yellow-400 p-4 rounded-xl shadow-xl z-20">
                  <span className="text-slate-900 font-bold flex items-center gap-2 animate-pulse">⭐ 4.9/5 Average Rating</span>
               </div>
               <Users size={120} className="text-white/20 group-hover:scale-110 transition-transform duration-700" />
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURES BAR */}
      <section className="bg-slate-50 py-24 -mt-12 relative z-20 rounded-t-[3rem] shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: <Users className="text-blue-600" size={32} />, title: "Live Classes", desc: "Real-time interaction with tutors" },
              { icon: <BookOpen className="text-yellow-500" size={32} />, title: "Course Materials", desc: "PDFs, videos, and quizzes" },
              { icon: <Award className="text-purple-500" size={32} />, title: "Certificates", desc: "Earn official recognition" },
              { icon: <Globe className="text-green-500" size={32} />, title: "Community", desc: "Global student chat rooms" },
            ].map((feature, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="mb-6 p-4 bg-slate-50 w-fit rounded-2xl">{feature.icon}</div>
                <h3 className="font-bold text-xl mb-3 text-slate-900">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. DYNAMIC COURSE LIST */}
      <section className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="space-y-4">
              <h2 className="text-4xl font-black text-slate-900 tracking-tight lg:text-5xl">Browse Courses</h2>
              <p className="text-slate-500 text-lg max-w-xl leading-relaxed">
                Whether you're a total beginner or an advanced learner, we have a specialized program waiting for you.
              </p>
            </div>
            <div className="hidden md:block h-1 w-32 bg-yellow-400 rounded-full mb-4"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {courses.length > 0 ? (
              courses.map((course) => (
                <div key={course.id} className="group bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 relative overflow-hidden flex flex-col h-full">
                  {/* Decorative element */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/10 rounded-bl-[100%] -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700"></div>
                  
                  <div className="mb-8 p-4 bg-slate-50 w-fit rounded-2xl group-hover:bg-yellow-400 transition-colors duration-500 text-slate-900 shadow-sm">
                    <BookOpen size={24} />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-slate-900 mb-3 leading-tight group-hover:text-blue-600 transition-colors">
                    {course.title}
                  </h3>
                  
                  <p className="text-slate-500 mb-8 line-clamp-3 leading-relaxed flex-grow">
                    {course.description}
                  </p>
                  
                  <div className="flex justify-between items-center pt-6 border-t border-slate-50">
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Tuition</span>
                      <span className="text-3xl font-black text-slate-900">${course.price}</span>
                    </div>
                    <Link href={`/courses/${course.id}`}>
                      <button className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-yellow-400 hover:text-slate-900 transition-all shadow-lg hover:shadow-yellow-400/20 active:scale-95">
                        Enroll Now
                      </button>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                <div className="text-slate-400 font-medium text-lg">No courses available yet. Check back soon!</div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="bg-slate-900 rounded-[3rem] p-12 lg:p-20 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-yellow-400/5 mix-blend-overlay"></div>
          <h2 className="text-3xl lg:text-5xl font-black text-white mb-8 relative z-10">
            Ready to Speak Fluent English?
          </h2>
          <p className="text-slate-400 text-lg mb-12 max-w-2xl mx-auto relative z-10">
            Join thousands of students who have already transformed their careers and personal lives with Lamed English.
          </p>
          <button className="bg-white text-slate-900 px-10 py-5 rounded-2xl font-black text-xl hover:bg-yellow-400 transition-all relative z-10 active:scale-95 shadow-2xl">
            Get Started Today
          </button>
        </div>
      </section>

    </div>
  );
}