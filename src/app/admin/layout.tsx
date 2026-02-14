import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from 'next/link';
import { LayoutDashboard, BookPlus, Users, LogOut, ShieldAlert } from 'lucide-react';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // 1. Get the session
  const session = await getServerSession(authOptions);

  // 2. If no session, go to login
  if (!session?.user?.email) {
    redirect("/login");
  }

  // 3. Look up the user in the DB to check their role
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true }
  });

  // 4. SECURITY REDIRECT: Kick them out if they aren't an ADMIN
  if (user?.role !== "ADMIN") {
    // We send them to the home page or a "not authorized" page
    redirect("/");
  }

  // 5. If they ARE an admin, show the dashboard
  const menuItems = [
    { icon: LayoutDashboard, label: 'Overview', href: '/admin' },
    { icon: BookPlus, label: 'Manage Courses', href: '/admin/courses' },
    { icon: Users, label: 'Students', href: '/admin/students' },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col sticky top-0 h-screen">
        <div className="p-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Security Active</span>
          </div>
          <Link href="/" className="font-black text-xl tracking-tighter">
            LAMED <span className="text-yellow-400">ADMIN</span>
          </Link>
        </div>
        
        <nav className="flex-grow px-4 space-y-2">
          {menuItems.map((item) => (
            <Link 
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 transition-all text-slate-400 hover:text-white font-bold text-sm"
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-800">
          <Link href="/" className="flex items-center gap-3 text-slate-500 hover:text-red-400 transition-colors text-sm font-bold">
            <LogOut size={18} />
            Exit Admin
          </Link>
        </div>
      </aside>

      {/* Content Area */}
      <main className="flex-grow p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}