import React, { useState } from "react";
import { useAuth } from "./AuthProvider"; // Import the useAuth hook

const SignupPage = ({ switchToLogin, onSignupSuccess }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Use the auth context instead of directly handling API calls
  const { signup } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setIsLoading(true);

      // Use the signup function from AuthContext
      const result = await signup(name, email, password);

      if (result.success) {
        // Call the onSignupSuccess callback if provided
        if (onSignupSuccess) {
          onSignupSuccess(result.user);
        }
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error("Signup failed:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex items-center justify-center">
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

      <div className="relative z-10 w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-wider text-cyan-300">
            TYRE<span className="text-white">DETECT</span>
          </h1>
          <p className="text-gray-400 mt-2">
            Advanced tire detection technology
          </p>
        </div>

        <div className="bg-gray-900/80 backdrop-blur-lg rounded-3xl overflow-hidden border border-gray-800 shadow-2xl p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Create Account
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                className="block text-gray-400 text-sm mb-2"
                htmlFor="name"
              >
                Full Name
              </label>
              <input
                id="name"
                type="text"
                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                disabled={isLoading}
              />
            </div>

            <div className="mb-4">
              <label
                className="block text-gray-400 text-sm mb-2"
                htmlFor="email"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                disabled={isLoading}
              />
            </div>

            <div className="mb-4">
              <label
                className="block text-gray-400 text-sm mb-2"
                htmlFor="password"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLoading}
              />
            </div>

            <div className="mb-6">
              <label
                className="block text-gray-400 text-sm mb-2"
                htmlFor="confirmPassword"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              className={`w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold py-2 px-4 rounded-full hover:opacity-90 transition-opacity ${
                isLoading ? "opacity-70 cursor-not-allowed" : ""
              }`}
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-gray-400">
              Already have an account?{" "}
              <button
                onClick={switchToLogin}
                className="text-cyan-400 hover:underline"
                disabled={isLoading}
              >
                Log In
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
