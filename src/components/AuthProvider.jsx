import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";

const API_URL = "http://localhost:3000";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on app startup
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");

      if (token && userData) {
        try {
          // Set up axios with the stored token
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

          // Verify token is still valid with backend
          const response = await axios.get(`${API_URL}/api/profile`);

          // If successful, update user state
          setUser(response.data.user);
        } catch (error) {
          // Token invalid or expired
          console.error("Authentication verification failed:", error);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          axios.defaults.headers.common["Authorization"] = "";
        }
      }

      setLoading(false);
    };

    checkAuthStatus();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/api/login`, {
        email,
        password,
      });

      // Store token and user data
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      // Set up axios for future requests
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${response.data.token}`;

      // Update state
      setUser(response.data.user);

      return { success: true, user: response.data.user };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Login failed. Please try again.",
      };
    }
  };

  // Signup function
  const signup = async (name, email, password) => {
    try {
      const response = await axios.post(`${API_URL}/api/signup`, {
        name,
        email,
        password,
      });

      // Store token and user data
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      // Set up axios for future requests
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${response.data.token}`;

      // Update state
      setUser(response.data.user);

      return { success: true, user: response.data.user };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.error ||
          "Registration failed. Please try again.",
      };
    }
  };

  // Request password reset function (sends OTP)
  const requestPasswordReset = async (email) => {
    try {
      const response = await axios.post(`${API_URL}/api/forgot-password`, {
        email,
      });

      return { success: true, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.error ||
          "Password reset request failed. Please try again.",
      };
    }
  };

  // Verify OTP function
  const verifyOtp = async (email, otp) => {
    try {
      const response = await axios.post(`${API_URL}/api/verify-otp`, {
        email,
        otp,
      });

      return { success: true, tempToken: response.data.tempToken };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.error ||
          "OTP verification failed. Please try again.",
      };
    }
  };

  // Reset password function
  const resetPassword = async (tempToken, newPassword) => {
    try {
      const response = await axios.post(`${API_URL}/api/reset-password`, {
        tempToken,
        newPassword,
      });

      return { success: true, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.error ||
          "Password reset failed. Please try again.",
      };
    }
  };

  // Logout function
  const logout = () => {
    // Remove token and user data from storage
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Remove Authorization header
    axios.defaults.headers.common["Authorization"] = "";

    // Update state
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        requestPasswordReset,
        verifyOtp,
        resetPassword,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
