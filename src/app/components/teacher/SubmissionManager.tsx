"use client";

import { useState } from "react";
import { Check, ExternalLink, User } from "lucide-react";

export default function SubmissionManager({ lesson }: { lesson: any }) {
  const [activeType, setActiveType] = useState<"exams" | "assignments">("exams");

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex border-b">
        <button 
          onClick={() => setActiveType("exams")}
          className={`flex-1 p-6 font-black text-[10px] uppercase tracking-widest transition-colors ${activeType === "exams" ? "bg-slate-900 text-white" : "text-slate-400 hover:bg-slate-50"}`}
        >
          Exam Submissions
        </button>
        <button 
          onClick={() => setActiveType("assignments")}
          className={`flex-1 p-6 font-black text-[10px] uppercase tracking-widest transition-colors ${activeType === "assignments" ? "bg-slate-900 text-white" : "text-slate-400 hover:bg-slate-50"}`}
        >
          Assignment Work
        </button>
      </div>

      <div className="p-8">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] font-black text-slate-400 uppercase border-b">
              <th className="pb-4">Student</th>
              <th className="pb-4">Submission</th>
              <th className="pb-4">Score / Status</th>
              <th className="pb-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {activeType === "exams" ? (
              lesson.exams.flatMap((ex: any) => ex.results.map((res: any) => (
                <tr key={res.id} className="group">
                  <td className="py-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400"><User size={20}/></div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{res.user.name || res.user.email}</p>
                      <p className="text-[10px] font-black uppercase text-slate-400">{ex.title}</p>
                    </div>
                  </td>
                  <td className="py-6">
                    <div className="max-w-xs">
                      <p className="text-xs text-slate-600 line-clamp-2 italic">"{res.textAnswer || "No text provided"}"</p>
                      {res.fileUrl && <a href={res.fileUrl} target="_blank" className="text-blue-600 text-[10px] font-black uppercase flex items-center gap-1 mt-1"><ExternalLink size={12}/> View Paper</a>}
                    </div>
                  </td>
                  <td className="py-6">
                    <input 
                      type="number" 
                      placeholder="Score" 
                      defaultValue={res.score || ""} 
                      className="w-20 p-2 rounded-lg border text-sm font-bold"
                      onBlur={(e) => {/* Add API Call to save score */}}
                    />
                  </td>
                  <td className="py-6 text-right">
                    <button className="bg-slate-100 p-3 rounded-xl group-hover:bg-green-500 group-hover:text-white transition-all">
                      <Check size={16}/>
                    </button>
                  </td>
                </tr>
              )))
            ) : (
              // Logic for Assignments is identical, just mapping lesson.assignments -> submissions
              <tr className="text-center py-20"><td colSpan={4} className="py-10 text-slate-400 text-xs font-bold uppercase">No assignments submitted yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}