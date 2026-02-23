import { prisma } from "@/lib/prisma";
import { 
  Users, 
  Search, 
  Mail, 
  Calendar, 
  GraduationCap, 
  MoreVertical,
  ChevronRight
} from "lucide-react";

export default async function AdminStudentsPage() {
  // Fetch only regular users (students), including their course count
  const students = await prisma.user.findMany({
    where: {
      role: 'USER'
    },
    include: {
      _count: {
        select: { enrolledCourses: true }
      }
    },
    orderBy: {
      id: 'desc' // Newest students first
    }
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            Students <span className="text-sm bg-yellow-400 px-3 py-1 rounded-full">{students.length}</span>
          </h1>
          <p className="text-slate-500 mt-1">Manage and track your English learning community.</p>
        </div>

        {/* Search Bar Placeholder */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-yellow-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            className="pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-2xl w-full md:w-80 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Students Table/List */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">Student</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">Enrolled</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">Joined Date</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {students.length > 0 ? (
                students.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold group-hover:bg-yellow-400 group-hover:text-slate-900 transition-all">
                          {student.name ? student.name.charAt(0) : <Users size={18} />}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{student.name || "Anonymous Student"}</p>
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <Mail size={12} /> {student.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase bg-green-100 text-green-700">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        Active
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-slate-700">
                        <GraduationCap size={16} className="text-slate-400" />
                        <span className="font-bold">{student._count.enrolledCourses} Courses</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm text-slate-500">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        {new Date().toLocaleDateString()} 
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <button className="p-2 hover:bg-white hover:shadow-md rounded-lg transition-all text-slate-400 hover:text-slate-900">
                        <ChevronRight size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <Users size={48} className="text-slate-200" />
                      <p className="text-slate-400 font-bold">No students have signed up yet.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Quick Insight */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-yellow-400 p-8 rounded-[2rem] text-slate-900">
          <h3 className="text-lg font-black mb-2 uppercase tracking-tighter">Growth Tip</h3>
          <p className="font-medium opacity-80 leading-relaxed">
            Most of your students sign up on Monday mornings. Consider launching your next English workshop then for maximum enrollment!
          </p>
        </div>
        <div className="bg-slate-900 p-8 rounded-[2rem] text-white flex items-center justify-between border border-slate-800 shadow-2xl">
          <div>
            <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Weekly Signups</p>
            <p className="text-3xl font-black">{students.length}</p>
          </div>
          <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center text-yellow-400">
             <Users size={32} />
          </div>
        </div>
      </div>
    </div>
  );
}