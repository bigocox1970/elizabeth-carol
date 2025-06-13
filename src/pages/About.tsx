import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Star, Users, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { getPageSEO } from "@/utils/seo";

const About = () => {
  const seoData = getPageSEO('about');

  return (
    <div className="min-h-screen bg-background">
      <SEO {...seoData} />
      <Navigation />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-celestial">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6">
              35+ Years of Spiritual Guidance
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              From my Welsh roots in Ebbw Vale to serving the Oxford community, 
              I've dedicated my life to helping others connect with their spiritual path and loved ones.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Story */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-serif font-bold text-foreground mb-6">My Spiritual Journey</h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    Born Carol Elizabeth Watts in the beautiful valleys of Ebbw Vale, Wales, 
                    my connection to the spiritual world began in childhood. Growing up surrounded by 
                    the mystical Welsh landscape, I experienced my first spiritual encounter at the age of seven.
                  </p>
                  <p>
                    Over the past 35 years, I've honed my abilities as a clairvoyant and psychic medium, 
                    helping thousands of people in Oxford, Oxfordshire, and beyond. My Welsh heritage 
                    has deeply influenced my approach to spiritual work, bringing warmth, compassion, 
                    and authenticity to every reading.
                  </p>
                  <p>
                    Whether you're seeking closure through mediumship, guidance on life's challenges, 
                    or simply curious about your spiritual path, I'm here to help illuminate your journey 
                    with honesty and care.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-serif font-bold text-foreground mb-4">My Approach</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Every reading is unique, just like every person who comes to see me. I believe in creating 
                  a safe, comfortable environment where spirit can communicate freely. My sessions combine 
                  mediumship, clairvoyance, and intuitive guidance to provide you with the insights you need.
                </p>
              </div>
            </div>

            {/* Experience Cards */}
            <div className="space-y-6">
              <Card className="p-6 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300">
                <CardContent className="p-0">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-mystical flex items-center justify-center shrink-0">
                      <Star className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg text-foreground mb-2">35+ Years Experience</h4>
                      <p className="text-muted-foreground">
                        Decades of dedicated spiritual practice and thousands of readings across the UK.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="p-6 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300">
                <CardContent className="p-0">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-golden flex items-center justify-center shrink-0">
                      <MapPin className="w-6 h-6 text-accent-foreground" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg text-foreground mb-2">Welsh Heritage</h4>
                      <p className="text-muted-foreground">
                        Born in Ebbw Vale, Wales, bringing Celtic spiritual wisdom to my practice.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="p-6 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300">
                <CardContent className="p-0">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-mystical flex items-center justify-center shrink-0">
                      <Users className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg text-foreground mb-2">Trusted by Thousands</h4>
                      <p className="text-muted-foreground">
                        A loyal following of clients who return for guidance and recommend my services.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="p-6 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300">
                <CardContent className="p-0">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-golden flex items-center justify-center shrink-0">
                      <Heart className="w-6 h-6 text-accent-foreground" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg text-foreground mb-2">Compassionate Care</h4>
                      <p className="text-muted-foreground">
                        Every reading is delivered with empathy, understanding, and genuine care.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Specialties */}
      <section className="py-20 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-serif font-bold text-center text-foreground mb-12">
              My Spiritual Specialties
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-foreground mb-3">Mediumship</h3>
                <p className="text-muted-foreground">
                  Connecting you with loved ones who have passed, bringing comfort, closure, and healing messages.
                </p>
              </div>
              
              <div className="text-center">
                <h3 className="text-xl font-semibold text-foreground mb-3">Clairvoyance</h3>
                <p className="text-muted-foreground">
                  Clear spiritual sight to help guide you through life's challenges and opportunities.
                </p>
              </div>
              
              <div className="text-center">
                <h3 className="text-xl font-semibold text-foreground mb-3">Tarot Reading</h3>
                <p className="text-muted-foreground">
                  Traditional tarot wisdom combined with intuitive insight for comprehensive guidance.
                </p>
              </div>
              
              <div className="text-center">
                <h3 className="text-xl font-semibold text-foreground mb-3">Spiritual Counseling</h3>
                <p className="text-muted-foreground">
                  Supportive guidance for spiritual development and understanding your life's purpose.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-card/50 rounded-lg p-12 text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-serif font-bold text-foreground mb-6">
              Ready to Connect?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              I'd be honored to help you on your spiritual journey. Every reading is a sacred space 
              where healing and insight can flourish.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="tel:01865361786">
                <Button size="lg" className="bg-gradient-mystical hover:opacity-90 text-primary-foreground">
                  <Phone className="w-4 h-4 mr-2" />
                  Call 01865 361 786
                </Button>
              </a>
              <Link to="/contact">
                <Button size="lg" variant="outline">
                  Book Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;