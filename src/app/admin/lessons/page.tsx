'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Video, ListOrdered, Type, FileText, Loader2, Save } from 'lucide-react';

export default function AdminAddLesson() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingCourses, setFetchingCourses] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    videoUrl: '',
    content: '',
    order: '1',
    courseId: ''
  });

  const router = useRouter();

  // Load courses for the dropdown menu
  useEffect(() => {
    fetch('/api/courses')
      .then(res => res.json())
      .then(data => {
        setCourses(data);
        setFetchingCourses(false);
      })
      .catch(() => setFetchingCourses(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (res.ok) {
        alert("Lesson published successfully!");
        setFormData({ ...formData, title: '', videoUrl: '', content: '', order: (parseInt(formData.order) + 1).toString() });
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (err) {
      alert("Failed to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-20 px-6 font-sans">
      <div className="max-w-3xl mx-auto bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100">
        <div className="bg-slate-900 p-12 text-white">
          <h1 className="text-4xl font-black mb-2 tracking-tighter italic">Add Module</h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Course Curriculum Builder</p>
        </div>

        <form onSubmit={handleSubmit} className="p-12 space-y-8">
          {/* Course Selection */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Select Parent Course</label>
            <select 
              required
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-yellow-400 font-bold appearance-none"
              value={formData.courseId}
              onChange={e => setFormData({...formData, courseId: e.target.value})}
            >
              <option value="">-- Choose a Course --</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-3 space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Lesson Title</label>
              <input 
                required
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-yellow-400 font-bold"
                placeholder="e.g. Intro to IELTS Speaking"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>
            <div className="md:col-span-1 space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Order</label>
              <input 
                required
                type="number"
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-yellow-400 font-bold text-center"
                value={formData.order}
                onChange={e => setFormData({...formData, order: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Video URL (YouTube/Vimeo)</label>
            <input 
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-yellow-400 font-bold"
              placeholder="https://youtube.com/..."
              value={formData.videoUrl}
              onChange={e => setFormData({...formData, videoUrl: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Lesson Content (Text)</label>
            <textarea 
              rows={6}
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-yellow-400 font-bold"
              placeholder="Detailed explanation or notes..."
              value={formData.content}
              onChange={e => setFormData({...formData, content: e.target.value})}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading || fetchingCourses}
            className="w-full bg-slate-900 text-white py-6 rounded-2xl font-black hover:bg-yellow-400 hover:text-slate-900 transition-all flex items-center justify-center gap-3"
          >
            {loading ? <Loader2 className="animate-spin" /> : <><Save size={20}/> PUBLISH LESSON</>}
          </button>
        </form>
      </div>
    </div>
  );
}