import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Quote, MapPin, Calendar, Heart, Loader2 } from "lucide-react";
import ReviewForm from "@/components/ReviewForm";
import { useAuth } from "@/contexts/AuthContext";
import { getApiUrl } from "@/utils/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Testimonial {
  id: number | string;
  name: string;
  location?: string;
  text: string;
  rating: number;
  service?: string;
  createdAt?: string;
}

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedTestimonials, setExpandedTestimonials] = useState<Set<number | string>>(new Set());
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading reviews...');
      
      const apiUrl = getApiUrl('manage-reviews');
      console.log('API URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'get-approved-reviews' }),
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Reviews data received:', data);
      
      if (!data.reviews) {
        throw new Error('No reviews data in response');
      }
      
      const formattedReviews = data.reviews.map(review => ({
        id: review.id,
        name: review.name,
        location: review.location,
        text: review.comment || review.content,
        rating: review.rating,
        service: review.service,
        createdAt: review.createdAt
      }));
      
      setTestimonials(formattedReviews);
      setError(null);
    } catch (error) {
      console.error('Error loading reviews:', error);
      setError(error instanceof Error ? error.message : 'Failed to load reviews');
      // Don't clear existing testimonials on error
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (id: number | string) => {
    const newExpanded = new Set(expandedTestimonials);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedTestimonials(newExpanded);
  };

  const truncateText = (text: string, maxLength: number = 150) => {
    if (!text || text.length <= maxLength) return text || '';
    return text.substring(0, maxLength).trim() + '...';
  };

  // Only show actual reviews from the database
  const displayTestimonials = testimonials;
  
  // Debug logging
  console.log('Current testimonials state:', testimonials);
  console.log('Display testimonials length:', displayTestimonials.length);
  console.log('Loading state:', loading);

  const stats = [
    { number: "35+", label: "Years Experience" },
    { number: "5★", label: "Average Rating" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-celestial">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6">
              What My Clients Say
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Real experiences from people who have found comfort, guidance, and healing 
              through spiritual connection in Oxford and throughout Oxfordshire.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* All Testimonials */}
      <section className="py-20 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-12">
            <h2 className="text-3xl font-serif font-bold text-foreground mb-4 sm:mb-0">
              Client Reviews
            </h2>
            <Button 
              onClick={() => {
                if (user) {
                  navigate('/add-review');
                } else {
                  navigate('/auth?redirect=/add-review');
                }
              }}
              className="bg-gradient-mystical hover:opacity-90 text-primary-foreground"
            >
              <Star className="w-4 h-4 mr-2" />
              Add Review
            </Button>
          </div>
          
          {error && (
            <Card className="mb-8 border-red-200 bg-red-50 dark:bg-red-900/10">
              <CardContent className="pt-6">
                <p className="text-red-600 dark:text-red-400">{error}</p>
              </CardContent>
            </Card>
          )}

          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((n) => (
                <Card key={n} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                    <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : displayTestimonials.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {displayTestimonials.map((testimonial) => (
                <Card key={testimonial.id} className="hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-6">
                    <Quote className="w-8 h-8 text-purple-500 mb-4" />
                    <blockquote className="mb-4">
                      {expandedTestimonials.has(testimonial.id) ? 
                        testimonial.text :
                        truncateText(testimonial.text || '')}
                      {testimonial.text && testimonial.text.length > 150 && (
                        <button
                          onClick={() => toggleExpanded(testimonial.id)}
                          className="ml-2 text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 font-medium text-sm"
                        >
                          {expandedTestimonials.has(testimonial.id) ? 'Read less' : 'Read more'}
                        </button>
                      )}
                    </blockquote>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{testimonial.name}</p>
                        {testimonial.location && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {testimonial.location}
                          </p>
                        )}
                        {testimonial.service && (
                          <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                            {testimonial.service}
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-1">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-center">
                <Star className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No Reviews Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Be the first to share your experience with Elizabeth Carol's spiritual services.
                </p>
                <Button 
                  onClick={() => {
                    if (user) {
                      navigate('/add-review');
                    } else {
                      navigate('/auth?redirect=/add-review');
                    }
                  }}
                  className="bg-gradient-mystical hover:opacity-90 text-primary-foreground"
                >
                  <Star className="w-4 h-4 mr-2" />
                  Write the First Review
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-card/50 rounded-lg p-12 text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-serif font-bold text-foreground mb-6">
              Ready to Experience Spiritual Guidance?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join the hundreds of people in Oxford who have found comfort, clarity, and connection 
              through professional psychic and mediumship readings.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact">
                <Button size="lg" className="bg-gradient-mystical hover:opacity-90 text-primary-foreground">
                  Book Your Reading
                </Button>
              </Link>
              <a href="tel:01865361786">
                <Button size="lg" variant="outline">
                  Call 01865 361 786
                </Button>
              </a>
            </div>
            <p className="text-sm text-muted-foreground mt-6">
              All readings are completely confidential and conducted with the utmost respect and care.
            </p>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h3 className="text-2xl font-serif font-bold text-foreground mb-8">
              Why Choose Elizabeth Carol?
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-mystical flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-primary-foreground" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">Proven Experience</h4>
                <p className="text-muted-foreground text-sm">
                  35+ years of dedicated spiritual practice with consistent, accurate results
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-golden flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-accent-foreground" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">Compassionate Care</h4>
                <p className="text-muted-foreground text-sm">
                  Every reading is delivered with empathy, understanding, and genuine concern
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-mystical flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-primary-foreground" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">Local & Trusted</h4>
                <p className="text-muted-foreground text-sm">
                  Based in Oxford, serving the local community with integrity and professionalism
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Testimonials;
