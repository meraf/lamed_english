'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "@/actions/auth";
import Link from "next/link";

export default function SignupPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = await registerUser(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      // Redirect to login with a success message in the URL
      router.push("/login?message=Account created successfully! Please login.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="bg-white p-8 md:p-12 rounded-[2.5rem] w-full max-w-md shadow-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900">Start Learning</h1>
          <p className="text-slate-500">Create your Lamed English account.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 text-sm font-bold border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase ml-2 mb-1 block">Full Name</label>
            <input 
              name="name" type="text" placeholder="John Doe" required
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-yellow-400 text-slate-900 transition-all"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase ml-2 mb-1 block">Email Address</label>
            <input 
              name="email" type="email" placeholder="name@example.com" required
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-yellow-400 text-slate-900 transition-all"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase ml-2 mb-1 block">Password</label>
            <input 
              name="password" type="password" placeholder="••••••••" required
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-yellow-400 text-slate-900 transition-all"
            />
          </div>
          
          <button 
            disabled={loading}
            className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-slate-800 transition-all disabled:opacity-50 mt-4 shadow-lg active:scale-95"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center mt-8 text-slate-500 text-sm font-medium">
          Already have an account? <Link href="/login" className="text-yellow-600 font-bold hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}