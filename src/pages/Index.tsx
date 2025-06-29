import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Quote, Phone, MapPin, Heart, Users, Award } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { getApiUrl } from "@/utils/api";
import { getPageSEO } from "@/utils/seo";
import SocialShare from "@/components/SocialShare";

interface Testimonial {
  id: number | string;
  name: string;
  location?: string;
  text?: string;
  comment?: string;
  content?: string;
  rating: number;
  service?: string;
  createdAt?: string;
}

const Index = () => {
  const [quickTestimonials, setQuickTestimonials] = useState<Testimonial[]>([]);
  const [expandedTestimonials, setExpandedTestimonials] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadFeaturedReviews();
  }, []);

  const loadFeaturedReviews = async () => {
    try {
      const response = await fetch(getApiUrl('manage-reviews'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'get-approved-reviews' }),
      });

      if (!response.ok) {
        throw new Error(`Failed to load reviews: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.reviews && data.reviews.length > 0) {
        const formattedReviews = data.reviews
          .slice(0, 3) // Only take the first 3 reviews
          .map(review => ({
            id: review.id,
            name: review.name,
            location: review.location,
            text: review.comment || review.content,
            rating: review.rating,
            service: review.service,
            createdAt: review.createdAt
          }));
        setQuickTestimonials(formattedReviews);
      }
    } catch (error) {
      console.error('Failed to load featured reviews:', error);
      // Don't show any reviews if database fails - better than fake ones
      setQuickTestimonials([]);
    }
  };

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedTestimonials);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedTestimonials(newExpanded);
  };

  const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  const reasons = [
    {
      icon: Award,
      title: "35+ Years Experience",
      description: "Decades of dedicated spiritual practice serving Oxford and Oxfordshire with consistently accurate results."
    },
    {
      icon: Heart,
      title: "Compassionate Care",
      description: "Every reading delivered with genuine empathy, understanding, and respect for your spiritual journey."
    },
    {
      icon: Star,
      title: "Welsh Heritage",
      description: "Born in Ebbw Vale, Wales, bringing authentic Celtic spiritual wisdom to modern psychic practice."
    },
    {
      icon: Users,
      title: "Trusted Locally",
      description: "Serving the Oxford community with integrity, building lasting relationships through spiritual guidance."
    }
  ];

  const seoData = getPageSEO('home');

  return (
    <div className="min-h-screen bg-background">
      <SEO {...seoData} />
      <Navigation />
      <Hero />
      <Services />
      
      {/* Quick Testimonials */}
      <section className="relative py-20 overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/images/floor.jpg')",
          }}
        />
        
        {/* Dark Overlay - lighter on mobile, darker on desktop */}
        <div className="absolute inset-0 testimonials-overlay" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16 bg-white/70 dark:bg-black/70 p-8 rounded-lg backdrop-blur-sm">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 dark:text-white mb-4">
              What People Say About Elizabeth
            </h2>
            <p className="text-xl text-gray-700 dark:text-gray-200">
              Real experiences from clients throughout Oxford and Oxfordshire who have found 
              comfort, clarity, and healing through spiritual guidance.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {quickTestimonials.map((testimonial, index) => {
              const isExpanded = expandedTestimonials.has(index);
              const shouldTruncate = testimonial.text && testimonial.text.length > 150;
              const displayText = shouldTruncate && !isExpanded 
                ? truncateText(testimonial.text, 150)
                : testimonial.text;

              return (
                <Card key={index} className="p-6 bg-white/65 dark:bg-black/60 backdrop-blur-md border-gray-300 dark:border-purple-900/50 hover:border-gray-500 dark:hover:border-gray-400/50 hover:shadow-lg hover:shadow-gray-500/20 dark:hover:shadow-purple-500/20 transition-all duration-300">
                  <CardContent className="p-0">
                    <Quote className="w-6 h-6 text-gray-600 dark:text-gray-400 mb-4" />
                    <blockquote className="text-gray-800 dark:text-gray-200 leading-relaxed mb-4">
                      "{displayText}"
                      {shouldTruncate && (
                        <button
                          onClick={() => toggleExpanded(index)}
                          className="ml-2 text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 font-medium text-sm underline transition-colors"
                        >
                          {isExpanded ? 'Read less' : 'Read more'}
                        </button>
                      )}
                    </blockquote>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-300 flex items-center space-x-1">
                          <MapPin className="w-3 h-3" />
                          <span>{testimonial.location}</span>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <Link to="/testimonials">
              <Button 
                variant="outline" 
                size="lg"
                className="border-gray-600 dark:border-gray-400 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-300 hover:text-black dark:hover:text-black bg-white/50 dark:bg-black/50 backdrop-blur-sm"
                onClick={() => window.scrollTo(0, 0)}
              >
              Read More Reviews
            </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Elizabeth */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
              Why Choose Elizabeth Carol?
            </h2>
            <p className="text-xl text-muted-foreground">
              Over three decades of spiritual practice has created a foundation of trust, 
              accuracy, and compassionate guidance that clients return to again and again.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {reasons.map((reason, index) => {
              const Icon = reason.icon;
              return (
                <Card key={index} className="text-center p-6 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-mystical flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <CardTitle className="text-lg">{reason.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="leading-relaxed">
                      {reason.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Local SEO Section */}
      <section className="py-20 bg-gradient-celestial">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-6">
              Oxford's Trusted Psychic Medium
            </h2>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Serving Oxford, Oxfordshire, and surrounding areas with professional clairvoyant and 
              psychic medium services. Whether you're seeking mediumship, tarot readings, or spiritual 
              guidance, Elizabeth Carol brings over 35 years of experience to help illuminate your path.
            </p>
            
            <div className="grid md:grid-cols-2 gap-8 mb-12 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-2">Oxford Based</div>
                <div className="text-muted-foreground">Serving the local community</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-2">35+ Years</div>
                <div className="text-muted-foreground">Professional experience</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="tel:01865361786">
                <Button size="lg" className="bg-gradient-mystical hover:opacity-90 text-primary-foreground">
                  <Phone className="w-4 h-4 mr-2" />
                  Call 01865 361 786
                </Button>
              </a>
              <Link to="/book">
                <Button size="lg" variant="outline">
                  Book Your Reading
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Social Share Section */}
      <section className="py-16 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-4">
              Share Elizabeth's Spiritual Services
            </h2>
            <p className="text-muted-foreground mb-8">
              Help others discover healing and guidance by sharing Elizabeth's services with friends and family.
            </p>
            
            <SocialShare 
              url={window.location.href}
              title="Elizabeth Carol - Oxford's Trusted Psychic Medium & Clairvoyant"
              excerpt="35+ years of spiritual guidance in Oxford. Psychic readings, mediumship, tarot, and healing services. Book your reading with Elizabeth Carol today."
              variant="default"
              size="lg"
              className="justify-center"
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
