import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Quote, MapPin, Calendar, Heart, Loader2 } from "lucide-react";
import ReviewForm from "@/components/ReviewForm";

interface Testimonial {
  id: number | string;
  name: string;
  location?: string;
  date?: string;
  createdAt?: string;
  rating: number;
  service?: string;
  comment?: string;
  content?: string;
  featured?: boolean;
}

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      const response = await fetch('/.netlify/functions/manage-reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'get-approved-reviews' }),
      });

      if (response.ok) {
        const data = await response.json();
        setTestimonials(data.reviews || []);
      }
    } catch (error) {
      console.error('Failed to load reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fallback testimonials in case no reviews are in the database yet
  const fallbackTestimonials = [
    {
      id: 1,
      name: "Sarah M.",
      location: "Oxford",
      date: "December 2023",
      rating: 5,
      service: "One-to-One Reading",
      comment: "Elizabeth's reading was incredibly accurate and brought me such comfort. She connected with my late mother and shared details that only family would know. Her warmth and compassion made the experience truly healing.",
      featured: true
    },
    {
      id: 2,
      name: "James R.",
      location: "Witney",
      date: "November 2023",
      rating: 5,
      service: "Telephone Reading",
      comment: "Despite being over the phone, Elizabeth's connection was incredibly strong. She provided guidance about my career change that has proven to be spot on. I'm so grateful for her insights."
    },
    {
      id: 3,
      name: "Margaret T.",
      location: "Bicester",
      date: "October 2023",
      rating: 5,
      service: "Home Psychic Evening",
      comment: "Elizabeth hosted a wonderful evening for my birthday. All my friends were amazed by the accuracy of their readings. She created such a lovely atmosphere and everyone left feeling uplifted."
    }
  ];

  // Use fallback testimonials if no reviews are loaded from the database
  const displayTestimonials = testimonials.length > 0 ? testimonials : fallbackTestimonials;

  const stats = [
    { number: "100's", label: "Happy Clients" },
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
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
                const reviewSection = document.getElementById('review-form-section');
                reviewSection?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-gradient-mystical hover:opacity-90 text-primary-foreground"
            >
              <Star className="w-4 h-4 mr-2" />
              Add Review
            </Button>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground">Loading reviews...</p>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayTestimonials.map((testimonial) => (
                <Card key={testimonial.id} className={`p-6 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 ${testimonial.featured ? 'border-primary/50' : ''}`}>
                  <CardContent className="p-0">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex space-x-1">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <Badge variant={testimonial.featured ? "default" : "outline"} className="text-xs">
                        {testimonial.service || 'Reading'}
                      </Badge>
                    </div>
                    
                    <blockquote className="text-sm leading-relaxed text-muted-foreground mb-4">
                      "{testimonial.comment || testimonial.content}"
                    </blockquote>
                    
                    <div className="border-t border-border pt-4">
                      <div className="font-semibold text-foreground text-sm">{testimonial.name}</div>
                      <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                        {testimonial.location && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-3 h-3" />
                            <span>{testimonial.location}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {testimonial.date || 
                              (testimonial.createdAt ? 
                                new Date(testimonial.createdAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long'
                                }) : 'Recent')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Leave a Review Section */}
      <section id="review-form-section" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-serif font-bold text-foreground mb-12 text-center">
            Share Your Experience
          </h2>
          <div className="max-w-md mx-auto">
            <ReviewForm onSuccess={() => loadReviews()} />
          </div>
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
              <Button size="lg" className="bg-gradient-mystical hover:opacity-90 text-primary-foreground">
                Book Your Reading
              </Button>
              <Button size="lg" variant="outline">
                Call 01865 361 786
              </Button>
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
