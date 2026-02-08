import { prisma } from "@/lib/prisma";
import { createLesson } from "@/lib/actions";
import { revalidatePath } from "next/cache";

export default async function AdminPage() {
  const courses = await prisma.course.findMany();

  async function handleAddLesson(formData: FormData) {
    "use server";
    await createLesson(formData);
  }

  return (
    <div className="min-h-screen bg-slate-50 p-12">
      <div className="max-w-2xl mx-auto bg-white p-10 rounded-[2rem] shadow-xl border border-slate-100">
        <h1 className="text-3xl font-black text-slate-900 mb-8">Admin: Add New Lesson</h1>
        
        <form action={handleAddLesson} className="space-y-6">
          <div>
            <label className="block text-xs font-black uppercase text-slate-400 mb-2">Select Course</label>
            <select name="courseId" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold">
              {courses.map(course => (
                <option key={course.id} value={course.id}>{course.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-slate-400 mb-2">Lesson Title</label>
            <input name="title" type="text" placeholder="e.g. Present Continuous" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl" required />
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-slate-400 mb-2">Video URL (YouTube/Vimeo)</label>
            <input name="videoUrl" type="text" placeholder="https://..." className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl" required />
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-slate-400 mb-2">Order Number</label>
            <input name="order" type="number" placeholder="1" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl" required />
          </div>

          <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-xl font-black hover:bg-slate-800 transition-all">
            Create Lesson
          </button>
        </form>
      </div>
    </div>
  );
}