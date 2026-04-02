"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckmarkCircle01Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";

const AUTO_PLAY_INTERVAL = 4000;

interface Blog {
  id: number;
  title: string;
  description: string;
  thumbnail: string | null;
  doctor_name: string;
  specialization: string;
}

export function DoctorIntro({ blogs = [], countdown, onGetStarted }: { blogs: Blog[], countdown: number, onGetStarted: () => void }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    if (blogs.length > 0) {
      setActiveIndex((prev) => (prev + 1) % blogs.length);
    }
  }, [blogs.length]);

  useEffect(() => {
    if (isPaused || blogs.length === 0) return;
    const interval = setInterval(nextSlide, AUTO_PLAY_INTERVAL);
    return () => clearInterval(interval);
  }, [nextSlide, isPaused, blogs.length]);

  if (blogs.length === 0) return (
    <div className="w-full h-screen flex items-center justify-center text-gray-400 italic bg-white text-xl font-['Outfit']">
      Loading health insights...
    </div>
  );

  return (
    <div className="w-full min-h-screen lg:h-screen bg-white relative font-['Outfit'] m-0 p-0 overflow-x-hidden">
      <div className="relative overflow-hidden w-full h-full flex flex-col lg:flex-row bg-white">

        {/* LEFT COLUMN: Content */}
        <div className="w-full lg:w-[45%] h-auto lg:h-full relative z-30 flex flex-col justify-center px-6 sm:px-10 md:px-16 lg:pl-20 xl:pl-32 py-20 lg:py-0 bg-white shadow-[0_20px_40px_rgba(0,0,0,0.04)] lg:shadow-[20px_0_40px_rgba(0,0,0,0.04)]">

          {/* Welcome Text Content */}
          <div className="w-full max-w-[500px] mb-8 relative z-50">
            <div className="inline-flex items-center gap-2 bg-[#4FC3F7]/15 text-[#0288D1] px-4 py-2 rounded-full text-sm font-bold tracking-wider uppercase mb-8 border border-[#4FC3F7]/20">
              <HugeiconsIcon icon={CheckmarkCircle01Icon} size={16} />
              DocSpot for Doctors
            </div>

            <h1 className="text-[2.25rem] sm:text-[2.75rem] md:text-[3.5rem] lg:text-[4rem] font-extrabold leading-[1.05] mb-6 text-[#111827] tracking-tight">
              Empowering<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0288D1] to-[#4FC3F7]">Doctors</span> to<br/>
              Deliver <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4FC3F7] to-[#0288D1]">Smarter</span> Care.
            </h1>

            <p className="text-gray-500 text-lg md:text-xl mb-10 max-w-md leading-relaxed font-medium">
              Manage appointments, share medical insights, and grow your practice — all from one powerful platform.
            </p>

            <button
              onClick={onGetStarted}
              className="px-8 py-4 bg-gradient-to-r from-[#4FC3F7] to-[#0288D1] text-white font-bold text-lg rounded-2xl hover:-translate-y-1 hover:shadow-[0_15px_30px_-5px_rgba(2,136,209,0.4)] transition-all duration-300 group inline-flex items-center gap-2"
            >
              Get Started
              <span className="inline-block group-hover:translate-x-1.5 transition-transform">→</span>
            </button>

            <div className="mt-8 text-sm text-gray-400 font-medium flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#0288D1] animate-pulse"></div>
              Auto-redirecting to login in <span className="text-gray-700 font-bold ml-1">{countdown}s</span>
            </div>
          </div>

          {/* Blog chips / titles */}
          <div className="relative w-full mt-4 -ml-4 overflow-hidden">
            <div className="flex flex-col gap-3 pl-4">
              {blogs.slice(0, 5).map((blog, index) => (
                <button
                  key={blog.id}
                  onClick={() => setActiveIndex(index)}
                  onMouseEnter={() => setIsPaused(true)}
                  onMouseLeave={() => setIsPaused(false)}
                  className={cn(
                    "relative flex items-center gap-4 px-6 py-3.5 rounded-full transition-all duration-500 text-left group border w-fit",
                    index === activeIndex
                      ? "bg-[#0288D1] text-white border-[#0288D1] shadow-lg shadow-[#0288D1]/20 scale-105"
                      : "bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-800 hover:bg-white cursor-pointer"
                  )}
                >
                  <div className={cn("flex items-center justify-center transition-colors duration-500", index === activeIndex ? "text-white" : "text-gray-400 group-hover:text-gray-600")}>
                    <HugeiconsIcon icon={CheckmarkCircle01Icon} size={20} strokeWidth={2} />
                  </div>
                  <span className="font-bold text-[13px] md:text-[14px] tracking-wide uppercase line-clamp-1">
                    {blog.title.length > 35 ? blog.title.substring(0, 35) + '...' : blog.title}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Blog Cards */}
        <div className="w-full lg:flex-1 h-[50vh] sm:h-[60vh] lg:h-full relative bg-gradient-to-br from-[#E3F2FD] to-[#B3E5FC] flex items-center justify-center py-10 lg:py-20 px-4 sm:px-8 lg:px-20 overflow-hidden">
          {/* Subtle background circles for depth */}
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-white/40 rounded-full blur-[80px]" />
          <div className="absolute -bottom-40 -left-20 w-[600px] h-[600px] bg-[#0288D1]/10 rounded-full blur-[80px]" />

          <div className="relative w-full max-w-[280px] sm:max-w-[340px] lg:max-w-[420px] aspect-[4/5] flex items-center justify-center mt-[-2%]">
            {blogs.slice(0, 5).map((blog, index) => {
              const isActive = index === activeIndex;
              const isPrev = index === (activeIndex - 1 + blogs.length) % blogs.length;
              const isNext = index === (activeIndex + 1) % blogs.length;

              return (
                <motion.div
                  key={blog.id}
                  initial={false}
                  animate={{
                    x: isActive ? 0 : isPrev ? -140 : isNext ? 140 : 0,
                    scale: isActive ? 1 : isPrev || isNext ? 0.8 : 0.65,
                    opacity: isActive ? 1 : isPrev || isNext ? 0.3 : 0,
                    rotate: isPrev ? -5 : isNext ? 5 : 0,
                    zIndex: isActive ? 20 : isPrev || isNext ? 10 : 0,
                    pointerEvents: isActive ? "auto" : "none",
                  }}
                  transition={{ type: "spring", stiffness: 260, damping: 25, mass: 0.8 }}
                  className="absolute inset-0 rounded-[2.5rem] lg:rounded-[3rem] overflow-hidden border-8 border-white bg-white shadow-2xl origin-center"
                >
                  <img
                    src={blog.thumbnail || "https://img.freepik.com/free-vector/doctor-character-background_1270-84.jpg"}
                    alt={blog.title}
                    className={cn(
                      "w-full h-full object-cover transition-all duration-700",
                      isActive ? "grayscale-0 blur-0" : "grayscale blur-[3px] brightness-[0.6] transition-all"
                    )}
                  />
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute inset-x-0 bottom-0 p-8 pb-10 pt-40 bg-gradient-to-t from-[#0f172a]/95 via-[#0f172a]/60 to-transparent flex flex-col justify-end pointer-events-none"
                      >
                        <div className="bg-white/10 backdrop-blur-md text-[#4FC3F7] px-4 py-1.5 rounded-full text-[12px] font-bold uppercase tracking-[0.2em] w-fit shadow-lg mb-4 border border-white/20">
                          Health Insight • {blog.specialization}
                        </div>
                        <p className="text-white font-bold text-xl lg:text-2xl leading-tight drop-shadow-lg tracking-tight">
                          {blog.title}
                        </p>
                        <p className="text-white/70 text-sm mt-2 font-medium">
                          By Dr. {blog.doctor_name}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}

export default DoctorIntro;
