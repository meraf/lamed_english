import { prisma } from "@/lib/prisma";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Video, FileText, Users, Megaphone, Calendar, Link as LinkIcon, GraduationCap } from "lucide-react";
import Link from "next/link";

export default async function TeacherCoursePage({ params }: { params: { id: string } }) {
  // 1. Fetch data using the NEW relation names: 'enrollments' instead of 'users'
  const course = await prisma.course.findUnique({
    where: { id: params.id },
    include: {
      lessons: { 
        include: { assignments: true, exams: true, materials: true },
        orderBy: { order: 'asc' }
      },
      enrollments: { include: { user: true, appointments: true } }
    }
  });

  if (!course) return <div className="p-20 text-center font-black">Course not found</div>;

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black text-slate-900 leading-none">
              {course.title} 
            </h1>
            <span className="text-blue-600 font-bold uppercase text-xs tracking-widest">Teacher Portal</span>
          </div>
          <div className="bg-white px-6 py-3 rounded-2xl border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
             <p className="text-[10px] font-black uppercase text-slate-400">Total Students</p>
             <p className="text-2xl font-black">{course.enrollments.length}</p>
          </div>
        </header>

        <Tabs defaultValue="content" className="space-y-6">
          <TabsList className="bg-white p-1 rounded-2xl border border-slate-200">
            <TabsTrigger value="content">Lessons & Materials</TabsTrigger>
            <TabsTrigger value="students">Student Schedules</TabsTrigger>
            <TabsTrigger value="grading">Grading Hub</TabsTrigger>
          </TabsList>

          {/* 1. LESSON & MATERIAL MANAGEMENT */}
          <TabsContent value="content" className="space-y-4">
            {course.lessons.map((lesson) => (
              <div key={lesson.id} className="bg-white p-6 rounded-3xl border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-y-[-2px]">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-black text-xl italic uppercase underline decoration-yellow-400 decoration-4">{lesson.title}</h3>
                  <button className="text-[10px] font-black uppercase bg-slate-900 text-white px-4 py-2 rounded-xl">+ Add Content</button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200">
                    <p className="text-[10px] font-black text-blue-500 uppercase mb-2">Reading Materials</p>
                    {lesson.materials.map(m => <div key={m.id} className="text-xs font-bold flex items-center gap-2 mb-2 bg-white p-2 rounded-lg"><FileText size={12}/> {m.title}</div>)}
                  </div>
                  <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200">
                    <p className="text-[10px] font-black text-purple-500 uppercase mb-2">Assignments</p>
                    {lesson.assignments.map(a => <div key={a.id} className="text-xs font-bold flex items-center gap-2 mb-2 bg-white p-2 rounded-lg"><Video size={12}/> {a.title}</div>)}
                  </div>
                  <div className="p-4 bg-orange-50 rounded-2xl border border-orange-200">
                    <p className="text-[10px] font-black text-orange-500 uppercase mb-2">Exams</p>
                    {lesson.exams.map(e => <div key={e.id} className="text-xs font-bold flex items-center gap-2 mb-2 bg-white p-2 rounded-lg"><LinkIcon size={12}/> {e.title}</div>)}
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* 2. INDIVIDUAL STUDENT MANAGEMENT (Google Meet & Mon/Wed/Fri) */}
          <TabsContent value="students" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {course.enrollments.map((en) => (
               <div key={en.id} className="bg-white p-6 rounded-[2rem] border-2 border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center font-black text-slate-400">
                        {en.user.name?.[0] || "S"}
                      </div>
                      <div>
                        <p className="font-black text-lg leading-none">{en.user.name || "Student"}</p>
                        <p className="text-[10px] font-bold text-slate-400">{en.user.email}</p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-6">
                      <p className="text-[10px] font-black uppercase text-slate-400">Current Schedule</p>
                      {en.appointments.length > 0 ? (
                        en.appointments.map(app => (
                          <div key={app.id} className="flex justify-between text-xs font-bold bg-slate-50 p-2 rounded-lg">
                            <span>{app.dayOfWeek}</span>
                            <span>{app.startTime}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs italic text-red-400">No schedule set</p>
                      )}
                    </div>
                  </div>

                  <Link 
                    href={`/teacher/enrollments/${en.id}`}
                    className="w-full bg-blue-600 text-white text-center py-3 rounded-xl font-black text-xs uppercase hover:bg-blue-700 transition-colors"
                  >
                    Set Meet Link & Time
                  </Link>
               </div>
             ))}
          </TabsContent>

          {/* 3. GRADING HUB */}
          <TabsContent value="grading">
             <div className="bg-white p-10 rounded-[3rem] border-2 border-dashed border-slate-300 text-center">
                <GraduationCap className="mx-auto mb-4 text-slate-300" size={48} />
                <h2 className="text-xl font-black">Gradebook</h2>
                <p className="text-slate-500 mb-6">Review submitted assignments and exams from your students.</p>
                <Link href="/teacher/grading" className="inline-block bg-slate-900 text-white px-8 py-3 rounded-xl font-black text-xs uppercase">Open Submissions</Link>
             </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}