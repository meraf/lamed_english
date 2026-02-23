import { prisma } from "@/lib/prisma";
import { Video, Book, FileText, UserCircle } from "lucide-react";
import Link from "next/link";

export default async function TeacherCoursePage({ params }: { params: { id: string } }) {
  const course = await prisma.course.findUnique({
    where: { id: params.id },
    include: { lessons: true, enrollments: { include: { user: true } } }
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      <header>
        <h1 className="text-5xl font-black italic uppercase tracking-tighter">Manage: {course?.title}</h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT: CONTENT UPLOAD */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white p-8 rounded-[2rem] border-4 border-slate-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-2 underline"><Video /> Upload Lesson</h2>
            <form action="/api/teacher/add-lesson" method="POST" className="space-y-4">
              <input name="title" placeholder="Lesson Title" className="w-full p-4 border-2 border-slate-900 rounded-xl" />
              <input name="videoUrl" placeholder="Video URL (YouTube/Vimeo)" className="w-full p-4 border-2 border-slate-900 rounded-xl" />
              <textarea name="content" placeholder="Reading material / Notes" rows={5} className="w-full p-4 border-2 border-slate-900 rounded-xl" />
              <button className="w-full bg-yellow-400 p-4 rounded-xl font-black border-2 border-slate-900 hover:bg-yellow-300 transition-all">POST LESSON</button>
            </form>
          </section>
        </div>

        {/* RIGHT: STUDENT LIST */}
        <div className="space-y-6">
          <section className="bg-blue-600 text-white p-8 rounded-[2rem] border-4 border-slate-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-2"><UserCircle /> Students</h2>
            <div className="space-y-3">
              {course?.enrollments.map((en) => (
                <Link key={en.id} href={`/teacher/enrollments/${en.id}`} className="block p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-all border border-white/20">
                  <p className="font-bold">{en.user.name || en.user.email}</p>
                  <p className="text-xs text-blue-200">Set Schedule & Meet Link →</p>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}