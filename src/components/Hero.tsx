import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Star, Phone, MapPin, Clock } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden py-20 lg:py-0">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/cards-1.jpg')",
        }}
      />
      
      {/* Much Darker Overlay - lighter on mobile, darker on desktop */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/75 via-black/70 to-black/75 md:from-black/95 md:via-black/92 md:to-black/95" />

      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gold/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Hero Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-gray-300">
                <Star className="w-5 h-5" />
                <span className="text-sm font-medium">Oxford's Trusted Psychic Medium</span>
                <Star className="w-5 h-5" />
              </div>
              
              <h1 className="text-4xl md:text-6xl font-serif font-bold text-white leading-tight">
                Elizabeth Carol
                <span className="block text-3xl md:text-4xl text-purple-900 mt-2">
                  Clairvoyant & Psychic Medium
                </span>
              </h1>
              
              <p className="text-xl text-gray-200 max-w-xl">
                With over 35 years of spiritual guidance experience, I provide compassionate and insightful 
                psychic readings to help illuminate your path forward in Oxford and beyond.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-purple-900 to-black hover:from-black hover:to-gray-900 text-white font-medium shadow-lg"
              >
                Book Your Reading
              </Button>
              <a href="tel:01865361786">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-gray-400 text-gray-300 hover:bg-gray-300 hover:text-black bg-black/50 backdrop-blur-sm"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call 01865 361 786
                </Button>
              </a>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-6 pt-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-200">35+</div>
                <div className="text-sm text-gray-300">Years Experience</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-200">5★</div>
                <div className="text-sm text-gray-300">Client Reviews</div>
              </div>
            </div>
          </div>

          {/* Service Cards */}
          <div className="space-y-6">
            <Card className="p-6 bg-black/60 backdrop-blur-md border-purple-900/50 hover:border-amber-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-900 to-black flex items-center justify-center shrink-0">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-white">Personal Readings</h3>
                  <p className="text-gray-300 mt-1">
                    One-to-one spiritual guidance sessions tailored to your unique journey and questions.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-black/60 backdrop-blur-md border-purple-900/50 hover:border-gray-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-gray-600 to-gray-700 flex items-center justify-center shrink-0">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-white">Oxford Based</h3>
                  <p className="text-gray-300 mt-1">
                    Serving Oxford, Oxfordshire and surrounding areas with in-person and remote readings.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-black/60 backdrop-blur-md border-purple-900/50 hover:border-amber-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-900 to-black flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-white">Flexible Appointments</h3>
                  <p className="text-gray-300 mt-1">
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