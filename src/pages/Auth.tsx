import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const Auth = () => {
  const [mode, setMode] = useState<"login" | "register">("login");
  const { user } = useAuth();
  const navigate = useNavigate();

  // If user is already logged in, redirect to profile
  if (user) {
    navigate("/profile");
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          {mode === "login" ? (
            <LoginForm 
              onSuccess={() => navigate("/profile")} 
              onRegisterClick={() => setMode("register")} 
            />
          ) : (
            <RegisterForm 
              onSuccess={() => setMode("login")} 
              onLoginClick={() => setMode("login")} 
            />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Auth;
