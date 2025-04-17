import React, { useState } from "react";
import { AuthProvider, useAuth } from "./components/AuthProvider";
import LoginPage from "./components/LoginPage";
import SignupPage from "./components/SignupPage";
import TyreDetectionApp from "./components/TyreDetectionApp";
import LandingPage from "./components/LandingPage"; 
const AuthWrapper = () => {
  const [authMode, setAuthMode] = useState("landing"); 
  const { user, login, signup, logout } = useAuth();

  if (user) {
    return <TyreDetectionApp user={user} onLogout={logout} />;
  }

  switch (authMode) {
    case "landing":
      return (
        <LandingPage
          onStartAnalysis={() => setAuthMode("login")}
          onLogin={() => setAuthMode("login")}
        />
      );
    case "login":
      return (
        <LoginPage
          onLogin={login}
          switchToSignup={() => setAuthMode("signup")}
          backToLanding={() => setAuthMode("landing")}
        />
      );
    case "signup":
      return (
        <SignupPage
          onSignup={signup}
          switchToLogin={() => setAuthMode("login")}
          backToLanding={() => setAuthMode("landing")}
        />
      );
    default:
      return <LandingPage onStartAnalysis={() => setAuthMode("login")} />;
  }
};

const App = () => {
  return (
    <AuthProvider>
      <AuthWrapper />
    </AuthProvider>
  );
};

export default App;
