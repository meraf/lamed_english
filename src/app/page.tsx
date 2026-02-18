import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth"; 
import { authOptions } from "@/lib/auth";      
import { Course } from '@prisma/client';
import { 
  BookOpen, 
  Users, 
  Award, 
  Globe, 
  ChevronRight, 
  Star
} from 'lucide-react';

export default async function Home() {
  const session = await getServerSession(authOptions);
  const mainCtaLink = session ? "/dashboard" : "/courses";

  // 1. Fetch real courses
  const courses: Course[] = await prisma.course.findMany({
    orderBy: { id: 'desc' }
  }).catch(() => []);

  // 2. Fetch up to 4 recent students for small social proof circles
  let recentUsers = await prisma.user.findMany({
    where: { 
        image: { not: null },
        role: 'STUDENT' as any 
    },
    take: 4,
    orderBy: { id: 'desc' }, 
    select: { id: true, image: true }
  }).catch(() => []);

  // Fallback if no specific 'STUDENT' role users found
  if (recentUsers.length === 0) {
    recentUsers = await prisma.user.findMany({
      where: { image: { not: null } },
      take: 4,
      orderBy: { id: 'desc' },
      select: { id: true, image: true }
    }).catch(() => []);
  }

  // 3. Fetch Teacher Pool for the BIG HERO IMAGE (Random Rotation)
  // Removed 'rating' from select and orderBy to fix your Prisma error
  const teacherPool = await prisma.user.findMany({
    where: { 
        role: 'TEACHER' as any, 
        image: { not: null } 
    },
    orderBy: { id: 'desc' },
    take: 10,
    select: { image: true, name: true }
  }).catch(() => []);

  // RANDOM LOGIC: Select one teacher from the pool every reload
  const featuredTeacher = teacherPool.length > 0 
    ? teacherPool[Math.floor(Math.random() * teacherPool.length)] 
    : null;

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800">
      
      {/* 1. HERO SECTION */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white overflow-hidden">
        {/* Decorative Blobs */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-1000"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 grid lg:grid-cols-2 gap-12 items-center relative z-10">
          
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
              <Link 
                href={mainCtaLink} 
                className="bg-yellow-400 text-slate-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-yellow-300 transition-all shadow-lg hover:shadow-yellow-400/40 flex items-center justify-center gap-2"
              >
                {session ? "Continue Learning" : "Start Learning"} <ChevronRight size={20} />
              </Link>
              
              <Link href="/courses">
                <button className="w-full sm:w-auto border-2 border-slate-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-800 transition-all">
                  Our Teachers
                </button>
              </Link>
            </div>
            
            {/* Social Proof (Small Student Circles) */}
            <div className="pt-6 flex items-center gap-4 text-sm text-slate-400">
              <div className="flex -space-x-3">
                {recentUsers && recentUsers.length > 0 ? (
                  recentUsers.map((user) => (
                    <div key={user.id} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center overflow-hidden">
                      <img src={user.image!} alt="Student" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                  ))
                ) : (
                   [1, 2, 3].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-700 flex items-center justify-center overflow-hidden">
                      <Users size={16} className="text-slate-400" />
                    </div>
                   ))
                )}
              </div>
              <p>Trusted by <span className="text-white font-semibold">1,200+ active students</span></p>
            </div>
          </div>

          {/* HERO GRAPHIC: Dynamic Teacher Rotation */}
          <div className="relative flex items-center justify-center py-10">
            <div className="relative w-full aspect-square max-w-lg bg-blue-800/20 rounded-[3rem] border border-white/10 backdrop-blur-md shadow-2xl flex items-center justify-center group">
               
               {/* Badge Top Left */}
               <div className="absolute -top-3 -left-3 md:-top-5 md:-left-5 bg-white p-3 md:p-4 rounded-xl shadow-2xl z-20">
                  <span className="text-slate-900 font-bold text-xs md:text-base flex items-center gap-2">
                    🇬🇧 {featuredTeacher?.name || "Expert Tutors"}
                  </span>
               </div>

               {/* Badge Bottom Right */}
               <div className="absolute -bottom-3 -right-3 md:-bottom-5 md:-right-5 bg-yellow-400 p-3 md:p-4 rounded-xl shadow-2xl z-20">
                  <span className="text-slate-900 font-bold text-xs md:text-base flex items-center gap-2">
                    ⭐ 4.9/5 Rating
                  </span>
               </div>

               {/* Teacher Image */}
               <div className="w-full h-full overflow-hidden rounded-[3rem] flex items-center justify-center bg-slate-800/50">
                {featuredTeacher?.image ? (
                  <img 
                    src={featuredTeacher.image} 
                    alt={featuredTeacher.name || "Teacher"} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-4 p-8 text-center">
                    <Users size={80} className="text-white/10" />
                    <p className="text-xs text-white/30 font-medium">
                        Assign 'TEACHER' role & an image to a user in Prisma Studio to see them here!
                    </p>
                  </div>
                )}
               </div>
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
    </div>
  );
}