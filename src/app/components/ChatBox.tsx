'use client';
import { useState } from 'react';
import { MessageCircle, Send, Check } from 'lucide-react';

export default function ChatBox({ teacherName, teacherId }: { teacherName: string, teacherId: string }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!text) return;
    setLoading(true);
    // Simulating API call for messaging
    await new Promise(r => setTimeout(r, 1000));
    setSent(true);
    setLoading(false);
    setText("");
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div className="mt-16 bg-slate-900 rounded-[2.5rem] p-8 text-white">
      <div className="flex items-center gap-4 mb-6">
        <div className="bg-yellow-400 p-3 rounded-2xl text-slate-900">
          <MessageCircle size={24} />
        </div>
        <div>
          <h3 className="text-xl font-black">Direct Access to {teacherName}</h3>
          <p className="text-slate-400 text-sm">Have a question about this lesson? Ask away.</p>
        </div>
      </div>
      
      <div className="relative">
        <textarea 
          className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-4 text-white focus:ring-2 focus:ring-yellow-400 outline-none min-h-[120px]"
          placeholder="How can I help you today?"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button 
          onClick={handleSend}
          disabled={loading}
          className="absolute bottom-4 right-4 bg-yellow-400 text-slate-900 px-6 py-2 rounded-xl font-black flex items-center gap-2 hover:bg-white transition-all disabled:opacity-50"
        >
          {sent ? <Check size={18}/> : <Send size={18} />}
          {sent ? "SENT" : "SEND"}
        </button>
      </div>
    </div>
  );
}