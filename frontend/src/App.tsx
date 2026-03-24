import { useState, useEffect } from 'react'
import { FeatureCarousel } from '@/components/ui/feature-carousel'

interface Doctor {
  id: number;
  name: string;
  specialization: string;
  profile_image: string | null;
}

function App() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log("App.tsx: Fetching doctors...");
    const fetchDoctors = async () => {
      try {
        const response = await fetch('/api/doctors/')
        console.log("App.tsx: API response status:", response.status);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json()
        console.log("App.tsx: Data received:", data.length, "doctors");
        setDoctors(data)
      } catch (err: any) {
        console.error('App.tsx: Error fetching doctors:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchDoctors()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-blue-400/20 rounded-3xl">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mb-4"></div>
        <p className="text-white font-medium">Loading specialist profiles...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-red-400/20 rounded-3xl p-8 text-center">
        <p className="text-white font-bold mb-2">Unable to load doctors</p>
        <p className="text-white/80 text-sm">{error}</p>
      </div>
    )
  }

  return (
    <div className="w-full h-full">
      <FeatureCarousel doctors={doctors} />
    </div>
  )
}

export default App
