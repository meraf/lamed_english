'use client';

import React, { useState } from 'react';
import { CheckCircle, Circle, Loader2 } from 'lucide-react';
import { toggleProgress } from '@/lib/progress';
import { useRouter } from 'next/navigation';

interface CompleteButtonProps {
  userId: string;
  lessonId: string;
  courseId: string;
  isCompleted: boolean;
}

export default function CompleteButton({ userId, lessonId, courseId, isCompleted }: CompleteButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleToggle = async () => {
    setLoading(true);
    const result = await toggleProgress(userId, lessonId, courseId);
    
    if (result.success) {
      router.refresh(); // Refresh the page to update the sidebar checkmarks
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50 ${
        isCompleted 
          ? 'bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-green-500/20' 
          : 'bg-yellow-400 text-slate-900 hover:bg-yellow-500 shadow-lg shadow-yellow-400/20'
      }`}
    >
      {loading ? (
        <Loader2 size={20} className="animate-spin" />
      ) : isCompleted ? (
        <CheckCircle size={20} />
      ) : (
        <Circle size={20} />
      )}
      {isCompleted ? 'Completed' : 'Mark as Complete'}
    </button>
  );
}