"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckmarkCircle01Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";

const AUTO_PLAY_INTERVAL = 4000;
const ITEM_HEIGHT = 70;

const wrap = (min: number, max: number, v: number) => {
  const rangeSize = max - min;
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
};

interface Doctor {
  id: number;
  name: string;
  specialization: string;
  profile_image: string | null;
}

export function FeatureCarousel({ doctors = [], countdown, onGetStarted }: { doctors: Doctor[], countdown: number, onGetStarted: () => void }) {
  const [step, setStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const FEATURES = doctors.map((doctor) => ({
    id: doctor.id,
    label: doctor.specialization,
    icon: CheckmarkCircle01Icon,
    image: doctor.profile_image || "https://img.freepik.com/free-vector/doctor-character-background_1270-84.jpg",
    description: `${doctor.name.startsWith('Dr') ? '' : 'Dr. '}${doctor.name} - ${doctor.specialization}`,
  }));

  const currentIndex = FEATURES.length > 0 ? ((step % FEATURES.length) + FEATURES.length) % FEATURES.length : 0;

  const nextStep = useCallback(() => {
    if (FEATURES.length > 0) {
      setStep((prev) => prev + 1);
    }
  }, [FEATURES.length]);

  const handleChipClick = (index: number) => {
    const diff = (index - currentIndex + FEATURES.length) % FEATURES.length;
    if (diff > 0) setStep((s) => s + diff);
  };

  useEffect(() => {
    if (isPaused || FEATURES.length === 0) return;
    const interval = setInterval(nextStep, AUTO_PLAY_INTERVAL);
    return () => clearInterval(interval);
  }, [nextStep, isPaused, FEATURES.length]);

  const getCardStatus = (index: number) => {
    const diff = index - currentIndex;
    const len = FEATURES.length;

    let normalizedDiff = diff;
    if (diff > len / 2) normalizedDiff -= len;
    if (diff < -len / 2) normalizedDiff += len;

    if (normalizedDiff === 0) return "active";
    if (normalizedDiff === -1) return "prev";
    if (normalizedDiff === 1) return "next";
    return "hidden";
  };

  if (FEATURES.length === 0) return (
    <div className="w-full h-screen flex items-center justify-center text-muted-foreground italic bg-gray-50 text-xl">
      Loading docspot experts...
    </div>
  );

  return (
    <div className="w-full min-h-screen lg:h-screen bg-white relative font-['Outfit'] m-0 p-0 overflow-x-hidden">
      <div className="relative overflow-hidden w-full h-full flex flex-col lg:flex-row bg-white">
        
        {/* LEFT COLUMN: Content & Chips */}
        <div className="w-full lg:w-[45%] h-auto lg:h-full relative z-30 flex flex-col justify-center px-6 sm:px-10 md:px-16 lg:pl-20 xl:pl-32 py-20 lg:py-0 bg-white shadow-[0_20px_40px_rgba(0,0,0,0.04)] lg:shadow-[20px_0_40px_rgba(0,0,0,0.04)]">
          
          {/* Welcome Text Content */}
          <div className="w-full max-w-[500px] mb-8 relative z-50">
            <div className="inline-flex items-center gap-2 bg-[#4FC3F7]/15 text-[#0288D1] px-4 py-2 rounded-full text-sm font-bold tracking-wider uppercase mb-8 border border-[#4FC3F7]/20">
              <HugeiconsIcon icon={CheckmarkCircle01Icon} size={16} />
              Welcome to DocSpot
            </div>
            
            <h1 className="text-[2.25rem] sm:text-[2.75rem] md:text-[3.5rem] lg:text-[4rem] font-extrabold leading-[1.05] mb-6 text-[#111827] tracking-tight">
              Find the <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0288D1] to-[#4FC3F7]">Best Doctor</span><br/> Near You.
            </h1>
            
            <p className="text-gray-500 text-lg md:text-xl mb-10 max-w-md leading-relaxed font-medium">
              Connect with top-rated medical specialists, book appointments effortlessly, and manage your health journey in one secure place.
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

          {/* Chips List Overlay right below the text */}
          <div className="relative w-full h-[220px] lg:h-[280px] mt-8 -ml-4 overflow-hidden">
            {/* Fade overlays for the chips list */}
            <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-white to-transparent z-40" />
            <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white to-transparent z-40" />
            
            <div className="relative w-full h-full flex items-center justify-start z-20">
              {FEATURES.map((feature, index) => {
                const isActive = index === currentIndex;
                const distance = index - currentIndex;
                const wrappedDistance = wrap(
                  -(FEATURES.length / 2),
                  FEATURES.length / 2,
                  distance
                );

                return (
                  <motion.div
                    key={feature.id}
                    style={{ height: ITEM_HEIGHT, width: "fit-content" }}
                    animate={{
                      y: wrappedDistance * ITEM_HEIGHT,
                      opacity: 1 - Math.abs(wrappedDistance) * 0.25,
                    }}
                    transition={{ type: "spring", stiffness: 90, damping: 22, mass: 1 }}
                    className="absolute flex items-center justify-start ml-4"
                  >
                    <button
                      onClick={() => handleChipClick(index)}
                      onMouseEnter={() => setIsPaused(true)}
                      onMouseLeave={() => setIsPaused(false)}
                      className={cn(
                        "relative flex items-center gap-4 px-6 py-3.5 rounded-full transition-all duration-500 text-left group border",
                        isActive
                          ? "bg-[#0288D1] text-white border-[#0288D1] shadow-lg shadow-[#0288D1]/20 z-10 scale-105"
                          : "bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-800 hover:bg-white cursor-pointer"
                      )}
                    >
                      <div className={cn("flex items-center justify-center transition-colors duration-500", isActive ? "text-white" : "text-gray-400 group-hover:text-gray-600")}>
                        <HugeiconsIcon icon={feature.icon} size={20} strokeWidth={2} />
                      </div>
                      <span className="font-bold text-[13px] md:text-[14px] tracking-wide uppercase">
                        {feature.label}
                      </span>
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Photo Cards */}
        <div className="w-full lg:flex-1 h-[50vh] sm:h-[60vh] lg:h-full relative bg-gradient-to-br from-[#E3F2FD] to-[#B3E5FC] flex items-center justify-center py-10 lg:py-20 px-4 sm:px-8 lg:px-20 overflow-hidden">
          {/* Subtle background circles for depth */}
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-white/40 rounded-full blur-[80px]" />
          <div className="absolute -bottom-40 -left-20 w-[600px] h-[600px] bg-[#0288D1]/10 rounded-full blur-[80px]" />

          <div className="relative w-full max-w-[280px] sm:max-w-[340px] lg:max-w-[420px] aspect-[4/5] flex items-center justify-center mt-[-2%]">
            {FEATURES.map((feature, index) => {
              const status = getCardStatus(index);
              const isActive = status === "active";
              const isPrev = status === "prev";
              const isNext = status === "next";

              return (
                <motion.div
                  key={feature.id}
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
                    src={feature.image}
                    alt={feature.label}
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
                          Top Specialist • {feature.label}
                        </div>
                        <p className="text-white font-bold text-2xl lg:text-3xl leading-tight drop-shadow-lg tracking-tight">
                          {feature.description}
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

export default FeatureCarousel;
