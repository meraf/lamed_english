import { prisma } from "@/lib/prisma";
import { gradeWork } from "@/actions/teacher";

export default async function GradingPage() {
  const submissions = await prisma.submission.findMany({
    where: { status: "SUBMITTED" },
    include: { user: true, assignment: true }
  });

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-4xl font-black mb-10 italic">GRADEBOOK</h1>
      <div className="space-y-6">
        {submissions.map((sub) => (
          <div key={sub.id} className="bg-white p-8 rounded-[2rem] border-4 border-slate-900 flex flex-col md:flex-row gap-6 justify-between items-center">
            <div>
              <p className="text-xs font-black uppercase text-blue-500">{sub.assignment.title}</p>
              <h3 className="text-xl font-bold">{sub.user.name}</h3>
              <p className="text-slate-500 text-sm mt-2 italic">"{sub.content}"</p>
              {sub.fileUrl && <a href={sub.fileUrl} className="text-blue-600 font-black text-xs underline mt-2 block">VIEW PDF ATTACHMENT</a>}
            </div>
            
            <form action={async (formData) => {
              "use server"
              const score = Number(formData.get("score"));
              await gradeWork(sub.id, score, 'ASSIGNMENT');
            }} className="flex gap-2">
              <input name="score" type="number" placeholder="Score/100" className="w-24 p-3 border-2 border-slate-900 rounded-xl" />
              <button className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-xs uppercase">SAVE</button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}