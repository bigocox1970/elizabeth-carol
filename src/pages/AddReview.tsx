import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ReviewForm from "@/components/ReviewForm";
import { useAuth } from "@/contexts/AuthContext";

const AddReview = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-serif font-bold text-foreground mb-4">
              Share Your Experience
            </h1>
            <p className="text-lg text-muted-foreground">
              Tell others about your experience with Elizabeth Carol's spiritual services
            </p>
          </div>
          
          <ReviewForm 
            onSuccess={() => {
              navigate("/testimonials");
            }} 
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AddReview; 