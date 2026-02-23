'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toggleLessonProgress } from '@/actions/course'
import { CheckCircle2, Loader2 } from 'lucide-react'

export default function CompleteButton({ lessonId, isCompleted }: { lessonId: string, isCompleted: boolean }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleToggle = async () => {
    setLoading(true)
    try {
      await toggleLessonProgress(lessonId)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <button 
      onClick={handleToggle}
      disabled={loading}
      className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-black transition-all active:scale-95 ${
        isCompleted 
        ? "bg-green-100 text-green-700 hover:bg-green-200" 
        : "bg-slate-900 text-yellow-400 hover:bg-slate-800 shadow-lg"
      }`}
    >
      {loading ? (
        <Loader2 className="animate-spin" size={20} />
      ) : (
        <>
          {isCompleted ? "COMPLETED" : "MARK AS COMPLETE"}
          <CheckCircle2 size={20} fill={isCompleted ? "currentColor" : "none"} />
        </>
      )}
    </button>
  )
}