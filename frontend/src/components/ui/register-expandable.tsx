import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, 
  CheckCircle2, 
  Activity, 
  Globe, 
  BarChart3,
  CalendarDays,
  X,
  Loader2
} from "lucide-react";

export default function RegisterExpandable() {
  const [isOpen, setIsOpen] = useState(false);
  const [role, setRole] = useState<"patient" | "doctor">("patient");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
      setTimeout(() => {
        setIsSuccess(false);
        setRole("patient");
      }, 500);
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 2000);
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-white text-slate-900 font-sans">
      
      {/* Light Rays Background for Hero (As seen in the first image) */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.85] z-0"
        style={{
          background: "radial-gradient(circle at 80% -20%, rgba(200, 200, 255, 0.4) 0%, transparent 60%)",
          backgroundImage: "repeating-linear-gradient(110deg, transparent, transparent 15px, rgba(200, 220, 255, 0.03) 15px, rgba(200, 220, 255, 0.03) 30px)"
        }}
      />
      <div 
        className="absolute top-0 right-0 w-[80vw] h-[100vh] pointer-events-none opacity-40 z-0"
        style={{
          background: "conic-gradient(from 180deg at 100% 0%, transparent 0deg, rgba(37, 99, 235, 0.1) 45deg, transparent 90deg)"
        }}
      />

      <AnimatePresence>
        {!isOpen ? (
          <motion.div
            layoutId="register-modal-container"
            className="relative z-10 flex flex-col items-center justify-center p-8 max-w-4xl text-center"
          >
            <motion.div layoutId="badge" className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              <span className="text-sm font-medium text-slate-600">New: CareSpot Health Platform</span>
            </motion.div>

            <motion.h1 layoutId="title" className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-[1.1]">
              Orchestrate your entire <br className="hidden md:block"/>
              <span className="text-blue-600">healthcare journey</span>
            </motion.h1>

            <motion.p layoutId="subtitle" className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Stop wrestling with disconnected clinics. CareSpot provides the infrastructure to build, measure, and scale your personal health with enterprise-grade security.
            </motion.p>

            <motion.button
              layoutId="cta-button"
              onClick={() => setIsOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-blue-600 text-white font-medium rounded-full shadow-lg hover:bg-blue-700 transition-colors text-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Start your journey <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-white/20 backdrop-blur-md z-40 transition-opacity"
              onClick={() => setIsOpen(false)}
            />
            
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-none">
              <motion.div
                layoutId="register-modal-container"
                className="w-full max-w-[1000px] h-[90vh] max-h-[700px] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row pointer-events-auto relative"
                style={{
                  background: "linear-gradient(135deg, #162C72 0%, #1e3a8a 100%)",
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.1) inset"
                }}
              >
                {/* Left Side: Info Section (Solid Deep Blue) */}
                <div className="hidden md:flex flex-col justify-between w-[45%] p-10 relative z-10">
                  <div>
                    <motion.h2 layoutId="title" className="text-4xl font-bold text-white mb-4 leading-tight">
                      Ready to manage<br/>your health?
                    </motion.h2>

                    <motion.p layoutId="subtitle" className="text-blue-200 text-sm mb-12 leading-relaxed max-w-[85%]">
                      Join 10,000+ patients and doctors building the future of healthcare with CareSpot.
                    </motion.p>

                    <div className="space-y-8">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/5">
                          <BarChart3 className="w-5 h-5 text-blue-300" />
                        </div>
                        <div>
                          <h4 className="font-bold text-white mb-1">Health First</h4>
                          <p className="text-xs text-blue-200 leading-relaxed">
                            Real-time insights embedded directly into your specialized medical workflow.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/5">
                          <Globe className="w-5 h-5 text-blue-300" />
                        </div>
                        <div>
                          <h4 className="font-bold text-white mb-1">Global Network</h4>
                          <p className="text-xs text-blue-200 leading-relaxed">
                            Connect to thousands of top-tier specialists instantly with our automated regional network.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto pt-8 border-t border-white/10 relative">
                    <p className="text-blue-100 text-[15px] italic mb-5 leading-relaxed">
                      "CareSpot transformed how we manage appointments. We went from weekly scheduling conflicts to daily harmony with zero downtime."
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: "linear-gradient(135deg, #FF6B6B, #FF8E53)" }}>
                        ER
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">Elena Rodriguez</p>
                        <p className="text-xs text-blue-300">Head of Operations, City Hospital</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side: Form Section (Lighter Glassy Blue) */}
                <div 
                  className="w-full md:w-[55%] relative overflow-y-auto custom-scrollbar"
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    borderLeft: "1px solid rgba(255,255,255,0.08)"
                  }}
                >
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="p-8 md:p-10">
                    <AnimatePresence mode="wait">
                      {!isSuccess ? (
                        <motion.div
                          key="form"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="mb-8">
                            <h3 className="text-2xl font-bold text-white mb-2">Create an Account</h3>
                            <p className="text-blue-200 text-sm">Fill out the form below and we'll get you set up.</p>
                          </div>

                          {/* Role Toggle (Patient / Doctor) */}
                          <div className="flex mb-8 bg-[#1e336b] rounded-lg p-1 border border-white/5">
                            <button
                              type="button"
                              onClick={() => setRole("patient")}
                              className={`flex-1 py-2.5 text-xs font-bold rounded-md transition-all ${
                                role === "patient" ? "bg-blue-600 text-white shadow-sm" : "text-blue-300 hover:text-white"
                              }`}
                            >
                              PATIENT
                            </button>
                            <button
                              type="button"
                              onClick={() => setRole("doctor")}
                              className={`flex-1 py-2.5 text-xs font-bold rounded-md transition-all ${
                                role === "doctor" ? "bg-blue-600 text-white shadow-sm" : "text-blue-300 hover:text-white"
                              }`}
                            >
                              DOCTOR
                            </button>
                          </div>

                          <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-1.5">
                              <label className="text-[10px] uppercase font-bold text-blue-300 tracking-wider">Full Name</label>
                              <input 
                                required
                                type="text" 
                                placeholder="Jane Doe" 
                                className="w-full px-4 py-3 bg-[#1e336b] border border-white/5 rounded-md text-sm text-white focus:bg-[#243c7c] focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-all placeholder:text-blue-400/50"
                              />
                            </div>
                            
                            <div className="space-y-1.5">
                              <label className="text-[10px] uppercase font-bold text-blue-300 tracking-wider">Email Address</label>
                              <input 
                                required
                                type="email" 
                                placeholder="jane@company.com" 
                                className="w-full px-4 py-3 bg-[#1e336b] border border-white/5 rounded-md text-sm text-white focus:bg-[#243c7c] focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-all placeholder:text-blue-400/50"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <label className="text-[10px] uppercase font-bold text-blue-300 tracking-wider">Password</label>
                                <input 
                                  required
                                  type="password" 
                                  placeholder="••••••••" 
                                  className="w-full px-4 py-3 bg-[#1e336b] border border-white/5 rounded-md text-sm text-white focus:bg-[#243c7c] focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-all placeholder:text-blue-400/50"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[10px] uppercase font-bold text-blue-300 tracking-wider">Phone</label>
                                <input 
                                  required
                                  type="tel" 
                                  placeholder="+1 (555) 000-00" 
                                  className="w-full px-4 py-3 bg-[#1e336b] border border-white/5 rounded-md text-sm text-white focus:bg-[#243c7c] focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-all placeholder:text-blue-400/50"
                                />
                              </div>
                            </div>

                            <AnimatePresence mode="popLayout">
                              {role === "patient" && (
                                <motion.div 
                                  key="patient-fields"
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="grid grid-cols-2 gap-4"
                                >
                                  <div className="space-y-1.5 py-1">
                                    <label className="text-[10px] uppercase font-bold text-blue-300 tracking-wider">Gender</label>
                                    <div className="relative">
                                      <select required className="w-full px-4 py-3 bg-[#1e336b] border border-white/5 rounded-md text-sm text-white focus:bg-[#243c7c] focus:outline-none focus:ring-1 focus:ring-blue-400 appearance-none transition-all [&>option]:bg-[#1e336b] [&>option]:text-white">
                                        <option value="" disabled selected>Select...</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                      </select>
                                      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                                        <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="space-y-1.5 py-1">
                                    <label className="text-[10px] uppercase font-bold text-blue-300 tracking-wider">Date of Birth</label>
                                    <input 
                                      required
                                      type="date" 
                                      className="w-full px-4 py-2.5 bg-[#1e336b] border border-white/5 rounded-md text-sm text-white focus:bg-[#243c7c] focus:outline-none focus:ring-1 focus:ring-blue-400 transition-all [color-scheme:dark]"
                                    />
                                  </div>
                                </motion.div>
                              )}

                              {role === "doctor" && (
                                <motion.div 
                                  key="doctor-fields"
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="grid grid-cols-2 gap-4"
                                >
                                  <div className="space-y-1.5 py-1">
                                    <label className="text-[10px] uppercase font-bold text-blue-300 tracking-wider">Specialty</label>
                                    <select required className="w-full px-4 py-3 bg-[#1e336b] border border-white/5 rounded-md text-sm text-white focus:bg-[#243c7c] focus:outline-none focus:ring-1 focus:ring-blue-400 appearance-none transition-all [&>option]:bg-[#1e336b] [&>option]:text-white">
                                      <option value="" disabled selected>Select...</option>
                                      <option value="cardio">Cardiologist</option>
                                      <option value="neuro">Neurologist</option>
                                      <option value="general">General</option>
                                    </select>
                                  </div>
                                  <div className="space-y-1.5 py-1">
                                    <label className="text-[10px] uppercase font-bold text-blue-300 tracking-wider">Experience</label>
                                    <input 
                                      required
                                      type="number" 
                                      placeholder="Years" 
                                      className="w-full px-4 py-3 bg-[#1e336b] border border-white/5 rounded-md text-sm text-white focus:bg-[#243c7c] focus:outline-none focus:ring-1 focus:ring-blue-400 transition-all placeholder:text-blue-400/50"
                                    />
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>

                            <div className="space-y-1.5">
                              <label className="text-[10px] uppercase font-bold text-blue-300 tracking-wider">
                                {role === 'patient' ? "Health Need/Description" : "Short Bio"}
                              </label>
                              <textarea 
                                required
                                rows={3}
                                placeholder={role === 'patient' ? "Tell us about your health..." : "Tell patients about your expertise..."}
                                className="w-full px-4 py-3 bg-[#1e336b] border border-white/5 rounded-md text-sm text-white focus:bg-[#243c7c] focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-all placeholder:text-blue-400/50 resize-none"
                              />
                            </div>

                            <div className="pt-2">
                              <motion.button
                                layoutId="cta-button"
                                disabled={isSubmitting}
                                type="submit"
                                className="w-full flex items-center justify-center py-3 bg-white text-blue-700 font-bold rounded-md shadow-sm hover:bg-slate-50 transition-colors disabled:opacity-80 py-3.5"
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                              >
                                {isSubmitting ? (
                                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                                ) : (
                                  "Submit Request"
                                )}
                              </motion.button>
                            </div>
                            
                            <p className="text-center text-[10px] text-blue-200/60 mt-4 leading-relaxed">
                              By submitting, you agree to our Terms of Service and Privacy Policy.
                            </p>
                          </form>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="success"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="h-full flex flex-col items-center justify-center text-center py-20"
                        >
                          <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                            className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6 ring-8 ring-green-500/10"
                          >
                            <CheckCircle2 className="w-10 h-10 text-green-400" />
                          </motion.div>
                          <h3 className="text-2xl font-bold text-white mb-2">Account Created!</h3>
                          <p className="text-blue-200 mb-8 max-w-sm mx-auto text-sm leading-relaxed">
                            Welcome to the network. Your {role} account has been set up securely. You can now access your dashboard.
                          </p>
                          <button
                            onClick={() => setIsOpen(false)}
                            className="px-8 py-3 bg-white text-blue-700 font-bold rounded-md hover:bg-slate-50 transition-colors shadow-sm"
                          >
                            Go to Dashboard
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.1);
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}
