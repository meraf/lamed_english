'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { UserPlus, Image as ImageIcon, CheckCircle, Loader2, AlertCircle } from 'lucide-react';

export default function AdminAddTeacher() {
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    image: '',
    bio: '',
    expertise: '',
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Cloudinary Upload Logic
  const handleUpload = () => {
    // @ts-ignore
    const widget = window.cloudinary.createUploadWidget(

      { cloudName: 'Lamed-English', uploadPreset: 'lamed_preset' },
      (error: any, result: any) => {
        if (!error && result && result.event === "success") {
          setFormData(prev => ({ ...prev, image: result.info.secure_url }));
        }
      }
    );
    widget.open();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.image) {
      alert("Please upload a teacher portrait first!");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Success: Instructor added to database!");
        router.push('/teachers');
        router.refresh();
      } else {
        // This will now show you the SPECIFIC error from Prisma
        alert(`Server Error: ${data.error}`);
      }
    } catch (err) {
      alert("Network Error: Could not connect to the API. Check your terminal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-20 px-6">
      <Script src="https://upload-widget.cloudinary.com/global/all.js" strategy="beforeInteractive" />
      
      <div className="max-w-3xl mx-auto bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100">
        <div className="bg-slate-900 p-12 text-white text-center">
          <div className="bg-yellow-400 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3">
            <UserPlus className="text-slate-900" size={32} />
          </div>
          <h1 className="text-4xl font-black mb-2 tracking-tighter">Add Instructor</h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Faculty Management Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="p-12 space-y-8">
          {/* Image Upload Area */}
          <div className="space-y-2">
            <label className="text-sm font-black text-slate-900 uppercase tracking-widest ml-2">Teacher Portrait</label>
            <div 
              onClick={handleUpload}
              className={`border-4 border-dashed rounded-[2rem] p-10 text-center cursor-pointer transition-all duration-300 ${formData.image ? 'border-green-400 bg-green-50' : 'border-slate-100 bg-slate-50 hover:border-yellow-400'}`}
            >
              {formData.image ? (
                <div className="flex flex-col items-center gap-3">
                  <CheckCircle size={40} className="text-green-500" />
                  <img src={formData.image} className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-xl" alt="Preview"/>
                  <p className="text-green-600 font-black text-xs uppercase">Image Ready</p>
                </div>
              ) : (
                <div className="text-slate-400 flex flex-col items-center gap-2">
                  <ImageIcon size={40} />
                  <p className="font-bold">Click to Upload via Cloudinary</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input 
              required 
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-yellow-400 transition-all font-bold" 
              placeholder="Full Name" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})} 
            />
            <input 
              required 
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-yellow-400 transition-all font-bold" 
              placeholder="Role (e.g. IELTS Senior Coach)" 
              value={formData.role}
              onChange={e => setFormData({...formData, role: e.target.value})} 
            />
          </div>

          <input 
            required 
            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-yellow-400 transition-all font-bold" 
            placeholder="Expertise (e.g. Speaking, Writing, Business)" 
            value={formData.expertise}
            onChange={e => setFormData({...formData, expertise: e.target.value})} 
          />
          
          <textarea 
            required 
            rows={4} 
            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-yellow-400 transition-all font-bold" 
            placeholder="Tell us about the instructor's background..." 
            value={formData.bio}
            onChange={e => setFormData({...formData, bio: e.target.value})} 
          />

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-900 text-white py-6 rounded-2xl font-black hover:bg-yellow-400 hover:text-slate-900 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : "FINALIZE & SAVE INSTRUCTOR"}
          </button>
        </form>
      </div>
    </div>
  );
}