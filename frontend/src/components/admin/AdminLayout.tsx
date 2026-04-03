import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Stethoscope, 
  Bed, 
  CalendarCheck, 
  MessageSquare, 
  FileText, 
  Tags, 
  MapPin, 
  LogOut,
  Bell,
  Search,
  Menu,
  Headset
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [isSidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1024);
  
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const path = window.location.pathname;
  const navItems = [
    { label: 'Dashboard', icon: <LayoutDashboard size={20} />, href: '/site-admin/dashboard/', active: path.includes('/site-admin/dashboard') },
    { label: 'Users', icon: <Users size={20} />, href: '/site-admin/users/', active: path.includes('/site-admin/users') },
    { label: 'Doctors', icon: <Stethoscope size={20} />, href: '/site-admin/doctors/', active: path.includes('/site-admin/doctors') },
    { label: 'Patients', icon: <Bed size={20} />, href: '/site-admin/patients/', active: path.includes('/site-admin/patients') },
    { label: 'Appointments', icon: <CalendarCheck size={20} />, href: '/site-admin/appointments/', active: path.includes('/site-admin/appointments') },
    { label: 'Reviews', icon: <MessageSquare size={20} />, href: '/site-admin/reviews/', active: path.includes('/site-admin/reviews') },
    { label: 'Blogs', icon: <FileText size={20} />, href: '/site-admin/blogs/', active: path.includes('/site-admin/blogs') },
    { label: 'Categories', icon: <Tags size={20} />, href: '/site-admin/categories/', active: path.includes('/site-admin/categories') },
    { label: 'Locations', icon: <MapPin size={20} />, href: '/site-admin/locations/', active: path.includes('/site-admin/locations') },
    { label: 'Support', icon: <Headset size={20} />, href: '/site-admin/support/', active: path.includes('/site-admin/support') },
  ];

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] overflow-hidden font-sans">
      
      {/* Mobile Sidebar Backdrop */}
      <AnimatePresence>
        {isSidebarOpen && window.innerWidth <= 1024 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: window.innerWidth <= 1024 ? -280 : 0, width: 280 }}
            animate={{ x: 0, width: 280 }}
            exit={{ x: -280, width: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`h-full bg-white border-r border-slate-200 flex flex-col flex-shrink-0 z-40 shadow-xl lg:shadow-sm ${
              window.innerWidth <= 1024 ? 'fixed' : 'relative'
            }`}
          >
            <div className="h-16 flex items-center px-6 border-b border-slate-100">
              <span className="font-bold text-xl text-slate-800 tracking-tight">Care<span className="text-indigo-600">Spot</span> Admin</span>
            </div>

            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
              {navItems.map((item, idx) => (
                <a
                  key={idx}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                    item.active 
                      ? 'bg-indigo-50 text-indigo-600 font-semibold' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
                  }`}
                >
                  <span className={`${item.active ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-500'}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                  {item.active && (
                    <motion.div 
                      layoutId="sidebar-active"
                      className="absolute inset-y-0 left-0 w-1 bg-indigo-600 rounded-r-lg"
                    />
                  )}
                </a>
              ))}
            </nav>

            <div className="p-4 border-t border-slate-100">
              <a
                href="/site-admin/logout/"
                className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors duration-200"
              >
                <LogOut size={20} />
                <span className="font-medium">Logout</span>
              </a>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Topbar */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              <Menu size={20} />
            </button>
            <div className="hidden sm:flex items-center bg-slate-100 rounded-full px-4 py-2 border border-slate-200 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
              <Search size={18} className="text-slate-400" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-transparent border-none outline-none text-sm ml-2 w-32 md:w-64 text-slate-700 placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-400 hover:text-indigo-600 transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-slate-200 mx-1"></div>
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-800 leading-tight">Super Admin</p>
                <p className="text-xs text-slate-500 font-medium tracking-wide">admin@docspot.com</p>
              </div>
              <img 
                src="https://ui-avatars.com/api/?name=Admin&background=4F46E5&color=fff&size=40" 
                alt="Admin" 
                className="w-10 h-10 rounded-full border-2 border-white shadow-sm group-hover:shadow-md transition-shadow"
              />
            </div>
          </div>
        </header>

        {/* Dashboard Content Region */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#F8FAFC]">
          {children}
        </main>
      </div>
    </div>
  );
}
