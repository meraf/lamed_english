'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X, LogOut, User as UserIcon } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session, status } = useSession();

  return (
    <nav className="bg-slate-900 text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 bg-yellow-400 rounded-br-lg rounded-tl-lg flex items-center justify-center">
              <span className="text-slate-900 font-bold text-xl">L</span>
            </div>
            <span className="font-bold text-2xl tracking-tight">
              LAMED <span className="text-yellow-400">ENGLISH</span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="hover:text-yellow-400 transition-colors text-sm font-medium">HOME</Link>
            <Link href="/courses" className="hover:text-yellow-400 transition-colors text-sm font-medium">COURSES</Link>
            <Link href="/teachers" className="hover:text-yellow-400 transition-colors text-sm font-medium">TEACHERS</Link>
            <Link href="/contact" className="hover:text-yellow-400 transition-colors text-sm font-medium">CONTACT US</Link>
            
            {/* AUTH SECTION */}
            {status === 'authenticated' ? (
              <div className="flex items-center gap-4 border-l border-slate-700 pl-8">
                <div className="flex flex-col items-end">
                  <span className="text-xs text-slate-400 leading-none">Welcome,</span>
                  <span className="text-sm font-bold text-white">{session.user?.name?.split(' ')[0]}</span>
                </div>

                
                <div className="group relative">
                  <button className="w-10 h-10 rounded-full bg-slate-800 border-2 border-yellow-400 flex items-center justify-center overflow-hidden hover:scale-105 transition-transform">
                   {session.user?.image ? (
  <img 
    src={session.user.image} 
    alt="User" 
    className="w-full h-full object-cover"
    referrerPolicy="no-referrer" 
  />
) : (
  <UserIcon size={20} className="text-yellow-400" />
)}
                  </button>
                  {/* Dropdown on Hover */}
                  <div className="absolute right-0 top-full pt-2 hidden group-hover:block w-48">
                    <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 p-2">
                      <Link href="/dashboard" className="block px-4 py-2 hover:bg-slate-700 rounded-lg text-sm">My Dashboard</Link>
                      <button 
                        onClick={() => signOut()}
                        className="w-full text-left px-4 py-2 hover:bg-red-500/10 text-red-400 rounded-lg text-sm flex items-center gap-2"
                      >
                        <LogOut size={14} /> Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <Link href="/api/auth/signin">
                <button className="bg-yellow-400 text-slate-900 px-5 py-2 rounded-md font-bold hover:bg-yellow-300 transition-all shadow-md active:scale-95">
                  LOGIN / SIGN UP
                </button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-300 hover:text-white focus:outline-none">
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden bg-slate-800 pb-4 border-t border-slate-700">
          <Link href="/" className="block px-4 py-3 hover:bg-slate-700">Home</Link>
          <Link href="/courses" className="block px-4 py-3 hover:bg-slate-700">Courses</Link>
          <Link href="/teachers" className="block px-4 py-3 hover:bg-slate-700">Teachers</Link>
          <Link href="/contact" className="block px-4 py-3 hover:bg-slate-700">Contact Us</Link>
          
          <div className="px-4 pt-4 border-t border-slate-700 mt-2">
            {status === 'authenticated' ? (
              <div className="space-y-2">
                <p className="text-sm text-slate-400 px-2">Signed in as {session.user?.email}</p>
                <Link href="/dashboard" className="block w-full text-center bg-slate-700 text-white py-2 rounded-md font-bold">DASHBOARD</Link>
                <button 
                  onClick={() => signOut()}
                  className="w-full bg-red-500/20 text-red-400 py-2 rounded-md font-bold"
                >
                  SIGN OUT
                </button>
              </div>
            ) : (
              <Link href="/api/auth/signin">
                <button className="w-full bg-yellow-400 text-slate-900 px-5 py-2 rounded-md font-bold">
                  LOGIN / SIGN UP
                </button>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;