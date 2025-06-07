import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Quote, Phone, MapPin, Heart, Users, Award } from "lucide-react";

const Index = () => {
  // Quick testimonials for homepage
  const quickTestimonials = [
    {
      text: "Elizabeth's reading brought me such comfort after losing my mother. Her accuracy was incredible.",
      name: "Sarah M.",
      location: "Oxford"
    },
    {
      text: "35 years of experience really shows. Elizabeth's guidance has been invaluable to my family.",
      name: "James R.",
      location: "Witney"
    },
    {
      text: "The home psychic evening was amazing! All my friends were blown away by the accuracy.",
      name: "Margaret T.",
      location: "Bicester"
    }
  ];

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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      <Services />
      
      {/* Quick Testimonials */}
      <section className="py-20 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge className="mb-4 bg-gradient-mystical text-primary-foreground">
              Client Experiences
            </Badge>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
              What People Say About Elizabeth
            </h2>
            <p className="text-xl text-muted-foreground">
              Real experiences from clients throughout Oxford and Oxfordshire who have found 
              comfort, clarity, and healing through spiritual guidance.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {quickTestimonials.map((testimonial, index) => (
              <Card key={index} className="p-6 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300">
                <CardContent className="p-0">
                  <Quote className="w-6 h-6 text-primary mb-4" />
                  <blockquote className="text-muted-foreground leading-relaxed mb-4">
                    "{testimonial.text}"
                  </blockquote>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-foreground">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground flex items-center space-x-1">
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
            ))}
          </div>

          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Read More Testimonials
            </Button>
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
            
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-2">Oxford Based</div>
                <div className="text-muted-foreground">Serving the local community</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-2">35+ Years</div>
                <div className="text-muted-foreground">Professional experience</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-2">1000+</div>
                <div className="text-muted-foreground">Satisfied clients</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-mystical hover:opacity-90 text-primary-foreground">
                <Phone className="w-4 h-4 mr-2" />
                Call 01865 361 786
              </Button>
              <Button size="lg" variant="outline">
                Book Your Reading
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
