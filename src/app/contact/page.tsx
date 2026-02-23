import React from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className="bg-slate-900 text-white py-24 pb-32">
        <div className="max-w-7xl mx-auto px-8 text-center">
          <span className="text-yellow-400 font-bold tracking-widest uppercase text-sm mb-4 block">
            We'd love to hear from you
          </span>
          <h1 className="text-5xl font-black mb-6">Contact Us</h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Have a question about a course? Want to join our teaching team? Drop us a line.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 -mt-24 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Contact Info Cards */}
          <div className="space-y-4">
            {/* Email Card */}
            <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl border border-slate-800">
              <div className="w-12 h-12 bg-yellow-400 rounded-xl flex items-center justify-center mb-6 text-slate-900">
                <Mail size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Email Us</h3>
              <p className="text-slate-400 mb-4 text-sm">Our friendly team is here to help.</p>
              <a href="mailto:hello@lamed.com" className="text-yellow-400 font-bold hover:underline">hello@lamedenglish.com</a>
            </div>

            {/* Location Card */}
            <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-6 text-slate-900">
                <MapPin size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Office</h3>
              <p className="text-slate-500 mb-4 text-sm">Come say hello at our HQ.</p>
              <p className="font-bold text-slate-900">123 Education Lane,<br/>Addis Ababa, Ethiopia</p>
            </div>

            {/* Phone Card */}
            <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-6 text-slate-900">
                <Phone size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Phone</h3>
              <p className="text-slate-500 mb-4 text-sm">Mon-Fri from 8am to 5pm.</p>
              <p className="font-bold text-slate-900">+251 911 234 567</p>
            </div>
          </div>

          {/* RIGHT COLUMN: Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-slate-200/50 h-full">
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-900 uppercase tracking-widest">First Name</label>
                    <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all font-medium" placeholder="Jane" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-900 uppercase tracking-widest">Last Name</label>
                    <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all font-medium" placeholder="Doe" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-900 uppercase tracking-widest">Email Address</label>
                  <input type="email" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all font-medium" placeholder="jane@example.com" />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-900 uppercase tracking-widest">Message</label>
                  <textarea rows={6} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all resize-none font-medium" placeholder="Tell us how we can help you..."></textarea>
                </div>

                <button className="w-full bg-slate-900 text-white py-5 rounded-xl font-bold text-lg hover:bg-yellow-400 hover:text-slate-900 transition-all shadow-lg flex items-center justify-center gap-2 group">
                  Send Message
                  <Send size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}