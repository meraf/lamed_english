'use client'

import { unenrollFromCourse } from "@/lib/actions"
import { Trash2 } from "lucide-react"
import { useTransition } from "react"

export function UnenrollButton({ courseId }: { courseId: string }) {
  const [isPending, startTransition] = useTransition()

  const handleUnenroll = () => {
    // Standard browser confirmation for safety
    if (confirm("Are you sure? Your progress will be saved, but the course will be removed from your dashboard.")) {
      startTransition(async () => {
        const result = await unenrollFromCourse(courseId)
        if (result?.error) {
            alert(result.error)
        }
      })
    }
  }

  return (
    <button 
      onClick={handleUnenroll}
      disabled={isPending}
      className="p-3 rounded-2xl border border-slate-100 text-slate-300 hover:text-red-500 hover:bg-red-50 hover:border-red-100 transition-all disabled:opacity-50 group"
      title="Leave Course"
    >
      <Trash2 
        size={18} 
        className={`${isPending ? "animate-pulse" : "group-hover:scale-110 transition-transform"}`} 
      />
    </button>
  )
}