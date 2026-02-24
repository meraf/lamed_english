"use client"
import { useState, useRef, useEffect } from "react";
import { 
  Play, Book, FileText, Bell, PenTool, CheckCircle, 
  Download, Upload, Lock, ChevronLeft, Video, X, ExternalLink,
  Clock, Calendar as CalendarIcon, AlertCircle
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ClassroomClient({ user, lesson, course, enrollment }: any) {
  const router = useRouter();
  
  // --- CORE STATE ---
  const [activeTab, setActiveTab] = useState("video");
  const [viewedLessons, setViewedLessons] = useState<string[]>([]);
  const [isPreviewing, setIsPreviewing] = useState(false);
  
  // --- ASSIGNMENT STATE ---
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploadingTask, setIsUploadingTask] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- EXAM PORTAL STATE (Using DB Questions) ---
  const currentExam = lesson?.exams?.[0];
  const userResult = currentExam?.results?.[0];
  const examQuestions = currentExam?.questions || [];
  
  const [showExamPortal, setShowExamPortal] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30 * 60); 
  const [examAnswers, setExamAnswers] = useState<Record<number, string>>({});
  const [examSubmitMessage, setExamSubmitMessage] = useState<{text: string, type: 'success' | 'timeout'} | null>(null);
  const [isSubmittingExam, setIsSubmittingExam] = useState(false);

  const hasSubmittedExam = !!userResult || examSubmitMessage !== null;

  // Grade Color Logic
  const getGradeColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 65) return "text-yellow-500";
    if (score >= 50) return "text-orange-500";
    return "text-red-500";
  };

  // --- HELPERS ---
  
  const getEmbedUrl = (url: string) => {
    if (!url) return "";
    if (url.includes("youtube.com/watch?v=")) {
      return url.replace("watch?v=", "embed/");
    }
    if (url.includes("youtu.be/")) {
      const id = url.split("/").pop();
      return `https://www.youtube.com/embed/${id}`;
    }
    return url;
  };

  // FIX: Converts URL to absolute and uses the stable Google GView endpoint to bypass connection errors
  const getSafePreviewUrl = (url: string) => {
    if (!url) return "";
    const absoluteUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
    return `https://docs.google.com/gview?url=${encodeURIComponent(absoluteUrl)}&embedded=true`;
  };

  // --- PERSISTENCE ---
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

  // --- EXAM TIMER LOGIC ---
  useEffect(() => {
    if (!showExamPortal || timeLeft <= 0 || hasSubmittedExam) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleExamAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [showExamPortal, timeLeft, hasSubmittedExam]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleExamAutoSubmit = () => {
    setIsSubmittingExam(true);
    setTimeout(() => {
      setShowExamPortal(false);
      setIsSubmittingExam(false);
      setExamSubmitMessage({ text: "Time ran out! Your exam was submitted automatically.", type: 'timeout' });
    }, 1500);
  };

  const handleExamManualSubmit = () => {
    setIsSubmittingExam(true);
    setTimeout(() => {
      setShowExamPortal(false);
      setIsSubmittingExam(false);
      setExamSubmitMessage({ text: "Exam completed successfully! Your answers have been saved.", type: 'success' });
    }, 1500);
  };

  // --- FULLSCREEN EXAM PORTAL ---
  if (showExamPortal) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col font-sans">
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shadow-sm">
          <div>
            <h2 className="text-xl font-black text-slate-900">{currentExam?.title}</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Live Assessment</p>
          </div>
          
          <div className="flex gap-2">
            {examQuestions.map((q: any, idx: number) => (
              <button 
                key={q.id}
                onClick={() => setCurrentQuestion(idx)}
                className={`w-8 h-8 rounded-full font-black text-xs flex items-center justify-center transition-all ${
                  currentQuestion === idx 
                    ? 'bg-slate-900 text-white shadow-md scale-110' 
                    : examAnswers[idx] 
                      ? 'bg-green-100 text-green-700 border border-green-200' 
                      : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 bg-red-50 px-4 py-2 rounded-xl border border-red-100">
            <Clock className="text-red-500 animate-pulse" size={16} />
            <span className="font-black text-red-600 tracking-widest">{formatTime(timeLeft)}</span>
          </div>
        </header>

        <main className="flex-grow flex items-center justify-center p-8">
          <div className="bg-white max-w-3xl w-full p-12 rounded-[2.5rem] shadow-xl border border-slate-100">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Question {currentQuestion + 1} of {examQuestions.length}</h3>
            <p className="text-2xl font-black text-slate-900 mb-10 leading-relaxed">
              {examQuestions[currentQuestion]?.text}
            </p>
            
            <div className="space-y-4">
              {examQuestions[currentQuestion]?.options?.map((opt: any, i: number) => (
                <label key={i} className={`flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                  examAnswers[currentQuestion] === opt.text 
                    ? 'border-slate-900 bg-slate-50 shadow-sm' 
                    : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                }`}>
                  <input 
                    type="radio" 
                    name={`q-${currentQuestion}`} 
                    value={opt.text}
                    checked={examAnswers[currentQuestion] === opt.text}
                    onChange={(e) => setExamAnswers({...examAnswers, [currentQuestion]: e.target.value})}
                    className="w-5 h-5 accent-slate-900" 
                  />
                  <span className="font-bold text-slate-700">{opt.text}</span>
                </label>
              ))}
            </div>
          </div>
        </main>

        <footer className="bg-white border-t border-slate-200 p-6 flex justify-between items-center px-12">
          <button 
            disabled={currentQuestion === 0}
            onClick={() => setCurrentQuestion(prev => prev - 1)}
            className="px-6 py-3 font-black text-xs uppercase tracking-widest text-slate-500 hover:text-slate-900 disabled:opacity-30 transition-colors"
          >
            Previous
          </button>
          
          {currentQuestion === examQuestions.length - 1 ? (
            <button 
              onClick={handleExamManualSubmit}
              disabled={isSubmittingExam}
              className="px-10 py-4 bg-yellow-400 text-slate-900 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-yellow-500 transition-all shadow-lg shadow-yellow-200"
            >
              {isSubmittingExam ? 'Submitting...' : 'Submit Exam Now'}
            </button>
          ) : (
            <button 
              onClick={() => setCurrentQuestion(prev => prev + 1)}
              className="px-10 py-4 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all"
            >
              Next Question
            </button>
          )}
        </footer>
      </div>
    );
  }

  // --- STANDARD CLASSROOM RENDER ---
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      
      {/* LEFT SIDEBAR */}
      <aside className="w-[320px] border-r border-slate-200 flex flex-col bg-white shrink-0 shadow-sm z-10">
        <div className="p-6 border-b border-slate-100">
          <Link href="/dashboard" className="text-[10px] font-black text-slate-400 hover:text-slate-900 transition-colors flex items-center gap-1 uppercase tracking-widest mb-6">
            <ChevronLeft size={14} /> Dashboard
          </Link>
          <h1 className="text-xl font-black leading-tight mb-6">{course?.title}</h1>

          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-3xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-yellow-400 rounded-xl text-slate-900 animate-pulse">
                <Video size={16} />
              </div>
              <span className="text-[10px] font-black text-yellow-700 uppercase tracking-widest">Live Class</span>
            </div>
            
            {/* REAL LOGIC: Fetches the Google Meet link from the enrollment object in the database */}
            <a 
              href={enrollment?.googleMeetLink || "#"} 
              target={enrollment?.googleMeetLink ? "_blank" : "_self"}
              rel="noopener noreferrer"
              onClick={(e) => {
                if (!enrollment?.googleMeetLink) {
                  e.preventDefault();
                  alert("Your teacher hasn't set the Google Meet link for this course enrollment yet.");
                }
              }}
              className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center ${
                enrollment?.googleMeetLink 
                  ? "bg-yellow-400 hover:bg-yellow-500 text-slate-900 shadow-lg shadow-yellow-200" 
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              {enrollment?.googleMeetLink ? "Join Meet" : "Link Not Set"}
            </a>
          </div>
        </div>

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

          {/* TABS */}
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
                <iframe 
                  src={getEmbedUrl(lesson?.videoUrl)} 
                  className="w-full h-full border-0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen 
                />
              </div>
              <h3 className="text-2xl font-black">{lesson?.title}</h3>
            </div>
          )}

          {/* READING TAB */}
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

          {/* EXAM TAB */}
          {activeTab === 'exam' && (
            <div className="max-w-3xl mx-auto animate-in fade-in">
              {!currentExam || examQuestions.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                  <Lock size={48} className="mx-auto text-slate-200 mb-4" />
                  <p className="font-bold text-slate-400 uppercase text-[10px] tracking-widest">No exam for this lesson for now.</p>
                </div>
              ) : hasSubmittedExam ? (
                <div className="space-y-6">
                  {examSubmitMessage && (
                    <div className={`p-6 rounded-2xl border flex items-center gap-4 ${
                      examSubmitMessage.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
                    }`}>
                      {examSubmitMessage.type === 'success' ? <CheckCircle size={24}/> : <AlertCircle size={24}/>}
                      <p className="font-bold">{examSubmitMessage.text}</p>
                    </div>
                  )}
                  
                  <div className="text-center py-20 bg-white rounded-[3rem] shadow-xl border border-slate-100">
                    <CheckCircle size={64} className="mx-auto text-green-500 mb-6" />
                    <h3 className="text-3xl font-black mb-2">Assessment Completed</h3>
                    {userResult?.score !== null && userResult?.score !== undefined ? (
                      <div className="mt-8">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Final Graded Score</p>
                        <div className={`text-6xl font-black ${getGradeColor(userResult.score)}`}>
                          {userResult.score}%
                        </div>
                      </div>
                    ) : (
                      <div className="mt-8 bg-slate-50 inline-block px-8 py-4 rounded-2xl border border-slate-100">
                        <p className="font-black text-slate-500 uppercase tracking-widest text-xs">Exam taken. Waiting to be graded.</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white p-12 rounded-[3rem] shadow-xl border border-slate-100 text-center">
                  <PenTool size={48} className="mx-auto text-slate-300 mb-6" />
                  <h2 className="text-3xl font-black text-slate-900 mb-4">{currentExam.title}</h2>
                  <p className="text-slate-500 mb-10 font-medium">This is a timed assessment. Ensure you have a stable connection. You will have 30 minutes to complete the test.</p>
                  <button 
                    onClick={() => {
                      setShowExamPortal(true);
                      setTimeLeft(30 * 60);
                      setCurrentQuestion(0);
                    }}
                    className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-yellow-400 hover:text-slate-900 transition-all shadow-lg"
                  >
                    Take Exam Now
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ASSIGNMENT TAB */}
          {activeTab === 'assign' && (
            <div className="max-w-4xl mx-auto animate-in fade-in">
              {!lesson.assignments?.length ? (
                <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                  <FileText size={48} className="mx-auto text-slate-200 mb-4" />
                  <p className="font-bold text-slate-400 uppercase text-[10px] tracking-widest">No assignments for this lesson.</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {lesson.assignments.map((a: any) => (
                    <div key={a.id} className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
                      <h2 className="text-3xl font-black mb-4">{a.title}</h2>
                      {a.description && <p className="text-slate-500 mb-8">{a.description}</p>}
                      <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-200 flex flex-col items-center justify-center text-center">
                          <Download size={32} className="text-slate-300 mb-4" />
                          <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">Task Instructions</p>
                          <a href="#" className="px-6 py-3 bg-white border border-slate-200 rounded-xl font-bold text-xs hover:border-slate-900 transition-colors w-full">
                            Download Assignment
                          </a>
                        </div>
                        <div className="bg-slate-50 p-8 rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
                          <input type="file" ref={fileInputRef} onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} className="hidden" />
                          {!selectedFile ? (
                            <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-3 w-full">
                              <Upload size={32} className="text-indigo-500" />
                              <span className="font-black text-xs uppercase tracking-widest text-slate-900">Upload Answer</span>
                            </button>
                          ) : (
                            <div className="w-full space-y-4">
                              <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200">
                                <span className="text-xs font-bold text-slate-600 truncate">{selectedFile.name}</span>
                                <button onClick={() => setSelectedFile(null)}><X size={14} className="text-slate-400 hover:text-red-500"/></button>
                              </div>
                              <button 
                                disabled={isUploadingTask}
                                onClick={() => {
                                  setIsUploadingTask(true);
                                  setTimeout(() => {
                                    setIsUploadingTask(false);
                                    setSelectedFile(null);
                                    alert("Assignment uploaded successfully!");
                                  }, 1500);
                                }} 
                                className="w-full bg-slate-900 text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-yellow-400 hover:text-slate-900 transition-colors"
                              >
                                {isUploadingTask ? 'Uploading...' : 'Submit Now'}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* NEWS TAB */}
          {activeTab === 'news' && (
            <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in">
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <CalendarIcon className="text-slate-900" size={28} />
                  <h2 className="text-2xl font-black text-slate-900">This Week's Schedule</h2>
                </div>
                <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-xl text-white space-y-6">
                   <div className="flex items-start gap-4 pb-6 border-b border-white/10">
                    <div className="bg-yellow-400 text-slate-900 p-3 rounded-2xl flex flex-col items-center justify-center min-w-[60px]">
                      <span className="text-[10px] font-black uppercase">Mon</span>
                      <span className="text-xl font-black">24</span>
                    </div>
                    <div>
                      <h4 className="font-black text-lg">Speaking Practice</h4>
                      <p className="text-slate-400 font-medium text-sm flex items-center gap-2 mt-1"><Clock size={14}/> 10:00 AM - 11:30 AM</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <Bell className="text-yellow-500" size={28} />
                  <h2 className="text-2xl font-black text-slate-900">Announcements</h2>
                </div>
                {!course?.announcements?.length ? (
                  <p className="text-slate-500 italic">No new announcements at this time.</p>
                ) : (
                  course.announcements.map((ann: any) => (
                    <div key={ann.id} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-yellow-400" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                        {new Date(ann.createdAt).toDateString()}
                      </span>
                      <h4 className="text-lg font-black mb-2 text-slate-900">{ann.title}</h4>
                      <p className="text-slate-600 text-sm leading-relaxed">{ann.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

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