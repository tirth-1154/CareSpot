import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Stethoscope, 
  Calendar, 
  Star,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Activity
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar,
  PieChart, Pie, Cell, Legend
} from 'recharts';

interface AdminDashboardProps {
  data: any;
}

export function AdminDashboard({ data }: AdminDashboardProps) {
  const [chartData, setChartData] = useState<any>(null);
  const [loadingCharts, setLoadingCharts] = useState(true);

  useEffect(() => {
    fetch('/site-admin/api/chart-data/')
      .then(res => res.json())
      .then(json => {
        setChartData(json);
        setLoadingCharts(false);
      })
      .catch(err => {
        // Fallback for demo if api not available at this route (e.g. customadmin)
        fetch('/customadmin/api/chart-data/')
          .then(res => res.json())
          .then(json => {
            setChartData(json);
            setLoadingCharts(false);
          }).catch(() => setLoadingCharts(false));
      });
  }, []);

  // Prepare chart arrays
  const appointmentsTrend = chartData?.labels?.map((l: string, i: number) => ({
    name: l,
    appointments: chartData.appointments[i]
  })) || [];

  const usersTrend = chartData?.labels?.map((l: string, i: number) => ({
    name: l,
    users: chartData.users[i]
  })) || [];

  const statusData = chartData ? [
    { name: 'Accepted', value: chartData.status.accepted, color: '#10b981' },
    { name: 'Pending', value: chartData.status.pending, color: '#f59e0b' },
    { name: 'Rejected', value: chartData.status.rejected, color: '#f43f5e' },
  ] : [];

  const { stats, topDoctors, recentAppointments } = data;

  const statCards = [
    { title: 'Total Doctors', value: stats?.totalDoctors || 0, icon: <Stethoscope size={24} />, bg: 'bg-indigo-50', color: 'text-indigo-600', trend: '+ Active' },
    { title: 'Total Patients', value: stats?.totalPatients || 0, icon: <Users size={24} />, bg: 'bg-teal-50', color: 'text-teal-600', trend: '+ Registrations' },
    { title: 'Appointments', value: stats?.totalAppointments || 0, icon: <Calendar size={24} />, bg: 'bg-sky-50', color: 'text-sky-600', trend: `${stats?.todayAppointments || 0} Today` },
    { title: 'Avg Rating', value: stats?.avgRating || 0, icon: <Star size={24} />, bg: 'bg-amber-50', color: 'text-amber-500', trend: `from ${stats?.totalReviews || 0} reviews` },
  ];

  return (
    <div className="p-8 space-y-8">
      
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Overview</h1>
          <p className="text-slate-500 mt-1 font-medium">Real-time stats and system vitals.</p>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-sm shadow-indigo-200 transition-all active:scale-95">
          <Activity size={18} />
          View Reports
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((s, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group"
          >
            <div className={`absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-500 ${s.color}`}>
              {React.cloneElement(s.icon, { size: 100 })}
            </div>
            
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 font-semibold uppercase tracking-wider text-xs mb-1">{s.title}</p>
                <h3 className="text-4xl font-extrabold text-slate-800 tracking-tight">{s.value}</h3>
              </div>
              <div className={`p-3 rounded-2xl ${s.bg} ${s.color}`}>
                {s.icon}
              </div>
            </div>
            
            <div className="mt-6 flex items-center gap-2 text-sm font-medium text-slate-500">
              <TrendingUp size={16} className={s.color} />
              <span className={s.color}>{s.trend}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100 h-96 flex flex-col"
        >
          <div className="mb-4">
            <h3 className="text-lg font-bold text-slate-800">Appointments Trend</h3>
            <p className="text-sm text-slate-500">Last 7 days of platform activity</p>
          </div>
          <div className="flex-1 w-full relative">
            {!loadingCharts && chartData ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={appointmentsTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAppt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="appointments" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorAppt)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
               <div className="flex items-center justify-center h-full"><div className="animate-pulse w-8 h-8 bg-indigo-200 rounded-full"></div></div>
            )}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col"
        >
          <div className="mb-4">
             <h3 className="text-lg font-bold text-slate-800">Status Overview</h3>
          </div>
          <div className="flex-1 w-full">
            {!loadingCharts && chartData ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : null}
          </div>
        </motion.div>
      </div>

      {/* Two Columns Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
        {/* Top Doctors */}
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800">Top Rated Doctors</h3>
            <a href="/site-admin/doctors/" className="text-indigo-600 font-semibold text-sm hover:underline">View All</a>
          </div>
          
          <div className="space-y-4">
            {topDoctors?.map((doc: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <img 
                    src={doc.profilePicUrl || `https://ui-avatars.com/api/?name=Dr&background=4F46E5&color=fff`} 
                    className="w-12 h-12 rounded-full object-cover shadow-sm border border-slate-200"
                    alt=""
                  />
                  <div>
                    <h4 className="font-semibold text-slate-800 leading-none">{doc.displayName}</h4>
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{doc.subcategory}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-amber-500 font-bold bg-amber-50 px-2 py-1 rounded-lg">
                    <Star size={14} fill="currentColor" /> {doc.avg_rating}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Appointments */}
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800">Recent Appointments</h3>
            <a href="/site-admin/appointments/" className="text-indigo-600 font-semibold text-sm hover:underline">View All</a>
          </div>
          
          <div className="space-y-4">
            {recentAppointments?.slice(0, 5).map((app: any, i: number) => {
              let Icon = Clock;
              let color = "text-amber-500 bg-amber-50 border-amber-200";
              if(app.status === 'Accepted') { Icon = CheckCircle; color = "text-emerald-500 bg-emerald-50 border-emerald-200"; }
              if(app.status === 'Rejected') { Icon = XCircle; color = "text-rose-500 bg-rose-50 border-rose-200"; }

              return (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 shadow-sm hover:shadow transition-shadow bg-white">
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-800">{app.patientName}</span>
                    <span className="text-xs text-slate-500">with {app.doctorName} • {app.date}</span>
                  </div>
                  <div className={`px-3 py-1 flex items-center gap-1.5 rounded-full border text-xs font-bold ${color}`}>
                    <Icon size={12} /> {app.status}
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      </div>

    </div>
  );
}
