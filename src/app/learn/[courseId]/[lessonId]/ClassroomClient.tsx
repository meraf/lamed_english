"use client"
import { useState, useRef, useEffect } from "react";
import { 
  Play, Book, FileText, Bell, PenTool, CheckCircle, 
  Download, Upload, Lock, ChevronLeft, Video, X, ExternalLink,
  Clock, Calendar as CalendarIcon, AlertCircle, Menu
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ClassroomClient({ user, lesson, course, enrollment }: any) {
  const router = useRouter();
  
  // --- CORE STATE ---
  const [activeTab, setActiveTab] = useState("video");
  const [viewedLessons, setViewedLessons] = useState<string[]>([]);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile Sidebar State
  
  // --- ASSIGNMENT STATE ---
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploadingTask, setIsUploadingTask] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- EXAM PORTAL STATE ---
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

  const getGradeColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 65) return "text-yellow-500";
    if (score >= 50) return "text-orange-500";
    return "text-red-500";
  };

  const getEmbedUrl = (url: string) => {
    if (!url) return "";
    if (url.includes("youtube.com/watch?v=")) return url.replace("watch?v=", "embed/");
    if (url.includes("youtu.be/")) return `https://www.youtube.com/embed/${url.split("/").pop()}`;
    return url;
  };

  const getSafePreviewUrl = (url: string) => {
    if (!url) return "";
    const absoluteUrl = url.startsWith('http') ? url : `${typeof window !== 'undefined' ? window.location.origin : ''}${url}`;
    return `https://docs.google.com/gview?url=${encodeURIComponent(absoluteUrl)}&embedded=true`;
  };

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
    setIsSidebarOpen(false); // Close sidebar on mobile after clicking
  };

  // --- EXAM TIMER ---
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
      setExamSubmitMessage({ text: "Time ran out! Submitted automatically.", type: 'timeout' });
    }, 1500);
  };

  const handleExamManualSubmit = () => {
    setIsSubmittingExam(true);
    setTimeout(() => {
      setShowExamPortal(false);
      setIsSubmittingExam(false);
      setExamSubmitMessage({ text: "Exam completed successfully!", type: 'success' });
    }, 1500);
  };

  // --- FULLSCREEN EXAM PORTAL (MOBILE OPTIMIZED) ---
  if (showExamPortal) {
    return (
      <div className="fixed inset-0 z-[100] bg-slate-50 flex flex-col font-sans overflow-hidden">
        <header className="bg-white border-b border-slate-200 px-4 md:px-8 py-3 flex flex-col gap-3 sticky top-0 z-20 shadow-sm shrink-0">
          <div className="flex justify-between items-center w-full">
            <div className="truncate pr-4">
              <h2 className="text-base md:text-lg font-black text-slate-900 truncate">{currentExam?.title}</h2>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Live Assessment</p>
            </div>
            <div className="flex items-center gap-2 bg-red-50 px-3 py-1.5 rounded-xl border border-red-100 shrink-0">
              <Clock className="text-red-500 animate-pulse" size={14} />
              <span className="font-black text-red-600 text-sm tracking-widest">{formatTime(timeLeft)}</span>
            </div>
          </div>
          
          {/* Horizontally scrolling question numbers for mobile so it doesn't push content down */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 w-full">
            {examQuestions.map((q: any, idx: number) => (
              <button key={q.id} onClick={() => setCurrentQuestion(idx)}
                className={`shrink-0 w-8 h-8 rounded-full font-black text-[10px] flex items-center justify-center transition-all ${
                  currentQuestion === idx ? 'bg-slate-900 text-white shadow-md' : examAnswers[idx] ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </header>

        <main className="flex-grow flex items-start md:items-center justify-center p-4 md:p-8 overflow-y-auto">
          <div className="bg-white max-w-3xl w-full p-6 md:p-12 rounded-3xl md:rounded-[2.5rem] shadow-xl border border-slate-100 my-auto">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Question {currentQuestion + 1} of {examQuestions.length}</h3>
            <p className="text-lg md:text-2xl font-black text-slate-900 mb-8 leading-tight">
              {examQuestions[currentQuestion]?.text}
            </p>
            
            <div className="space-y-3">
              {examQuestions[currentQuestion]?.options?.map((opt: any, i: number) => (
                <label key={i} className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  examAnswers[currentQuestion] === opt.text ? 'border-slate-900 bg-slate-50' : 'border-slate-100 hover:bg-slate-50'
                }`}>
                  <input type="radio" name={`q-${currentQuestion}`} value={opt.text}
                    checked={examAnswers[currentQuestion] === opt.text}
                    onChange={(e) => setExamAnswers({...examAnswers, [currentQuestion]: e.target.value})}
                    className="w-5 h-5 accent-slate-900 mt-0.5 shrink-0" 
                  />
                  <span className="font-bold text-slate-700 text-sm md:text-base leading-snug">{opt.text}</span>
                </label>
              ))}
            </div>
          </div>
        </main>

        <footer className="bg-white border-t border-slate-200 p-4 md:p-6 flex justify-between items-center sticky bottom-0 shrink-0">
          <button disabled={currentQuestion === 0} onClick={() => setCurrentQuestion(prev => prev - 1)}
            className="px-4 py-3 md:py-2 font-black text-[10px] uppercase tracking-widest text-slate-500 disabled:opacity-30"
          >
            Prev
          </button>
          
          {currentQuestion === examQuestions.length - 1 ? (
            <button onClick={handleExamManualSubmit} disabled={isSubmittingExam}
              className="px-6 py-3.5 md:py-3 bg-yellow-400 text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg"
            >
              {isSubmittingExam ? '...' : 'Submit Exam'}
            </button>
          ) : (
            <button onClick={() => setCurrentQuestion(prev => prev + 1)}
              className="px-8 py-3.5 md:py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest"
            >
              Next
            </button>
          )}
        </footer>
      </div>
    );
  }

  return (
    <div className="flex h-[100dvh] w-full bg-slate-50 overflow-hidden font-sans text-slate-900 relative">
      
      {/* MOBILE OVERLAY */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* LEFT SIDEBAR (RESPONSIVE) */}
      <aside className={`
        fixed lg:relative inset-y-0 left-0 z-50 w-[280px] md:w-[320px] bg-white border-r border-slate-200 
        transform transition-transform duration-300 ease-in-out flex flex-col shrink-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-5 md:p-6 border-b border-slate-100 shrink-0">
          <div className="flex justify-between items-center mb-5 md:mb-6">
            <Link href="/dashboard" className="text-[10px] font-black text-slate-400 hover:text-slate-900 flex items-center gap-1 uppercase tracking-widest">
              <ChevronLeft size={14} /> Dashboard
            </Link>
            <button className="lg:hidden p-2 -mr-2 text-slate-400" onClick={() => setIsSidebarOpen(false)}><X size={20}/></button>
          </div>
          <h1 className="text-lg md:text-xl font-black leading-tight mb-5 md:mb-6 line-clamp-2">{course?.title}</h1>

          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-2xl md:rounded-3xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-yellow-400 rounded-xl text-slate-900 animate-pulse shrink-0">
                <Video size={16} />
              </div>
              <span className="text-[10px] font-black text-yellow-700 uppercase tracking-widest">Live Class</span>
            </div>
            
            <a href={enrollment?.googleMeetLink || "#"} target={enrollment?.googleMeetLink ? "_blank" : "_self"} rel="noopener noreferrer"
              onClick={(e) => { if (!enrollment?.googleMeetLink) { e.preventDefault(); alert("Link not set yet."); } }}
              className={`w-full py-3 md:py-3.5 rounded-xl md:rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center transition-all ${
                enrollment?.googleMeetLink ? "bg-yellow-400 text-slate-900 shadow-lg" : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              Join Meet
            </a>
          </div>
        </div>

        <nav className="flex-grow overflow-y-auto p-3 md:p-4 space-y-1">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-4 mb-2">Modules</p>
          {course?.lessons?.map((l: any, index: number) => {
            const isActive = l.id === lesson.id;
            const isDone = user?.progress?.some((p: any) => p.lessonId === l.id && p.completed);
            return (
              <Link key={l.id} href={`/learn/${course.id}/${l.id}`} onClick={() => handleLessonClick(l.id)}
                className={`flex items-start gap-3 p-3 md:p-4 rounded-xl md:rounded-2xl transition-all ${isActive ? 'bg-slate-100 border border-slate-200' : 'hover:bg-slate-50 border border-transparent'}`}>
                <span className={`text-[10px] font-black mt-0.5 shrink-0 ${isActive ? 'text-slate-900' : 'text-slate-400'}`}>
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className={`text-[11px] md:text-xs font-bold leading-snug flex-grow ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>
                  {l.title}
                </span>
                {isDone ? <CheckCircle size={14} className="text-green-500 mt-0.5 shrink-0" /> : viewedLessons.includes(l.id) ? <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 shrink-0" /> : <span className="bg-yellow-400 text-slate-900 text-[7px] font-black px-1.5 py-0.5 rounded mt-0.5 shrink-0">NEW</span>}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-grow overflow-y-auto overflow-x-hidden bg-white flex flex-col w-full relative">
        {/* MOBILE HEADER */}
        <header className="lg:hidden flex items-center justify-between p-4 border-b border-slate-100 sticky top-0 bg-white/95 backdrop-blur-sm z-30 shrink-0">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-slate-900 rounded-xl"><Menu size={24}/></button>
          <span className="font-black text-[10px] uppercase tracking-widest text-slate-400 truncate max-w-[150px]">{course?.title}</span>
          <div className="w-8 shrink-0" /> {/* Spacer */}
        </header>

        <div className="p-4 md:p-8 lg:p-12 w-full max-w-full">
          <h2 className="hidden md:block text-2xl md:text-4xl font-black mb-6 md:mb-8 truncate">{course?.title || "CLASSROOM"}</h2>

          {/* TABS (SCROLLABLE ON MOBILE) */}
          <div className="flex overflow-x-auto no-scrollbar gap-2 mb-6 md:mb-8 pb-1 -mx-4 px-4 md:mx-0 md:px-0">
            <TabBtn icon={<Play size={14}/>} label="Video" active={activeTab === 'video'} onClick={() => setActiveTab('video')} />
            <TabBtn icon={<Book size={14}/>} label="Reading" active={activeTab === 'reading'} onClick={() => {setActiveTab('reading'); setIsPreviewing(false)}} />
            <TabBtn icon={<PenTool size={14}/>} label="Exam" active={activeTab === 'exam'} onClick={() => setActiveTab('exam')} />
            <TabBtn icon={<FileText size={14}/>} label="Files" active={activeTab === 'assign'} onClick={() => setActiveTab('assign')} />
            <TabBtn icon={<Bell size={14}/>} label="News" active={activeTab === 'news'} onClick={() => setActiveTab('news')} />
          </div>

          {/* VIDEO TAB */}
          {activeTab === 'video' && (
            <div className="animate-in fade-in w-full">
              <div className="aspect-video w-full max-w-full bg-slate-900 rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shadow-xl md:shadow-2xl mb-6 md:mb-8">
                <iframe src={getEmbedUrl(lesson?.videoUrl)} className="w-full h-full border-0" allowFullScreen />
              </div>
              <h3 className="text-xl md:text-2xl font-black leading-snug">{lesson?.title}</h3>
            </div>
          )}

          {/* READING TAB */}
          {activeTab === 'reading' && (
            <div className="animate-in slide-in-from-bottom-4 w-full">
              {isPreviewing ? (
                <div className="space-y-4">
                  <button onClick={() => setIsPreviewing(false)} className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase py-2">
                    <ChevronLeft size={14}/> Close Preview
                  </button>
                  <div className="w-full h-[65vh] md:h-[70vh] bg-slate-100 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden border border-slate-200">
                    <iframe src={getSafePreviewUrl(lesson?.materials?.[0]?.fileUrl)} className="w-full h-full" />
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 p-6 md:p-12 rounded-[2rem] md:rounded-[3rem] border-2 border-dashed border-slate-200 text-center w-full">
                  <Book size={32} className="mx-auto text-slate-300 mb-6" />
                  <h3 className="text-lg md:text-2xl font-black mb-2">{lesson?.materials?.[0]?.title || "Study Material"}</h3>
                  <div className="flex flex-col sm:flex-row justify-center gap-3 mt-8">
                    <button onClick={() => setIsPreviewing(true)} className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white rounded-xl md:rounded-2xl font-black text-[10px] uppercase tracking-widest shrink-0">
                      Read Online
                    </button>
                    <a href={lesson?.materials?.[0]?.fileUrl} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto px-8 py-4 bg-white border-2 border-slate-900 rounded-xl md:rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shrink-0">
                      Download <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* EXAM TAB */}
          {activeTab === 'exam' && (
            <div className="max-w-3xl mx-auto animate-in fade-in w-full">
              {!currentExam || examQuestions.length === 0 ? (
                <div className="text-center py-16 md:py-20 bg-slate-50 rounded-[2rem] md:rounded-[3rem] border-2 border-dashed border-slate-200 w-full">
                  <Lock size={32} className="mx-auto text-slate-200 mb-4" />
                  <p className="font-bold text-slate-400 uppercase text-[9px] tracking-widest px-4">No exam available for this lesson.</p>
                </div>
              ) : hasSubmittedExam ? (
                <div className="space-y-6 w-full">
                  {examSubmitMessage && (
                    <div className={`p-4 md:p-6 rounded-2xl border flex items-center gap-4 ${examSubmitMessage.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
                      <CheckCircle size={20} className="shrink-0" /> <p className="font-bold text-xs md:text-sm">{examSubmitMessage.text}</p>
                    </div>
                  )}
                  <div className="text-center py-12 md:py-20 bg-white rounded-[2.5rem] shadow-xl border border-slate-100 w-full">
                    <CheckCircle size={48} className="mx-auto text-green-500 mb-6" />
                    <h3 className="text-2xl md:text-3xl font-black mb-2">Completed</h3>
                    {userResult?.score != null ? (
                      <div className="mt-6">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Score</p>
                        <div className={`text-5xl md:text-6xl font-black ${getGradeColor(userResult.score)}`}>{userResult.score}%</div>
                      </div>
                    ) : (
                      <div className="mt-6 bg-slate-50 inline-block px-6 py-3 rounded-xl border border-slate-100">
                        <p className="font-black text-slate-500 uppercase tracking-widest text-[10px]">Awaiting Grade</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white p-6 md:p-12 rounded-[2rem] md:rounded-[3rem] shadow-xl border border-slate-100 text-center w-full">
                  <PenTool size={40} className="mx-auto text-slate-300 mb-6" />
                  <h2 className="text-xl md:text-3xl font-black mb-4">{currentExam.title}</h2>
                  <p className="text-slate-500 mb-8 text-xs md:text-sm px-2 md:px-4">30-minute timed assessment. Ensure stable connection before starting.</p>
                  <button onClick={() => setShowExamPortal(true)} 
                    className="w-full sm:w-auto px-8 py-4 md:py-5 bg-slate-900 text-white rounded-xl md:rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shrink-0"
                  >
                    Take Exam Now
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ASSIGNMENT TAB */}
          {activeTab === 'assign' && (
            <div className="max-w-4xl mx-auto animate-in fade-in w-full">
              {!lesson.assignments?.length ? (
                <div className="text-center py-16 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 w-full">
                  <FileText size={32} className="mx-auto text-slate-200 mb-4" />
                  <p className="font-bold text-slate-400 uppercase text-[9px] tracking-widest">No assignments.</p>
                </div>
              ) : (
                <div className="space-y-6 w-full">
                  {lesson.assignments.map((a: any) => (
                    <div key={a.id} className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-xl border border-slate-100 w-full overflow-hidden">
                      <h2 className="text-xl md:text-2xl font-black mb-4 break-words">{a.title}</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col items-center">
                          <Download size={24} className="text-slate-300 mb-3 shrink-0" />
                          <a href="#" className="px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-[10px] w-full text-center uppercase">Download Task</a>
                        </div>
                        <div className="bg-slate-50 p-6 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center min-w-0 w-full">
                          <input type="file" ref={fileInputRef} onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} className="hidden" />
                          {!selectedFile ? (
                            <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-2">
                              <Upload size={24} className="text-indigo-500 shrink-0" />
                              <span className="font-black text-[9px] uppercase tracking-widest">Upload Answer</span>
                            </button>
                          ) : (
                            <div className="w-full space-y-3 min-w-0">
                              <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 w-full overflow-hidden">
                                <span className="text-[10px] font-bold truncate pr-2 w-full">{selectedFile.name}</span>
                                <button onClick={() => setSelectedFile(null)} className="shrink-0"><X size={14}/></button>
                              </div>
                              <button disabled={isUploadingTask} onClick={() => { setIsUploadingTask(true); setTimeout(() => { setIsUploadingTask(false); setSelectedFile(null); alert("Uploaded!"); }, 1500); }} 
                                className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-black text-[10px] uppercase shrink-0">
                                {isUploadingTask ? '...' : 'Submit'}
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
            <div className="max-w-5xl mx-auto flex flex-col lg:grid lg:grid-cols-2 gap-8 md:gap-12 animate-in fade-in w-full">
              <div className="space-y-4 md:space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <CalendarIcon className="text-slate-900 shrink-0" size={24} />
                  <h2 className="text-xl md:text-2xl font-black">Schedule</h2>
                </div>
                <div className="bg-slate-900 p-6 md:p-8 rounded-[2rem] text-white">
                  <div className="flex items-start gap-4 pb-4 md:pb-6">
                    <div className="bg-yellow-400 text-slate-900 p-3 rounded-xl flex flex-col items-center min-w-[50px] shrink-0">
                      <span className="text-[9px] font-black uppercase">Mon</span>
                      <span className="text-lg md:text-xl font-black">24</span>
                    </div>
                    <div>
                      <h4 className="font-black text-sm md:text-base">Speaking Practice</h4>
                      <p className="text-slate-400 text-[10px] md:text-xs mt-1 leading-snug">10:00 AM - 11:30 AM</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 md:space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <Bell className="text-yellow-500 shrink-0" size={24} />
                  <h2 className="text-xl md:text-2xl font-black">News</h2>
                </div>
                <div className="space-y-4">
                  {course?.announcements?.map((ann: any) => (
                    <div key={ann.id} className="bg-white p-5 md:p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-yellow-400" />
                      <span className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase block mb-1.5">{new Date(ann.createdAt).toDateString()}</span>
                      <h4 className="text-sm md:text-base font-black mb-1.5 break-words">{ann.title}</h4>
                      <p className="text-slate-600 text-[11px] md:text-xs leading-relaxed">{ann.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Tailwind Custom Utility to hide scrollbar but keep functionality */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

function TabBtn({ icon, label, active, onClick }: any) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2 px-5 py-2.5 md:py-3 rounded-full font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap shrink-0 ${
      active ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
    }`}>
      {icon} {label}
    </button>
  );
}