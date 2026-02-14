'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { BookPlus, Image as ImageIcon, Loader2, DollarSign, AlertCircle } from 'lucide-react';

export default function AdminAddCourse() {
  const [teachers, setTeachers] = useState<any[]>([]); // Initialized as empty array
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    thumbnail: '',
    price: '',
    teacherId: ''
  });

  const router = useRouter();

  // Load teachers with error handling
  useEffect(() => {
    fetch('/api/teachers')
      .then(res => res.json())
      .then(data => {
        // Ensure data is an array before setting state
        if (Array.isArray(data)) {
          setTeachers(data);
        } else {
          console.error("API did not return an array:", data);
          setTeachers([]);
        }
      })
      .catch(err => {
        console.error("Error fetching teachers:", err);
        setTeachers([]);
      });
  }, []);

  const handleUpload = () => {
    // @ts-ignore
    const widget = window.cloudinary.createUploadWidget(

      { cloudName: 'Lamed-English', uploadPreset: 'lamed_preset' },
      (error: any, result: any) => {
        if (!error && result && result.event === "success") {
          setFormData(prev => ({ ...prev, thumbnail: result.info.secure_url }));
        }
      }
    );
    widget.open();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.thumbnail) return alert("Upload a thumbnail first!");
    
    setLoading(true);
    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert("Course created!");
        router.push('/courses');
        router.refresh();
      } else {
        const err = await res.json();
        alert(`Error: ${err.error}`);
      }
    } catch (error) {
      alert("Network error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-20 px-6">
      <Script src="https://upload-widget.cloudinary.com/global/all.js" strategy="beforeInteractive" />
      
      <div className="max-w-3xl mx-auto bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100">
        <div className="bg-slate-900 p-12 text-white">
          <h1 className="text-4xl font-black mb-2 tracking-tighter">New Course</h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Academic Catalog</p>
        </div>

        <form onSubmit={handleSubmit} className="p-12 space-y-8">
          {/* Thumbnail */}
          <div className="space-y-2">
            <div onClick={handleUpload} className="border-4 border-dashed rounded-[2.5rem] p-10 text-center cursor-pointer bg-slate-50 hover:border-yellow-400 transition-all">
              {formData.thumbnail ? (
                <img src={formData.thumbnail} className="w-48 mx-auto rounded-xl shadow-lg" alt="Preview"/>
              ) : (
                <div className="text-slate-400 flex flex-col items-center gap-2">
                  <ImageIcon size={40} />
                  <p className="font-bold text-xs uppercase">Upload Banner</p>
                </div>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            <input 
              required
              className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-yellow-400 font-bold"
              placeholder="Course Title"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input 
                required
                type="number"
                className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-yellow-400 font-bold"
                placeholder="Price ($)"
                value={formData.price}
                onChange={e => setFormData({...formData, price: e.target.value})}
              />

              <select 
                required
                className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-yellow-400 font-bold"
                value={formData.teacherId}
                onChange={e => setFormData({...formData, teacherId: e.target.value})}
              >
                <option value="">-- Assign Teacher --</option>
                {/* SAFE MAP CHECK */}
                {Array.isArray(teachers) && teachers.length > 0 ? (
                  teachers.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))
                ) : (
                  <option disabled>No teachers found</option>
                )}
              </select>
            </div>

            <textarea 
              required
              rows={4}
              className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-yellow-400 font-bold"
              placeholder="Description..."
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-900 text-white py-6 rounded-2xl font-black hover:bg-yellow-400 hover:text-slate-900 transition-all flex items-center justify-center gap-3"
          >
            {loading ? <Loader2 className="animate-spin" /> : "CREATE COURSE"}
          </button>
        </form>
      </div>
    </div>
  );
}