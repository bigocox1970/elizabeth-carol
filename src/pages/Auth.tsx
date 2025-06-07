import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const Auth = () => {
  const [mode, setMode] = useState<"login" | "register">("login");
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/profile";

  // If user is already logged in, redirect to intended page
  if (user) {
    navigate(redirectTo);
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          {mode === "login" ? (
            <LoginForm 
              onSuccess={() => navigate(redirectTo)} 
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
