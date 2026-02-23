'use client';

import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Chrome, ArrowRight } from 'lucide-react';
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { registerUser } from "@/lib/actions";
import Link from 'next/link';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(""); // Added for the green box
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (isLogin) {
      const res = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (res?.ok) {
        router.push("/dashboard");
      } else {
        setError("Invalid email or password.");
        setLoading(false);
      }
    } else {
      const signupData = new FormData();
      signupData.append("name", formData.name);
      signupData.append("email", formData.email);
      signupData.append("password", formData.password);

      const result = await registerUser(signupData);
      
      if (result.error) {
        setError(result.error);
        setLoading(false);
      } else if (result.success) {
        setSuccess(result.success); // Red line is now fixed!
        setIsLogin(true); // Switch to login view
        setLoading(false);
        setFormData({ ...formData, password: "" }); // Clear password for safety
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row">
        
        {/* Left Side: Branding */}
        <div className="lg:w-1/2 bg-slate-900 p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full filter blur-[100px] opacity-20 -mr-32 -mt-32"></div>
          <div className="relative z-10">
            <Link href="/" className="flex items-center gap-2 mb-12">
              <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center text-slate-900 font-bold">L</div>
              <span className="font-bold text-xl tracking-tight uppercase">Lamed English</span>
            </Link>
            <h2 className="text-4xl font-black mb-6 leading-tight">
              {isLogin ? "Welcome back to the family." : "Start your journey to fluency today."}
            </h2>
            <p className="text-slate-400 text-lg">Join 1,000+ students mastering English.</p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="lg:w-1/2 p-8 lg:p-16">
          <div className="mb-10">
            <h3 className="text-3xl font-black text-slate-900 mb-2">
              {isLogin ? "Sign In" : "Create Account"}
            </h3>
            <p className="text-slate-500 font-medium">
              {isLogin ? "New to Lamed?" : "Already have an account?"} 
              <button 
                type="button"
                onClick={() => { setIsLogin(!isLogin); setError(""); setSuccess(""); }}
                className="ml-2 text-blue-600 font-bold hover:underline"
              >
                {isLogin ? "Create an account" : "Log in here"}
              </button>
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 text-red-500 p-4 rounded-xl mb-6 text-sm font-bold border border-red-100 italic">
              {error}
            </div>
          )}

          {/* Success Message (The Green Box) */}
          {success && (
            <div className="bg-green-50 text-green-600 p-4 rounded-xl mb-6 text-sm font-bold border border-green-100">
              {success}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {!isLogin && (
              <div>
                <label className="block text-xs font-black uppercase text-slate-400 mb-2">Full Name</label>
                <input 
                  name="name" type="text" required value={formData.name} onChange={handleChange}
                  placeholder="John Doe" 
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-yellow-400 text-slate-900"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-black uppercase text-slate-400 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                <input 
                  name="email" type="email" required value={formData.email} onChange={handleChange}
                  placeholder="name@company.com" 
                  className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-yellow-400 text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-slate-400 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                <input 
                  name="password" type={showPassword ? "text" : "password"} required value={formData.password} onChange={handleChange}
                  placeholder="••••••••" 
                  className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-yellow-400 text-slate-900"
                />
                <button 
                  type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" disabled={loading}
              className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? "Processing..." : isLogin ? "Sign In" : "Register Now"}
              {!loading && <ArrowRight size={20} />}
            </button>
          </form>

          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
            <div className="relative flex justify-center text-xs uppercase font-bold tracking-widest"><span className="bg-white px-4 text-slate-400">Or continue with</span></div>
          </div>

          <button 
            type="button"
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="w-full flex items-center justify-center gap-2 py-4 border border-slate-100 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all"
          >
            <Chrome size={18} className="text-blue-500" /> Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;