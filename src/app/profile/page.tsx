import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateProfile } from "@/actions/user";
import { Shield, Mail, CheckCircle, UserCircle } from "lucide-react";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user?.email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="font-bold text-slate-400">Please log in to view this page.</p>
      </div>
    );
  }

  const user = await prisma.user.findUnique({ 
    where: { email: session.user.email } 
  });

  // WRAPPER: This function signature matches exactly what the <form action> expects,
  // effectively removing the red line.
  async function formAction(formData: FormData) {
    "use server";
    await updateProfile(formData);
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-20">
      <div className="max-w-3xl mx-auto px-8">
        <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden">
          
          {/* Header Banner */}
          <div className="h-32 bg-slate-900 relative">
            <div className="absolute -bottom-10 left-12 w-24 h-24 bg-yellow-400 rounded-3xl border-8 border-white flex items-center justify-center text-3xl font-black shadow-lg text-slate-900">
              {user?.name?.charAt(0).toUpperCase() || <UserCircle size={40}/>}
            </div>
          </div>
          
          <div className="pt-16 p-12">
            {/* User Info Section */}
            <div className="mb-10">
              <h1 className="text-3xl font-black text-slate-900">Your Account</h1>
              <p className="text-slate-500 flex items-center gap-2 mt-1 font-medium">
                <Mail size={16}/> {user?.email}
              </p>
              <div className="mt-4 inline-flex items-center gap-2 bg-slate-100 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500">
                <Shield size={12}/> Role: {user?.role || "USER"}
              </div>
            </div>

            {/* Profile Update Form */}
            <form action={formAction} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                  Display Name
                </label>
                <input 
                  name="name" 
                  type="text"
                  required
                  defaultValue={user?.name || ""} 
                  placeholder="Enter your name"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 focus:ring-2 focus:ring-yellow-400 outline-none font-bold text-slate-900 transition-all" 
                />
              </div>

              <button 
                type="submit"
                className="bg-slate-900 text-yellow-400 px-8 py-4 rounded-2xl font-black hover:bg-slate-800 transition-all flex items-center gap-2 active:scale-95 shadow-lg"
              >
                UPDATE PROFILE <CheckCircle size={18}/>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}