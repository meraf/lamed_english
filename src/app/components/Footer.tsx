'use client';
import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin, Mail, ArrowRight } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* BRAND COLUMN */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-yellow-400 rounded-br-lg rounded-tl-lg flex items-center justify-center">
                <span className="text-slate-900 font-bold text-xl">L</span>
              </div>
              <span className="font-bold text-2xl tracking-tight text-white">LAMED <span className="text-yellow-400">ENGLISH</span></span>
            </div>
            <p className="text-sm leading-relaxed">
              Empowering learners worldwide to master the English language through personalized, expert-led education and a community-driven approach.
            </p>
            <div className="flex space-x-4">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-yellow-400 hover:text-slate-900 transition-all">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* QUICK LINKS */}
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Platform</h4>
            <ul className="space-y-4 text-sm">
              <li><a href="#" className="hover:text-yellow-400 transition-colors">Find a Teacher</a></li>
              <li><a href="#" className="hover:text-yellow-400 transition-colors">Course Catalog</a></li>
              <li><a href="#" className="hover:text-yellow-400 transition-colors">Pricing Plans</a></li>
              <li><a href="#" className="hover:text-yellow-400 transition-colors">Student Success</a></li>
              <li><a href="#" className="hover:text-yellow-400 transition-colors">Group Classes</a></li>
            </ul>
          </div>

          {/* SUPPORT */}
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Support</h4>
            <ul className="space-y-4 text-sm">
              <li><a href="#" className="hover:text-yellow-400 transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-yellow-400 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-yellow-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-yellow-400 transition-colors">Cookie Settings</a></li>
              <li><a href="#" className="hover:text-yellow-400 transition-colors">Contact Support</a></li>
            </ul>
          </div>

          {/* NEWSLETTER */}
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Stay Updated</h4>
            <p className="text-sm mb-4">Get the latest English tips and course discounts delivered to your inbox.</p>
            <form className="relative">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="w-full bg-slate-800 border-none rounded-xl py-4 pl-4 pr-12 text-sm focus:ring-2 focus:ring-yellow-400 outline-none transition-all"
              />
              <button className="absolute right-2 top-2 bottom-2 bg-yellow-400 text-slate-900 px-3 rounded-lg hover:bg-yellow-300 transition-all">
                <ArrowRight size={18} />
              </button>
            </form>
            <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
              <Mail size={14} />
              <span>Join 5,000+ other students</span>
            </div>
          </div>

        </div>

        {/* BOTTOM BAR */}
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <p>© {currentYear} Lamed English. All rights reserved.</p>
          <div className="flex gap-8">
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Systems Operational</span>
            <span className="cursor-pointer hover:text-white transition-colors">English (US)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;