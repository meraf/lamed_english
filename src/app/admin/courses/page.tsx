'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { BookPlus, Image as ImageIcon, Loader2 } from 'lucide-react';

export default function AdminAddCourse() {
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    thumbnail: '',
    teacherId: '',
    category: 'English', // Default value
    level: 'Beginner'    // Default value
  });

  const router = useRouter();

  // 1. Fetch Teachers and Force-Check Cloudinary Script
  useEffect(() => {
    async function fetchTeachers() {
      try {
        const res = await fetch('/api/teachers');
        const data = await res.json();
        if (Array.isArray(data)) setTeachers(data);
      } catch (err) {
        console.error("Failed to load teachers");
      }
    }
    fetchTeachers();

    // Loop check for Cloudinary script (Fastest way to ensure availability)
    const timer = setInterval(() => {
      if ((window as any).cloudinary) {
        setScriptLoaded(true);
        clearInterval(timer);
      }
    }, 500);
    return () => clearInterval(timer);
  }, []);

  const handleUpload = useCallback(() => {
    const windowAny = window as any;
    if (!windowAny.cloudinary) {
      alert("Cloudinary script is not ready yet. Please check your connection or Ad-Blockers.");
      return;
    }

    const myWidget = windowAny.cloudinary.createUploadWidget(
      {
        cloudName: 'Lamed-English',
        uploadPreset: 'lamed_preset',
        sources: ['local', 'url'],
        multiple: false,
        cropping: true,
        croppingAspectRatio: 1.5, // Course banners are wider
      },
      (error: any, result: any) => {
        if (!error && result && result.event === "success") {
          setFormData(prev => ({ ...prev, thumbnail: result.info.secure_url }));
        }
      }
    );
    myWidget.open();
  }, [scriptLoaded]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.thumbnail) return alert("Please upload a course banner first!");
    if (!formData.teacherId) return alert("Please assign an instructor!");
    
    setLoading(true);
    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (res.ok) {
        alert("Course published successfully!");
        router.push('/admin/courses');
        router.refresh();
      } else {
        alert(result.details || result.error || "Error saving course.");
      }
    } catch (error) {
      alert("Network error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-6">
      <Script 
        src="https://upload-widget.cloudinary.com/global/all.js" 
        strategy="beforeInteractive" 
      />
      
      <div className="max-w-3xl mx-auto bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100">
        <div className="bg-[#101827] p-12 text-center">
          <div className="bg-yellow-400 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
            <BookPlus className="text-slate-900" />
          </div>
          <h1 className="text-4xl font-black text-white mb-2 tracking-tighter">Add New Course</h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Course Management Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="p-12 space-y-8">
          {/* Banner Upload Area */}
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Course Banner</label>
            <div 
              onClick={handleUpload} 
              className={`border-4 border-dashed rounded-[2.5rem] p-10 text-center cursor-pointer transition-all ${
                formData.thumbnail ? 'border-yellow-400 bg-yellow-50/30' : 'bg-slate-50 hover:border-yellow-400'
              }`}
            >
              {formData.thumbnail ? (
                <img src={formData.thumbnail} className="w-full h-48 mx-auto rounded-2xl object-cover shadow-lg border-4 border-white" alt="Thumbnail"/>
              ) : (
                <div className="text-slate-400 flex flex-col items-center gap-2">
                  <ImageIcon size={40} />
                  <p className="font-bold text-xs uppercase">
                    {scriptLoaded ? "Upload Banner" : "Loading Cloudinary..."}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input 
              required
              className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-yellow-400 font-bold"
              placeholder="Course Title"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
            <input 
              required
              type="number"
              step="0.01"
              className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-yellow-400 font-bold"
              placeholder="Price (USD)"
              value={formData.price}
              onChange={e => setFormData({...formData, price: e.target.value})}
            />
          </div>

          <select 
            required
            className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-yellow-400 font-bold appearance-none"
            value={formData.teacherId}
            onChange={e => setFormData({...formData, teacherId: e.target.value})}
          >
            <option value="">Select Instructor</option>
            {teachers.map(teacher => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.name || teacher.user?.name || "Unnamed Instructor"}
              </option>
            ))}
          </select>

          <textarea 
            required
            rows={4}
            className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-yellow-400 font-bold resize-none"
            placeholder="Course description and syllabus..."
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
          />

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#101827] text-white py-6 rounded-2xl font-black hover:bg-yellow-400 hover:text-slate-900 transition-all uppercase tracking-widest text-sm"
          >
            {loading ? <Loader2 className="animate-spin mx-auto" /> : "Publish Course"}
          </button>
        </form>
      </div>
    </div>
  );
}