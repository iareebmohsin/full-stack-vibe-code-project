'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Home() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: 'var(--background)' }}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-400/5 rounded-full blur-3xl" />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-12 px-6">
        {/* Logo container with animation */}
        <div className="animate-[scaleIn_0.6s_ease-out]">
          <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
            <Image
              src="/logo.svg"
              alt="AI Tools Platform"
              width={320}
              height={320}
              priority
              className="w-full h-full object-contain drop-shadow-2xl"
              style={{ filter: 'drop-shadow(0 0 40px rgba(59, 130, 246, 0.3))' }}
            />
          </div>
        </div>

        {/* Welcome button with animation */}
        <div className="animate-[fadeIn_0.8s_ease-out_0.3s_both]">
          <button
            onClick={handleGetStarted}
            className="group relative px-12 py-5 text-lg font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-full overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/50 active:scale-95"
          >
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Button content */}
            <span className="relative flex items-center gap-3">
              Welcome to AI Tools
              <svg
                className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>

            {/* Shine effect on hover */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </button>
        </div>

        {/* Subtle tagline */}
        <p className="animate-[fadeIn_1s_ease-out_0.5s_both] text-center text-gray-400 text-sm md:text-base max-w-md">
          Discover, share, and manage AI tools for your team
        </p>
      </div>
    </div>
  );
}
