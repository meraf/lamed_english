"use client"
import { useState, useRef, useEffect } from "react";
import { 
  Play, Book, FileText, Bell, PenTool, CheckCircle, 
  Download, Upload, Lock, ChevronLeft, Video, Eye, X, Clock, Megaphone, ExternalLink
} from "lucide-react";
import Link from "next/link";

export default function ClassroomClient({ user, lesson, course }: any) {
  const [activeTab, setActiveTab] = useState("video");
  const [viewedLessons, setViewedLessons] = useState<string[]>([]);
  const [isPreviewing, setIsPreviewing] = useState(false);
  
  // Exam State
  const [examAnswer, setExamAnswer] = useState("");
  const [isSubmittingExam, setIsSubmittingExam] = useState(false);

  // Check if current exam is already submitted (logic based on your schema)
  const currentExam = lesson?.exams?.[0];
  const userResult = user?.examResults?.find((r: any) => r.examId === currentExam?.id);
  const hasSubmittedExam = !!userResult;

  useEffect(() => {
    const saved = localStorage.getItem(`viewed-${course?.id}`);
    if (saved) setViewedLessons(JSON.parse(saved));
  }, [course?.id]);

  const handleLessonClick = (id: string) => {
    if (!viewedLessons.includes(id)) {
      const updated = [...viewedLessons, id];
      setViewedLessons(updated);
      localStorage.setItem(`viewed-${course?.id}`, JSON.stringify(updated));
    }
  };

  const handleExamSubmit = () => {
    setIsSubmittingExam(true);
    // Simulation of database push
    setTimeout(() => {
      alert("Exam submitted successfully! It cannot be changed.");
      setIsSubmittingExam(false);
      // In a real app, you would refresh the page or update the server component data here
    }, 1500);
  };

  // Helper to fix "Refused to connect" - Uses Google Viewer for PDFs/Docs
  const getSafePreviewUrl = (url: string) => {
    if (!url) return "";
    return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      
      {/* LEFT SIDEBAR */}
      <aside className="w-[320px] border-r border-slate-200 flex flex-col bg-white shrink-0 shadow-sm z-10">
        <div className="p-6 border-b border-slate-100">
          <Link href="/dashboard" className="text-[10px] font-black text-slate-400 hover:text-slate-900 transition-colors flex items-center gap-1 uppercase tracking-widest mb-6">
            <ChevronLeft size={14} /> Dashboard
          </Link>
          <h1 className="text-xl font-black leading-tight mb-6">{course?.title}</h1>

          {/* YELLOW MEET BUTTON */}
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-3xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-yellow-400 rounded-xl text-slate-900 animate-pulse">
                <Video size={16} />
              </div>
              <span className="text-[10px] font-black text-yellow-700 uppercase tracking-widest">Live Class Now</span>
            </div>
            <button className="w-full py-4 bg-yellow-400 hover:bg-yellow-500 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-lg shadow-yellow-200">
              Join Meet
            </button>
          </div>
        </div>

        {/* LESSON LIST */}
        <nav className="flex-grow overflow-y-auto p-4 space-y-1">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-4 mb-2">Modules</p>
          {course?.lessons?.map((l: any, index: number) => {
            const isActive = l.id === lesson.id;
            const isDone = user?.progress?.some((p: any) => p.lessonId === l.id && p.completed);
            const hasViewed = viewedLessons.includes(l.id);

            return (
              <Link key={l.id} href={`/learn/${course.id}/${l.id}`} onClick={() => handleLessonClick(l.id)}
                className={`flex items-start gap-3 p-4 rounded-2xl transition-all ${isActive ? 'bg-slate-100 border border-slate-200' : 'hover:bg-slate-50 border border-transparent'}`}>
                <span className={`text-[10px] font-black mt-0.5 ${isActive ? 'text-slate-900' : 'text-slate-400'}`}>
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className={`text-xs font-bold leading-relaxed flex-grow ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>
                  {l.title}
                </span>
                {isDone ? <CheckCircle size={14} className="text-green-500 mt-0.5" /> : 
                 hasViewed ? <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5" /> : 
                 <span className="bg-yellow-400 text-slate-900 text-[7px] font-black px-1.5 py-0.5 rounded mt-0.5">NEW</span>}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-grow overflow-y-auto bg-white">
        <div className="p-8 lg:p-12">
          
          <h2 className="text-4xl font-black mb-8">IELTS MASTERY 2026</h2>

          {/* TABS IN LINE (Matches Screenshot) */}
          <div className="flex flex-wrap gap-3 mb-10">
            <TabBtn icon={<Play size={14}/>} label="Video" active={activeTab === 'video'} onClick={() => setActiveTab('video')} />
            <TabBtn icon={<Book size={14}/>} label="Reading" active={activeTab === 'reading'} onClick={() => {setActiveTab('reading'); setIsPreviewing(false)}} />
            <TabBtn icon={<PenTool size={14}/>} label="Exam" active={activeTab === 'exam'} onClick={() => setActiveTab('exam')} />
            <TabBtn icon={<FileText size={14}/>} label="Assignments" active={activeTab === 'assign'} onClick={() => setActiveTab('assign')} />
            <TabBtn icon={<Bell size={14}/>} label="News" active={activeTab === 'news'} onClick={() => setActiveTab('news')} />
          </div>

          {/* VIDEO TAB */}
          {activeTab === 'video' && (
            <div className="animate-in fade-in">
              <div className="aspect-video w-full bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl mb-8">
                <iframe src={lesson?.videoUrl} className="w-full h-full border-0" allowFullScreen />
              </div>
              <h3 className="text-2xl font-black">{lesson?.title}</h3>
            </div>
          )}

          {/* READING TAB (Fixed Iframe) */}
          {activeTab === 'reading' && (
            <div className="animate-in slide-in-from-bottom-4">
              {isPreviewing ? (
                <div className="space-y-4">
                  <button onClick={() => setIsPreviewing(false)} className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-slate-900 uppercase">
                    <ChevronLeft size={14}/> Close Preview
                  </button>
                  <div className="w-full h-[70vh] bg-slate-100 rounded-[2rem] overflow-hidden border border-slate-200">
                    <iframe 
                      src={getSafePreviewUrl(lesson?.materials?.[0]?.fileUrl)} 
                      className="w-full h-full" 
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 p-12 rounded-[3rem] border-2 border-dashed border-slate-200 text-center">
                  <Book size={48} className="mx-auto text-slate-300 mb-6" />
                  <h3 className="text-2xl font-black mb-2">{lesson?.materials?.[0]?.title || "Study Material"}</h3>
                  <div className="flex justify-center gap-4 mt-8">
                    <button onClick={() => setIsPreviewing(true)} className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-yellow-400 hover:text-slate-900 transition-all">
                      Read Online
                    </button>
                    <a href={lesson?.materials?.[0]?.fileUrl} target="_blank" rel="noopener noreferrer" className="px-8 py-4 bg-white border-2 border-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all flex items-center gap-2">
                      Download <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* EXAM TAB (Database Fetching Logic) */}
          {activeTab === 'exam' && (
            <div className="max-w-3xl mx-auto animate-in zoom-in-95">
              {currentExam ? (
                <div className="bg-slate-900 rounded-[3rem] overflow-hidden shadow-2xl">
                  <div className="p-10 border-b border-white/10 flex justify-between items-center">
                    <h2 className="text-3xl font-black text-white">{currentExam.title}</h2>
                    <PenTool className="text-yellow-400" size={32} />
                  </div>
                  
                  <div className="p-10 bg-white m-4 rounded-[2rem]">
                    {hasSubmittedExam ? (
                      <div className="text-center py-10">
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                          <CheckCircle size={40} />
                        </div>
                        <h3 className="text-2xl font-black mb-2">Assessment Submitted</h3>
                        <p className="text-slate-500 mb-8 font-medium italic">"Once submitted, answers cannot be modified."</p>
                        
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 inline-block min-w-[240px]">
                          <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Status</p>
                          <p className="text-xl font-black text-slate-900">
                            {userResult.score !== null ? `GRADED: ${userResult.score}%` : "SUBMITTED TO BE GRADED"}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <p className="text-slate-600 font-medium leading-relaxed bg-slate-50 p-6 rounded-2xl border border-slate-100">
                          <strong>Instructions:</strong> Please provide your detailed answers below. You may also upload a supporting file if required.
                        </p>
                        
                        <textarea 
                          value={examAnswer}
                          onChange={(e) => setExamAnswer(e.target.value)}
                          placeholder="Type your answers here..."
                          className="w-full h-64 p-6 bg-slate-50 rounded-2xl border-2 border-slate-100 focus:border-yellow-400 focus:outline-none font-medium transition-all"
                        />

                        <button 
                          onClick={handleExamSubmit}
                          disabled={isSubmittingExam || !examAnswer}
                          className="w-full py-6 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-yellow-400 hover:text-slate-900 transition-all disabled:opacity-50"
                        >
                          {isSubmittingExam ? 'SUBMITTING...' : 'FINISH & SUBMIT'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                  <Lock size={48} className="mx-auto text-slate-200 mb-4" />
                  <p className="font-bold text-slate-400 uppercase text-[10px] tracking-widest">No Exam Available for this Module</p>
                </div>
              )}
            </div>
          )}

          {/* ANNOUNCEMENTS (NEWS) */}
          {activeTab === 'news' && (
            <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
              <h3 className="text-2xl font-black flex items-center gap-3">
                <Megaphone className="text-yellow-500" /> Recent Updates
              </h3>
              {course?.announcements?.map((ann: any) => (
                <div key={ann.id} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-yellow-400" />
                  <span className="text-[10px] font-black text-slate-400 uppercase mb-2 block">{new Date(ann.createdAt).toDateString()}</span>
                  <h4 className="text-xl font-black mb-2">{ann.title}</h4>
                  <p className="text-slate-600 leading-relaxed">{ann.content}</p>
                </div>
              ))}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

// Fixed Tab Button to match your Image style
function TabBtn({ icon, label, active, onClick }: any) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2.5 px-6 py-3.5 rounded-full font-black text-[11px] uppercase tracking-widest transition-all ${
      active 
        ? 'bg-[#121826] text-white shadow-lg shadow-slate-200 scale-105' 
        : 'bg-[#F0F4F8] text-[#7A8DA3] hover:bg-slate-200'
    }`}>
      {icon} {label}
    </button>
  );
}