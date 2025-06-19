import React, { useState } from "react";
import { useAuth } from "./AuthProvider";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const LoginPage = ({ switchToSignup, onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [otpMode, setOtpMode] = useState(false);
  const [otp, setOtp] = useState("");
  const [tempToken, setTempToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  const { login, requestPasswordReset } = useAuth();

  // Regular login submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setIsLoading(true);
      const result = await login(email, password);

      if (result.success) {
        if (onLoginSuccess) {
          onLoginSuccess(result.user);
        }
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Request OTP for password reset
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    try {
      setIsLoading(true);
      const result = await requestPasswordReset(email);

      if (result.success) {
        setResetEmailSent(true);
        setOtpMode(true);
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error("Password reset request failed:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");

    if (!otp) {
      setError("Please enter the OTP");
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(`${API_URL}/api/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "OTP verification failed");
      }

      setTempToken(data.tempToken);
      setOtpVerified(true);
      setError("");
    } catch (err) {
      console.error("OTP verification failed:", err);
      setError(err.message || "Invalid or expired OTP");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset password with verified OTP
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");

    if (!newPassword) {
      setError("Please enter a new password");
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(`${API_URL}/api/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tempToken, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Password reset failed");
      }

      setForgotPasswordMode(false);
      setOtpMode(false);
      setOtpVerified(false);
      setResetEmailSent(false);
      setEmail("");
      setOtp("");
      setNewPassword("");
      setTempToken("");
      setError("");
      alert("Password reset successful! Please login with your new password.");
    } catch (err) {
      console.error("Password reset failed:", err);
      setError(err.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setForgotPasswordMode(false);
    setOtpMode(false);
    setOtpVerified(false);
    setResetEmailSent(false);
    setError("");
    setOtp("");
    setNewPassword("");
    setTempToken("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex items-center justify-center">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-40 left-10 w-64 h-64 border border-cyan-500/20 rounded-full"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 border border-cyan-500/20 rounded-full"></div>
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
            {forgotPasswordMode
              ? otpVerified
                ? "Reset Password"
                : otpMode
                ? "Verify OTP"
                : "Forgot Password"
              : "Login"}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          {resetEmailSent && !otpVerified && (
            <div className="mb-4 p-3 bg-green-900/30 border border-green-800 rounded-lg text-green-300 text-sm">
              OTP sent to your email! Please check your inbox.
            </div>
          )}

          {!forgotPasswordMode ? (
            <form onSubmit={handleLoginSubmit}>
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

              <div className="mb-2">
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

              <div className="mb-6 text-right">
                <button
                  type="button"
                  onClick={() => setForgotPasswordMode(true)}
                  className="text-sm text-cyan-400 hover:underline"
                  disabled={isLoading}
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                className={`w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold py-2 px-4 rounded-full hover:opacity-90 transition-opacity ${
                  isLoading ? "opacity-70 cursor-not-allowed" : ""
                }`}
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Log In"}
              </button>
            </form>
          ) : !otpMode ? (
            <form onSubmit={handleForgotPassword}>
              <div className="mb-4">
                <label
                  className="block text-gray-400 text-sm mb-2"
                  htmlFor="reset-email"
                >
                  Email
                </label>
                <input
                  id="reset-email"
                  type="email"
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  disabled={isLoading || resetEmailSent}
                />
              </div>

              {!resetEmailSent && (
                <button
                  type="submit"
                  className={`w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold py-2 px-4 rounded-full hover:opacity-90 transition-opacity ${
                    isLoading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Send OTP"}
                </button>
              )}

              <div className="mt-6 text-center text-sm">
                <button
                  onClick={resetForm}
                  className="text-cyan-400 hover:underline"
                  disabled={isLoading}
                >
                  Back to Login
                </button>
              </div>
            </form>
          ) : !otpVerified ? (
            <form onSubmit={handleVerifyOtp}>
              <div className="mb-4">
                <label
                  className="block text-gray-400 text-sm mb-2"
                  htmlFor="otp"
                >
                  Enter OTP
                </label>
                <input
                  id="otp"
                  type="text"
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="6-digit OTP"
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
                {isLoading ? "Verifying..." : "Verify OTP"}
              </button>

              <div className="mt-6 text-center text-sm">
                <button
                  onClick={resetForm}
                  className="text-cyan-400 hover:underline"
                  disabled={isLoading}
                >
                  Back to Login
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleResetPassword}>
              <div className="mb-4">
                <label
                  className="block text-gray-400 text-sm mb-2"
                  htmlFor="new-password"
                >
                  New Password
                </label>
                <input
                  id="new-password"
                  type="password"
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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
                {isLoading ? "Resetting..." : "Reset Password"}
              </button>

              <div className="mt-6 text-center text-sm">
                <button
                  onClick={resetForm}
                  className="text-cyan-400 hover:underline"
                  disabled={isLoading}
                >
                  Back to Login
                </button>
              </div>
            </form>
          )}

          {!forgotPasswordMode && (
            <div className="mt-6 text-center text-sm">
              <p className="text-gray-400">
                Don't have an account?{" "}
                <button
                  onClick={switchToSignup}
                  className="text-cyan-400 hover:underline"
                  disabled={isLoading}
                >
                  Sign Up
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
