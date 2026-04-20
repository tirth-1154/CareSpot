import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User,
  Mail,
  Lock,
  Calendar,
  ArrowRight, 
  CheckCircle2, 
  Loader2,
  ChevronLeft
} from "lucide-react";

// Gravity Sparkles component for glowy #229FDF particle background
const GravitySparkles = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const particles: any[] = [];
    const particleCount = 100;

    class Particle {
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      opacity: number;
      fadeSpeed: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height; 
        this.size = Math.random() * 2 + 1;
        this.speedY = Math.random() * 1.5 + 0.5; // Gravity falling speed
        this.speedX = (Math.random() - 0.5) * 1;
        this.opacity = Math.random() * 0.8 + 0.2;
        this.fadeSpeed = Math.random() * 0.02;
      }

      update() {
        this.y += this.speedY;
        this.x += this.speedX;
        
        // Glimmer
        this.opacity -= this.fadeSpeed;
        if (this.opacity <= 0.1 || this.opacity >= 1) {
          this.fadeSpeed = -this.fadeSpeed;
        }

        // Reset to top when passing bottom
        if (this.y > height) {
          this.y = -10;
          this.x = Math.random() * width;
          this.speedY = Math.random() * 1.5 + 0.5;
        }
        
        // Wrap horizontally
        if (this.x > width) this.x = 0;
        if (this.x < 0) this.x = width;
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(34, 159, 223, ${this.opacity})`; // #229FDF
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#229FDF';
        ctx.fill();
        ctx.closePath();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        p.update();
        p.draw();
      }
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 pointer-events-none"
    />
  );
};

export default function RegisterExpandable() {
  const [isOpen, setIsOpen] = useState(false);
  const [role, setRole] = useState<"patient" | "doctor">("patient");
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gender, setGender] = useState("");

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  // Auto-open logic after brief delay
  useEffect(() => {
    const timer = setTimeout(() => setIsOpen(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmitFinal = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setStep(3); // Navigate to success step
    }, 2000);
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#071324] text-slate-900 font-sans">
      
      {/* Background with dark overlay and sparkles */}
      <GravitySparkles />
      <div 
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background: "radial-gradient(circle at 50% 50%, rgba(34, 159, 223, 0.1) 0%, transparent 70%)"
        }}
      />

      <AnimatePresence>
        {!isOpen ? (
          <motion.div
            layoutId="register-modal-container"
            className="relative z-10 flex flex-col items-center justify-center p-8 max-w-2xl text-center"
          >
            <motion.h1 layoutId="title" className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6">
              DocSpot <br/>
              <span className="text-[#229FDF]">Network</span>
            </motion.h1>

            <motion.p layoutId="subtitle" className="text-lg text-blue-100/80 mb-10 max-w-xl mx-auto">
              Connecting thousands of specialized doctors with patients seamlessly. Your journey to better health starts here.
            </motion.p>
          </motion.div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#071324]/80 backdrop-blur-md z-40 transition-opacity"
              onClick={() => setIsOpen(false)}
            />
            
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-none">
              <motion.div
                layoutId="register-modal-container"
                className="w-full max-w-[550px] bg-white rounded-2xl shadow-2xl overflow-hidden pointer-events-auto relative py-8 px-6 sm:px-10"
              >
                {step < 3 && (
                  <div className="text-center mb-6">
                    <h2 className="text-2xl sm:text-3xl font-bold text-[#145C8F] mb-2 uppercase tracking-wide">
                      Create Account
                    </h2>
                    <p className="text-slate-500 text-sm">
                      Already have an account? <a href="/login" className="text-[#117C9B] font-bold hover:underline">Log In!</a>
                    </p>
                  </div>
                )}

                {step < 3 && (
                  <>
                    {/* Patient / Doctor Toggle */}
                    <div className="flex mb-8 bg-slate-50 rounded-lg p-1 border border-slate-200">
                      <button
                        type="button"
                        onClick={() => setRole("patient")}
                        className={`flex-1 py-2.5 text-sm font-bold rounded-md transition-all ${
                          role === "patient" ? "bg-[#117C9B] text-white shadow-md" : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        Patient
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole("doctor")}
                        className={`flex-1 py-2.5 text-sm font-bold rounded-md transition-all ${
                          role === "doctor" ? "bg-[#117C9B] text-white shadow-md" : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        Doctor
                      </button>
                    </div>

                    {/* Stepper indicator matching the screenshot */}
                    <div className="flex items-center justify-center mb-10 text-slate-400">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm z-10 transition-colors ${step >= 1 ? 'bg-[#117C9B] text-white' : 'bg-slate-200'}`}>1</div>
                      <div className={`w-12 h-0.5 -mx-1 z-0 transition-colors ${step >= 2 ? 'bg-[#117C9B]' : 'bg-slate-200'}`}></div>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm z-10 transition-colors ${step >= 2 ? 'bg-[#117C9B] text-white' : 'bg-slate-200'}`}>2</div>
                      <div className={`w-12 h-0.5 -mx-1 z-0 transition-colors ${step >= 3 ? 'bg-[#117C9B]' : 'bg-slate-200'}`}></div>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm z-10 transition-colors ${step >= 3 ? 'bg-[#117C9B] text-white' : 'bg-slate-200'}`}>3</div>
                    </div>
                  </>
                )}

                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b pb-2">
                        Personal Information
                      </h3>
                      
                      <form onSubmit={handleNext} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Full Name */}
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <User className="h-4 w-4 text-slate-400" />
                            </div>
                            <input
                              required
                              type="text"
                              placeholder="Full Name"
                              className="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#229FDF]/30 focus:border-[#229FDF] transition-all"
                            />
                          </div>
                          
                          {/* Email */}
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Mail className="h-4 w-4 text-slate-400" />
                            </div>
                            <input
                              required
                              type="email"
                              placeholder="Email Address"
                              className="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#229FDF]/30 focus:border-[#229FDF] transition-all"
                            />
                          </div>

                          {/* Password */}
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Lock className="h-4 w-4 text-slate-400" />
                            </div>
                            <input
                              required
                              type="password"
                              placeholder="Password"
                              className="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#229FDF]/30 focus:border-[#229FDF] transition-all"
                            />
                          </div>

                          {/* Date of Birth */}
                          <div className="relative flex items-center">
                            <input
                              required
                              type="date"
                              placeholder="dd-mm-yyyy"
                              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#229FDF]/30 focus:border-[#229FDF] transition-all appearance-none [&::-webkit-calendar-picker-indicator]:opacity-0 z-10 bg-transparent"
                            />
                            <div className="absolute right-3 text-slate-500 z-0">
                               <Calendar className="w-4 h-4" />
                            </div>
                          </div>
                        </div>

                        {/* Gender */}
                        <div className="mt-4 border border-slate-300 rounded-lg p-3">
                          <label className="text-xs font-bold text-slate-800 block mb-2">Gender</label>
                          <div className="flex gap-6">
                            <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600">
                              <input 
                                type="radio" 
                                name="gender" 
                                value="male"
                                required
                                checked={gender === "male"}
                                onChange={(e) => setGender(e.target.value)}
                                className="w-4 h-4 text-[#229FDF] focus:ring-[#229FDF] border-slate-300" 
                              />
                              Male
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600">
                              <input 
                                type="radio" 
                                name="gender" 
                                value="female"
                                required
                                checked={gender === "female"}
                                onChange={(e) => setGender(e.target.value)}
                                className="w-4 h-4 text-[#229FDF] focus:ring-[#229FDF] border-slate-300" 
                              />
                              Female
                            </label>
                          </div>
                        </div>

                        <div className="pt-6">
                          <button
                            type="submit"
                            className="w-full flex items-center justify-center gap-2 py-3 bg-[#117C9B] hover:bg-[#0c617a] text-white font-bold rounded-lg shadow-md transition-colors text-sm"
                          >
                            Continue <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <button 
                        onClick={handleBack}
                        className="flex items-center gap-1 text-sm text-slate-500 hover:text-[#229FDF] mb-4 transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4"/> Back
                      </button>

                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b pb-2">
                        {role === "patient" ? "Medical Details" : "Professional Details"}
                      </h3>

                      <form onSubmit={handleSubmitFinal} className="space-y-4">
                        {role === "patient" ? (
                          <>
                            <div className="space-y-1">
                              <label className="text-sm font-semibold text-slate-700">Phone Number</label>
                              <input required type="tel" placeholder="+1 (555) 000-00" className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#229FDF]/30 focus:border-[#229FDF]" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-sm font-semibold text-slate-700">Health Need/Description</label>
                              <textarea required rows={3} placeholder="Tell us about any pre-existing conditions..." className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#229FDF]/30 focus:border-[#229FDF] resize-none" />
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="text-sm font-semibold text-slate-700">Specialty</label>
                                <select required className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#229FDF]/30 focus:border-[#229FDF]">
                                  <option value="">Select...</option>
                                  <option value="cardio">Cardiologist</option>
                                  <option value="neuro">Neurologist</option>
                                  <option value="general">General</option>
                                </select>
                              </div>
                              <div className="space-y-1">
                                <label className="text-sm font-semibold text-slate-700">Experience (Years)</label>
                                <input required type="number" placeholder="e.g. 5" className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#229FDF]/30 focus:border-[#229FDF]" />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <label className="text-sm font-semibold text-slate-700">Short Bio</label>
                              <textarea required rows={3} placeholder="Tell patients about your expertise..." className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#229FDF]/30 focus:border-[#229FDF] resize-none" />
                            </div>
                          </>
                        )}

                        <div className="pt-6">
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-[#117C9B] hover:bg-[#0c617a] text-white font-bold rounded-lg shadow-md transition-colors text-sm disabled:opacity-70"
                          >
                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                              <>Submit Registration <CheckCircle2 className="w-4 h-4" /></>
                            )}
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-8"
                    >
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                        className="w-20 h-20 bg-[#229FDF]/10 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-[#229FDF]/5"
                      >
                        <CheckCircle2 className="w-10 h-10 text-[#229FDF]" />
                      </motion.div>
                      <h3 className="text-2xl font-bold text-[#145C8F] mb-2">Account Created!</h3>
                      <p className="text-slate-500 mb-8 max-w-sm mx-auto text-sm leading-relaxed">
                        Welcome to DocSpot. Your {role} account has been set up securely. You can now access your dashboard.
                      </p>
                      <button
                        onClick={() => setIsOpen(false)}
                        className="px-8 py-3 bg-[#117C9B] text-white font-bold rounded-lg hover:bg-[#0c617a] transition-colors shadow-md w-full sm:w-auto"
                      >
                        Go to Dashboard
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
                
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
