import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, AlertCircle, ArrowRight, Server, Building2, UserCog, HeartPulse, Activity, Plus, Eye, EyeOff } from 'lucide-react';

const AdminLogin = () => {
  const [emailFocus, setEmailFocus] = useState(false);
  const [passFocus, setPassFocus] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Read CSRF token and Django error passed to DOM
  const csrfToken = document.querySelector('input[name="csrfmiddlewaretoken"]')?.getAttribute('value') || '';
  const djangoError = document.getElementById('django-error')?.textContent?.trim() || '';

  // Floating animation definition
  const floatingAnimation = {
    y: [0, -15, 0],
    transition: {
      duration: 5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  return (
    <div className="min-h-screen w-full font-['Inter',sans-serif] bg-slate-50 text-slate-900 overflow-x-hidden relative flex">
      
      {/* GLOBAL BACKGROUND - Light grid look matching brand */}
      <div className="absolute inset-0 bg-[#f4f7fb]">
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        
        {/* Animated Background Mesh Blobs (Light Blue & Sky Blue) */}
        <motion.div 
          animate={{ x: [0, 50, 0], y: [0, -30, 0], rotate: [0, 10, 0] }} 
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
          className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-300/40 blur-[120px]"
        />
        <motion.div 
          animate={{ x: [0, -40, 0], y: [0, 40, 0], rotate: [0, -15, 0] }} 
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-sky-200/50 blur-[130px]"
        />
        <motion.div 
          animate={{ x: [0, 30, 0], y: [0, 20, 0] }} 
          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          className="absolute top-[40%] left-[30%] w-[30vw] h-[30vw] rounded-full bg-indigo-200/40 blur-[100px]"
        />
      </div>

      {/* MAIN LAYOUT SPLIT */}
      <div className="relative z-10 w-full flex flex-col lg:flex-row min-h-screen lg:h-screen max-w-[1800px] mx-auto">
        
        {/* ================= LEFT SIDE (Branding & Stats) ================= */}
        <div className="hidden lg:flex flex-1 flex-col justify-between p-16 relative">
          
          {/* Floating Medical Icons */}
          <motion.div animate={floatingAnimation} className="absolute top-[20%] right-[15%] text-sky-500/40 blur-[1px]">
            <HeartPulse size={64} />
          </motion.div>
          <motion.div animate={{ y: [0, 20, 0], transition: { duration: 6, repeat: Infinity, ease: "easeInOut" } }} className="absolute bottom-[35%] left-[20%] text-blue-500/30 blur-[1px]">
            <Shield size={80} />
          </motion.div>
          <motion.div animate={{ y: [0, -10, 0], transition: { duration: 4, repeat: Infinity, ease: "easeInOut" } }} className="absolute top-[50%] right-[30%] text-indigo-400/30">
            <Plus size={48} />
          </motion.div>

          {/* Logo Area */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-sky-300 blur-md opacity-40"></div>
              <div className="relative bg-white border border-sky-100 p-3 rounded-xl shadow-sm">
                <Shield className="w-8 h-8 text-sky-500" />
              </div>
            </div>
            <span className="text-3xl font-bold tracking-tight text-slate-800">DocSpot <span className="text-sky-500">Secure</span></span>
          </div>

          {/* Main Typography */}
          <div className="max-w-xl z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-6xl font-extrabold mb-6 leading-[1.15] bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-[#0c1a5d] to-sky-600 drop-shadow-sm">
                System Command<br />Center
              </h1>
              <p className="text-xl text-slate-600 font-light leading-relaxed">
                Advanced administrative control environment for healthcare oversight. Monitor operations, manage practitioners, and safeguard critical patient infrastructure.
              </p>
            </motion.div>
          </div>

          {/* Animated Stats Card (Glassmorphism) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="w-full max-w-lg bg-white/60 backdrop-blur-xl border border-white rounded-2xl p-6 relative overflow-hidden group shadow-[0_12px_40px_rgba(0,0,0,0.05)]"
          >
            {/* Card Light Reflection */}
            <div className="absolute -inset-full top-0 block w-full h-full bg-gradient-to-r from-transparent via-white/80 to-transparent -skew-x-[45deg] group-hover:animate-[shimmer_1.5s_infinite]"></div>
            
            <div className="flex justify-between items-center relative z-10">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-slate-500 text-sm font-semibold uppercase tracking-wider">
                  <Activity size={16} /> Uptime
                </div>
                <div className="text-3xl font-bold text-slate-800 tracking-tight">99.9%</div>
              </div>

              <div className="w-px h-12 bg-slate-200"></div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-slate-500 text-sm font-semibold uppercase tracking-wider">
                  <Server size={16} /> Status
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                  <div className="text-2xl font-bold text-emerald-600">Active</div>
                </div>
              </div>

              <div className="w-px h-12 bg-slate-200"></div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-slate-500 text-sm font-semibold uppercase tracking-wider">
                  <UserCog size={16} /> Access
                </div>
                <div className="text-2xl font-bold text-blue-600">Level 1</div>
               </div>
            </div>
          </motion.div>

        </div>

        {/* ================= RIGHT SIDE (Login Form) ================= */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative z-20">
          
          <motion.div 
            animate={{ y: [-5, 5, -5] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="w-full max-w-[480px]"
          >
            {/* Glassmorphism Login Card */}
            <div className="bg-white/70 backdrop-blur-2xl border border-white rounded-3xl p-8 sm:p-10 lg:p-12 shadow-[0_20px_40px_rgba(0,0,0,0.08),unset_0_1px_1px_rgba(255,255,255,1)] relative overflow-hidden">
              
              {/* Card top flare */}
              <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-sky-300 to-transparent opacity-50"></div>

              <div className="mb-8 sm:mb-10 text-center lg:text-left">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3 tracking-wide">Authenticate</h2>
                <p className="text-sm sm:text-base text-slate-500">Enter credentials to access the secure portal.</p>
              </div>

              {djangoError && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 flex gap-3 items-center mb-8 shadow-sm"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium">{djangoError}</span>
                </motion.div>
              )}

              <form method="POST" action="" className="space-y-6">
                <input type="hidden" name="csrfmiddlewaretoken" value={csrfToken} />

                {/* Email Field */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-widest">
                    Authorized Email
                  </label>
                  <div className={`relative flex items-center transition-all duration-300 ${emailFocus ? 'scale-[1.02]' : ''}`}>
                    <div className={`absolute left-4 transition-colors ${emailFocus ? 'text-sky-500 drop-shadow-sm' : 'text-slate-400'}`}>
                      <Mail className="w-5 h-5" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      required
                      defaultValue="admin@docspot.com"
                      onFocus={() => setEmailFocus(true)}
                      onBlur={() => setEmailFocus(false)}
                      className="w-full pl-12 pr-4 py-4 bg-white/80 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white transition-all duration-300 outline-none shadow-sm"
                      placeholder="admin@docspot.com"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-widest">
                    Security Key
                  </label>
                  <div className={`relative flex items-center transition-all duration-300 ${passFocus ? 'scale-[1.02]' : ''}`}>
                    <div className={`absolute left-4 transition-colors ${passFocus ? 'text-blue-500 drop-shadow-sm' : 'text-slate-400'}`}>
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      required
                      defaultValue="admin@123"
                      onFocus={() => setPassFocus(true)}
                      onBlur={() => setPassFocus(false)}
                      className="w-full pl-12 pr-12 py-4 bg-white/80 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-300 outline-none shadow-sm"
                      placeholder="••••••••"
                    />
                    {/* Show/Hide Toggle */}
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Additional Options */}
                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center">
                      <input type="checkbox" className="peer appearance-none w-5 h-5 border border-slate-300 rounded bg-white checked:bg-sky-500 checked:border-sky-500 transition-all cursor-pointer" />
                      <div className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">Keep me connected</span>
                  </label>
                  <a href="#" className="text-sm font-semibold text-sky-600 hover:text-sky-700 transition-all hover:drop-shadow-sm">
                    Reset Access
                  </a>
                </div>

                {/* Submit Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full relative group overflow-hidden bg-sky-500 hover:bg-sky-600 border-0 text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-sky-500/20 hover:shadow-xl hover:shadow-sky-500/30 transition-all mt-6"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
                  <span className="relative flex items-center justify-center gap-2">
                    Initialize Session <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </motion.button>
              </form>

              <div className="mt-10 text-center relative z-10">
                <p className="text-slate-400 text-xs font-medium tracking-wide">
                  SECURE CONNECTION ESTABLISHED<br/>
                  <span className="opacity-70 mt-1 inline-block">NODE: CS-ALPHA-4</span>
                </p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
      
      {/* Required style for shimmer effect if needed */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          100% { transform: translateX(200%); }
        }
      `}} />
    </div>
  );
};

export default AdminLogin;
