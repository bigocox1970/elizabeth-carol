import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Star, Phone, MapPin, Clock } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img 
          src="/lovable-uploads/14b96c91-4d91-47b9-bd58-29f5b3a27505.png" 
          alt="Tarot reading table with crystal ball"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-primary/80"></div>
        <div className="absolute inset-0 bg-gradient-celestial/50"></div>
      </div>
      
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-accent/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Hero Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-accent">
                <Star className="w-5 h-5" />
                <span className="text-sm font-medium">Oxford's Trusted Psychic Medium</span>
                <Star className="w-5 h-5" />
              </div>
              
              <h1 className="text-4xl md:text-6xl font-serif font-bold text-foreground leading-tight">
                Elizabeth Carol
                <span className="block text-3xl md:text-4xl text-primary mt-2">
                  Clairvoyant & Psychic Medium
                </span>
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-xl">
                With over 35 years of spiritual guidance experience, I provide compassionate and insightful 
                psychic readings to help illuminate your path forward in Oxford and beyond.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-gradient-mystical hover:opacity-90 text-primary-foreground font-medium"
              >
                Book Your Reading
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                <Phone className="w-4 h-4 mr-2" />
                Call 01865 361 786
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">35+</div>
                <div className="text-sm text-muted-foreground">Years Experience</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">1000+</div>
                <div className="text-sm text-muted-foreground">Happy Clients</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">5★</div>
                <div className="text-sm text-muted-foreground">Client Reviews</div>
              </div>
            </div>
          </div>

          {/* Service Cards */}
          <div className="space-y-6">
            <Card className="p-6 bg-card/80 backdrop-blur border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-full bg-gradient-mystical flex items-center justify-center shrink-0">
                  <Star className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-card-foreground">Personal Readings</h3>
                  <p className="text-muted-foreground mt-1">
                    One-to-one spiritual guidance sessions tailored to your unique journey and questions.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-card/80 backdrop-blur border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-full bg-gradient-golden flex items-center justify-center shrink-0">
                  <MapPin className="w-6 h-6 text-accent-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-card-foreground">Oxford Based</h3>
                  <p className="text-muted-foreground mt-1">
                    Serving Oxford, Oxfordshire and surrounding areas with in-person and remote readings.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-card/80 backdrop-blur border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-full bg-gradient-mystical flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-card-foreground">Flexible Appointments</h3>
                  <p className="text-muted-foreground mt-1">
                    Evening and weekend sessions available, plus telephone and video consultations.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;