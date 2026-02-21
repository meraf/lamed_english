'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { BookPlus, Image as ImageIcon, Loader2, DollarSign, AlertCircle } from 'lucide-react';

export default function AdminAddCourse() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false); // Track script status
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    thumbnail: '',
    price: '',
    teacherId: ''
  });

  const router = useRouter();

  // Load teachers
  useEffect(() => {
    fetch('/api/teachers')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setTeachers(data);
      })
      .catch(err => console.error("Error fetching teachers:", err));
  }, []);

  // ✅ Optimized Upload Handler
  const handleUpload = useCallback(() => {
    if (!scriptLoaded) {
      alert("Cloudinary library is still initializing. Please wait a moment.");
      return;
    }

    const windowAny = window as any;
    if (windowAny.cloudinary) {
      const myWidget = windowAny.cloudinary.createUploadWidget(
        {
          cloudName: 'Lamed-English',
          uploadPreset: 'lamed_preset',
          sources: ['local', 'url', 'camera'],
          multiple: false,
          cropping: true, // Optional: helpful for course banners
          styles: {
            palette: {
              window: "#FFFFFF",
              sourceTabIcon: "#000000",
              menuIcons: "#000000",
              link: "#FACC15", // Matches your yellow theme
              action: "#000000",
              inProgress: "#FACC15",
              complete: "#22C55E",
              error: "#EF4444",
              textDark: "#000000",
              textLight: "#FFFFFF"
            }
          }
        },
        (error: any, result: any) => {
          if (!error && result && result.event === "success") {
            console.log("Done! Here is the info: ", result.info);
            setFormData(prev => ({ ...prev, thumbnail: result.info.secure_url }));
          }
        }
      );
      myWidget.open();
    }
  }, [scriptLoaded]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.thumbnail) return alert("Please upload a thumbnail first!");
    
    setLoading(true);
    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price)
        }),
      });

      if (res.ok) {
        alert("Course created!");
        router.push('/courses');
        router.refresh();
      } else {
        const err = await res.json();
        alert(`Error: ${err.message || "Failed"}`);
      }
    } catch (error) {
      alert("Network error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-20 px-6">
      {/* ✅ Strategy changed to lazyOnload to ensure window is ready */}
      <Script 
        src="https://upload-widget.cloudinary.com/global/all.js" 
        strategy="lazyOnload" 
        onLoad={() => setScriptLoaded(true)}
      />
      
      <div className="max-w-3xl mx-auto bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100">
        <div className="bg-slate-900 p-12 text-white">
          <h1 className="text-4xl font-black mb-2 tracking-tighter italic">New Course</h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Lamed English Admin</p>
        </div>

        <form onSubmit={handleSubmit} className="p-12 space-y-8">
          {/* Thumbnail Box */}
          <div className="space-y-2">
            <div 
              onClick={handleUpload} 
              className={`border-4 border-dashed rounded-[2.5rem] p-10 text-center cursor-pointer transition-all ${
                formData.thumbnail ? 'border-yellow-400 bg-yellow-50/30' : 'bg-slate-50 hover:border-yellow-400'
              } ${!scriptLoaded ? 'opacity-50 cursor-wait' : ''}`}
            >
              {formData.thumbnail ? (
                <div className="relative inline-block">
                  <img src={formData.thumbnail} className="w-48 mx-auto rounded-xl shadow-lg border-2 border-white" alt="Preview"/>
                  <p className="mt-4 text-[10px] font-black uppercase text-yellow-600">Click to change banner</p>
                </div>
              ) : (
                <div className="text-slate-400 flex flex-col items-center gap-2">
                  <ImageIcon size={40} />
                  <p className="font-bold text-xs uppercase tracking-tighter">
                    {scriptLoaded ? "Upload Course Banner" : "Loading Cloudinary..."}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <input 
              required
              className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-yellow-400 font-bold"
              placeholder="Course Title"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  required
                  type="number"
                  step="0.01"
                  className="w-full pl-14 pr-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-yellow-400 font-bold"
                  placeholder="Price"
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: e.target.value})}
                />
              </div>

              <select 
                required
                className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-yellow-400 font-bold"
                value={formData.teacherId}
                onChange={e => setFormData({...formData, teacherId: e.target.value})}
              >
                <option value="">Assign Teacher</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <textarea 
              required
              rows={4}
              className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-yellow-400 font-bold resize-none"
              placeholder="Description..."
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-900 text-white py-6 rounded-2xl font-black hover:bg-yellow-400 hover:text-slate-900 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : "CREATE COURSE"}
          </button>
        </form>
      </div>
    </div>
  );
}