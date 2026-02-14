'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { enrollInCourse } from '@/actions/course' // We'll create this next
import { Loader2, Zap } from 'lucide-react'

export default function EnrollButton({ courseId }: { courseId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleEnroll = async () => {
    setLoading(true)
    try {
      const result = await enrollInCourse(courseId)
      if (result.success) {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (error) {
      console.error("Enrollment failed", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button 
      onClick={handleEnroll}
      disabled={loading}
      className="w-full bg-yellow-400 text-slate-900 py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-yellow-300 transition-all active:scale-95 disabled:opacity-70"
    >
      {loading ? (
        <Loader2 className="animate-spin" size={20} />
      ) : (
        <>ENROLL NOW <Zap size={18} fill="currentColor" /></>
      )}
    </button>
  )
}