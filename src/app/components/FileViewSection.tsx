"use client";

import { useState } from "react";
import { Eye, Download, X, FileText } from "lucide-react";

export default function FileViewSection({ url, title, isRead, markReadAction }: any) {
  const [isPreviewing, setIsPreviewing] = useState(false);

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-slate-100 transition-colors">
        <div className="flex items-center gap-4">
          <FileText className="text-slate-400" size={20} />
          <div>
            <p className={`font-bold text-sm ${isRead ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
              {title}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* VIEW BUTTON */}
          <button 
            onClick={() => setIsPreviewing(!isPreviewing)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-white border border-slate-200 text-slate-600 hover:bg-slate-900 hover:text-white transition-all"
          >
            {isPreviewing ? <><X size={14}/> Close</> : <><Eye size={14}/> Read Here</>}
          </button>

          {/* DOWNLOAD BUTTON */}
          <a 
            href={url} 
            download 
            className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-all"
          >
            <Download size={16} />
          </a>
          
          {markReadAction}
        </div>
      </div>

      {isPreviewing && (
        <div className="mt-2 w-full h-[600px] rounded-2xl overflow-hidden border-2 border-slate-200 shadow-inner bg-slate-200">
          <iframe 
            src={`https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`}
            className="w-full h-full"
            title={title}
          />
          {/* Note: If your files are public PDFs, you can use: src={url} directly. 
              The Google Viewer link above helps display Word docs and Powerpoints too. */}
        </div>
      )}
    </div>
  );
}