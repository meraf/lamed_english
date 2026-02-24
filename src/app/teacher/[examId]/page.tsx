import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export default async function TeacherExamBuilder({ params }: { params: { examId: string } }) {
  const exam = await prisma.exam.findUnique({
    where: { id: params.examId },
    include: { questions: { include: { options: true } } }
  });

  async function addQuestion(formData: FormData) {
    "use server"
    const text = formData.get("questionText") as string;
    const opt1 = formData.get("opt1") as string;
    const opt2 = formData.get("opt2") as string;
    const correctStr = formData.get("correctOption") as string;

    await prisma.question.create({
      data: {
        text,
        examId: params.examId,
        options: {
          create: [
            { text: opt1, isCorrect: correctStr === "1" },
            { text: opt2, isCorrect: correctStr === "2" }
          ]
        }
      }
    });
    revalidatePath(`/teacher/exams/${params.examId}`);
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-black">Builder: {exam?.title}</h1>

      <div className="bg-white p-6 rounded-3xl border-4 border-slate-900">
        <h2 className="text-xl font-bold mb-4">+ Add New Question</h2>
        <form action={addQuestion} className="space-y-4">
          <textarea name="questionText" placeholder="Question Text" className="w-full p-4 border-2 border-slate-900 rounded-xl" required />
          <div className="grid grid-cols-2 gap-4">
             <input name="opt1" placeholder="Option 1" className="p-4 border-2 border-slate-900 rounded-xl" required />
             <input name="opt2" placeholder="Option 2" className="p-4 border-2 border-slate-900 rounded-xl" required />
          </div>
          <select name="correctOption" className="w-full p-4 border-2 border-slate-900 rounded-xl" required>
            <option value="1">Option 1 is Correct</option>
            <option value="2">Option 2 is Correct</option>
          </select>
          <button className="bg-yellow-400 font-black px-6 py-4 rounded-xl border-2 border-slate-900 w-full">SAVE QUESTION</button>
        </form>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">Existing Questions</h2>
        {exam?.questions.map((q, i) => (
          <div key={q.id} className="p-6 bg-slate-50 border-2 border-slate-200 rounded-2xl">
            <p className="font-bold mb-3">{i + 1}. {q.text}</p>
            <ul className="space-y-2">
              {q.options.map(o => (
                <li key={o.id} className={`text-sm p-2 rounded-md ${o.isCorrect ? 'bg-green-100 text-green-800 font-bold' : 'bg-white border'}`}>
                  {o.text} {o.isCorrect && "(Correct)"}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}