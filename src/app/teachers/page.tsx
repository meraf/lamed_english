import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Award, BookOpen, MessageCircle, ArrowRight } from 'lucide-react';

export default function TeachersPage() {
  const teachers = [
    {
      id: 1,
      name: "Sarah Jenkins",
      role: "IELTS Specialist",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800", // High-quality placeholder
      bio: "Former IELTS examiner with 10 years of experience helping students score Band 8+.",
      students: "1,200+",
      rating: "4.9",
      expertise: ["IELTS Academic", "Speaking", "Writing"],
    },
    {
      id: 2,
      name: "David Okonjo",
      role: "Business English Coach",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=800",
      bio: "Specializing in corporate communication, interview prep, and negotiation skills for professionals.",
      students: "850+",
      rating: "5.0",
      expertise: ["Business", "Interviews", "Public Speaking"],
    },
    {
      id: 3,
      name: "Maria Gonzalez",
      role: "Grammar & Foundations",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=800",
      bio: "Patient and structured teaching style perfect for beginners looking to build a strong foundation.",
      students: "2,400+",
      rating: "4.8",
      expertise: ["Beginner A1-A2", "Grammar", "Vocabulary"],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Section */}
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
            Our teachers aren't just native speakers—they are certified educators passionate about your success. Choose a mentor who fits your learning style.
          </p>
        </div>
      </div>

      {/* Teachers Grid */}
      <main className="max-w-7xl mx-auto px-8 -mt-20 pb-24 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {teachers.map((teacher) => (
            <div key={teacher.id} className="group bg-white rounded-[2.5rem] p-4 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-300/50 transition-all duration-500 hover:-translate-y-2">
              
              {/* Image Container */}
              <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden mb-6">
                <img 
                  src={teacher.image} 
                  alt={teacher.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                
                {/* Floating Rating Badge */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg">
                  <Star size={14} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-xs font-bold text-slate-900">{teacher.rating}</span>
                </div>

                {/* Name Overlay (Visible on bottom) */}
                <div className="absolute bottom-6 left-6 text-white">
                  <p className="text-yellow-400 text-xs font-bold uppercase tracking-wider mb-1">{teacher.role}</p>
                  <h3 className="text-2xl font-black">{teacher.name}</h3>
                </div>
              </div>

              {/* Content */}
              <div className="px-4 pb-4">
                <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-3">
                  {teacher.bio}
                </p>

                {/* Stats Row */}
                <div className="flex items-center gap-6 mb-6 border-t border-slate-100 pt-6">
                  <div className="flex items-center gap-2">
                    <BookOpen size={16} className="text-slate-400" />
                    <span className="text-sm font-bold text-slate-700">{teacher.students} Students</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award size={16} className="text-slate-400" />
                    <span className="text-sm font-bold text-slate-700">Certified</span>
                  </div>
                </div>

                {/* Expertise Tags */}
                <div className="flex flex-wrap gap-2 mb-8">
                  {teacher.expertise.map((skill, i) => (
                    <span key={i} className="bg-slate-50 text-slate-600 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide border border-slate-100">
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Action Button */}
                <Link href="/contact" className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 group-hover:bg-yellow-400 group-hover:text-slate-900 transition-all">
                  <MessageCircle size={18} />
                  Book a Session
                  <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-24 bg-yellow-400 rounded-3xl p-12 text-center relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl font-black text-slate-900 mb-4">Are you an expert English teacher?</h2>
            <p className="text-slate-800 font-medium mb-8">Join our platform and reach thousands of students worldwide.</p>
            <button className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg">
              Apply as Instructor
            </button>
          </div>
          {/* Decorative Pattern */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        </div>
      </main>
    </div>
  );
}