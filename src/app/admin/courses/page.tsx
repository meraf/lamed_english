import { prisma } from "@/lib/prisma";
import { Plus, BookOpen, DollarSign, Layers } from "lucide-react";

export default async function AdminCourses() {
  // Fetch existing courses to show in a table below the form
  const courses = await prisma.course.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="max-w-6xl mx-auto">
      <header className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Manage Courses</h1>
          <p className="text-slate-500">Add or edit your English learning content.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Course Creation Form (Simple version for now) */}
        <div className="lg:col-span-1 bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 h-fit">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Plus size={20} className="text-yellow-500" /> New Course
          </h2>
          <form className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Course Title</label>
              <input type="text" className="w-full bg-slate-50 border-none rounded-xl p-4 mt-1 focus:ring-2 focus:ring-yellow-400 outline-none" placeholder="Business English 101" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Price ($)</label>
              <input type="number" className="w-full bg-slate-50 border-none rounded-xl p-4 mt-1 focus:ring-2 focus:ring-yellow-400 outline-none" placeholder="49.99" />
            </div>
            <button className="w-full bg-slate-900 text-yellow-400 py-4 rounded-xl font-bold mt-4 hover:bg-slate-800 transition-all">
              Create Course
            </button>
          </form>
        </div>

        {/* Courses Table */}
        <div className="lg:col-span-2 space-y-4">
          {courses.map((course) => (
            <div key={course.id} className="bg-white p-6 rounded-2xl flex items-center justify-between border border-slate-100 hover:border-yellow-400 transition-colors shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                  <BookOpen size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{course.title}</h3>
                  <p className="text-xs text-slate-500">${course.price} • {course.createdAt.toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex gap-2">
                 <button className="p-2 text-slate-400 hover:text-slate-900"><Layers size={20} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}