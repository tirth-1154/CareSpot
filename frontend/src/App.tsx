import { useState, useEffect } from 'react'
import { FeatureCarousel } from '@/components/ui/feature-carousel'
import { DoctorIntro } from '@/components/ui/doctor-intro'

interface Doctor {
  id: number;
  name: string;
  specialization: string;
  profile_image: string | null;
}

interface Blog {
  id: number;
  title: string;
  description: string;
  thumbnail: string | null;
  doctor_name: string;
  specialization: string;
}

function App() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [countdown, setCountdown] = useState(15);
  const [activeView, setActiveView] = useState<'patient' | 'doctor'>('patient');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [doctorsRes, blogsRes] = await Promise.all([
          fetch('/api/doctors/'),
          fetch('/api/blogs/')
        ]);
        
        if (!doctorsRes.ok || !blogsRes.ok) {
          throw new Error('Failed to fetch data');
        }
        
        const doctorsData = await doctorsRes.json();
        const blogsData = await blogsRes.json();
        
        setDoctors(doctorsData);
        setBlogs(blogsData);
      } catch (err: any) {
        console.error('App.tsx: Error fetching data:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Global Countdown and Redirect Logic
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleGetStarted = () => {
    document.body.style.transition = 'opacity 0.6s ease';
    document.body.style.opacity = '0';
    setTimeout(() => {
        window.location.href = "/login/";
    }, 600);
  };

  useEffect(() => {
    const redirectTimeout = setTimeout(() => {
      handleGetStarted();
    }, 15000); // 15 seconds
    return () => clearTimeout(redirectTimeout);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-full bg-blue-400/20 rounded-3xl">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mb-4"></div>
        <p className="text-white font-medium">Loading DocSpot...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-full bg-red-400/20 rounded-3xl p-8 text-center">
        <p className="text-white font-bold mb-2">Unable to load data</p>
        <p className="text-white/80 text-sm">{error}</p>
      </div>
    )
  }

  return (
    <div className="relative w-full h-screen lg:h-screen overflow-hidden lg:overflow-hidden bg-white">
      {/* View Toggle */}
      <div className="absolute top-6 md:top-8 left-1/2 -translate-x-1/2 z-[100] bg-white/90 backdrop-blur-md p-1.5 rounded-full shadow-xl border border-white/50 flex gap-1 w-fit max-w-[90vw]">
        <button
          onClick={() => setActiveView('patient')}
          className={`px-4 sm:px-8 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 whitespace-nowrap ${
            activeView === 'patient' 
              ? 'bg-[#0288D1] text-white shadow-md' 
              : 'text-gray-500 hover:text-gray-800 hover:bg-white/50'
          }`}
        >
          For Patients
        </button>
        <button
          onClick={() => setActiveView('doctor')}
          className={`px-4 sm:px-8 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 whitespace-nowrap ${
            activeView === 'doctor' 
              ? 'bg-[#0288D1] text-white shadow-md' 
              : 'text-gray-500 hover:text-gray-800 hover:bg-white/50'
          }`}
        >
          For Doctors
        </button>
      </div>

      <div className={`absolute inset-0 transition-opacity duration-700 ${activeView === 'patient' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
        <FeatureCarousel doctors={doctors} countdown={countdown} onGetStarted={handleGetStarted} />
      </div>

      <div className={`absolute inset-0 transition-opacity duration-700 ${activeView === 'doctor' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
        <DoctorIntro blogs={blogs} countdown={countdown} onGetStarted={handleGetStarted} />
      </div>
    </div>
  )
}

export default App
