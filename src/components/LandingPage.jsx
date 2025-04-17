import React from "react";

const LandingPage = ({ onStartAnalysis, onLogin }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-40 left-10 w-64 h-64 border border-cyan-500/20 rounded-full"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 border border-cyan-500/20 rounded-full"></div>

        {/* Grid lines */}
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={`h-line-${i}`}
            className="absolute h-px w-full bg-cyan-500/10"
            style={{ top: `${i * 5}%` }}
          ></div>
        ))}
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={`v-line-${i}`}
            className="absolute w-px h-full bg-cyan-500/10"
            style={{ left: `${i * 5}%` }}
          ></div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-16">
        {/* Header */}
        <header className="flex justify-between items-center mb-16">
          <div>
            <h1 className="text-3xl font-bold tracking-wider text-cyan-300">
              TYRE<span className="text-white">DETECT</span>
            </h1>
          </div>
          <div>
            <button
              onClick={onLogin}
              className="px-4 py-2 text-sm bg-transparent border border-cyan-400 text-cyan-400 rounded-full hover:bg-cyan-400/10 transition-colors"
            >
              Log In
            </button>
          </div>
        </header>

        {/* Hero Section */}
        <div className="flex flex-col md:flex-row items-center justify-between py-16">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h2 className="text-5xl font-bold mb-6">
              Advanced Tire Detection
              <span className="text-cyan-400"> Technology</span>
            </h2>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Identify tire issues before they become problems. Our cutting-edge
              AI analyzes tire conditions in real-time, providing detailed
              insights and safety recommendations.
            </p>
            <button
              onClick={onStartAnalysis}
              className="px-8 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold rounded-full hover:opacity-90 transition-opacity"
            >
              Start Analysis
            </button>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="w-80 h-80 relative">
              {/* Placeholder for tire image or illustration */}
              <div className="absolute inset-0 border-4 border-cyan-400/30 rounded-full animate-spin-slow"></div>
              <div className="absolute inset-8 border-2 border-cyan-400/50 rounded-full"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-40 h-40 bg-cyan-400/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <span className="text-cyan-300 text-5xl font-bold">T</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-16">
          <h3 className="text-2xl font-bold mb-10 text-center">
            Key <span className="text-cyan-400">Features</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-800/30 backdrop-blur-sm p-6 rounded-xl border border-gray-700">
              <div className="w-12 h-12 bg-cyan-400/20 rounded-full flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-cyan-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h4 className="text-xl font-bold mb-2">Real-time Analysis</h4>
              <p className="text-gray-400">
                Instant feedback on tire condition using our advanced AI
                detection algorithms.
              </p>
            </div>
            <div className="bg-gray-800/30 backdrop-blur-sm p-6 rounded-xl border border-gray-700">
              <div className="w-12 h-12 bg-cyan-400/20 rounded-full flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-cyan-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h4 className="text-xl font-bold mb-2">Predictive Maintenance</h4>
              <p className="text-gray-400">
                Identify potential issues before they become critical, saving
                time and money.
              </p>
            </div>
            <div className="bg-gray-800/30 backdrop-blur-sm p-6 rounded-xl border border-gray-700">
              <div className="w-12 h-12 bg-cyan-400/20 rounded-full flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-cyan-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h4 className="text-xl font-bold mb-2">Detailed Reports</h4>
              <p className="text-gray-400">
                Comprehensive analysis with actionable insights and recommended
                next steps.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-800 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">
              © 2025 TyreDetect Technology. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="#" className="text-gray-500 hover:text-cyan-400">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-500 hover:text-cyan-400">
                Terms of Service
              </a>
              <a href="#" className="text-gray-500 hover:text-cyan-400">
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
