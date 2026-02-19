'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { enrollInCourse } from '@/actions/course'
import { Loader2, Zap } from 'lucide-react'

// ✅ FIX: Added userId to the type definition so TypeScript allows it
interface EnrollButtonProps {
  courseId: string;
  userId?: string; // The '?' makes it optional, preventing errors if a guest views the page
}

export default function EnrollButton({ courseId, userId }: EnrollButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleEnroll = async () => {
    // Optional: If no userId exists, redirect to sign-in immediately
    if (!userId) {
      router.push('/api/auth/signin')
      return
    }

    setLoading(true)
    try {
      const result = await enrollInCourse(courseId)
      if (result.success) {
        // Redirect to the first lesson or dashboard
        router.push(`/dashboard`) 
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
      className="w-full md:w-fit px-12 bg-yellow-400 text-slate-900 py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-yellow-300 transition-all active:scale-95 disabled:opacity-70 shadow-xl shadow-yellow-400/20"
    >
      {loading ? (
        <Loader2 className="animate-spin" size={20} />
      ) : (
        <>ENROLL NOW <Zap size={18} fill="currentColor" /></>
      )}
    </button>
  )
}