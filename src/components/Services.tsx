import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Phone, Home, Presentation, Clock, Star } from "lucide-react";

const Services = () => {
  const services = [
    {
      icon: Star,
      title: "One-to-One Readings",
      description: "Personal spiritual guidance sessions in a comfortable, confidential setting. Connect with loved ones who have passed and receive insight into your life's path.",
      duration: "60 minutes",
      price: "£70",
      features: ["Mediumship", "Clairvoyant guidance", "Tarot reading", "Spirit communication"],
      popular: true
    },
    {
      icon: Phone,
      title: "Telephone & Video Readings",
      description: "Distance is no barrier to spiritual connection. Receive the same quality guidance from the comfort of your own home via phone or video call.",
      duration: "60 minutes", 
      price: "£70",
      features: ["Remote sessions", "Flexible timing", "Recording available", "Same spiritual connection"]
    },
    {
      icon: Home,
      title: "Home Psychic Evenings",
      description: "Host an intimate psychic evening in your own home. Elizabeth will provide readings for you and your guests in a relaxed, familiar environment.",
      duration: "3-4 hours",
      price: "From £300",
      features: ["In your home", "Multiple readings", "Social atmosphere", "Memorable experience"]
    }
  ];

  return (
    <section className="py-24 bg-background" id="services">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <Card 
                key={index} 
                className={`relative group hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 ${
                  service.popular ? 'border-primary' : ''
                }`}
              >
                {service.popular && (
                  <Badge className="absolute -top-3 left-6 bg-gradient-mystical text-primary-foreground">
                    Most Popular
                  </Badge>
                )}
                
                <CardHeader className="space-y-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-mystical flex items-center justify-center mx-auto group-hover:animate-glow">
                    <Icon className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <div className="text-center">
                    <CardTitle className="text-xl font-serif mb-2">{service.title}</CardTitle>
                    <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{service.duration}</span>
                      </div>
                      <span className="font-semibold bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs">
                        {service.price}
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <CardDescription className="text-center leading-relaxed">
                    {service.description}
                  </CardDescription>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-foreground">Includes:</h4>
                    <ul className="space-y-1">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link to={service.title === "Home Psychic Evenings" ? "/contact" : "/book"} className="mt-6 block">
                    <Button 
                      className="w-full bg-gradient-mystical hover:opacity-90 text-primary-foreground"
                      size="sm"
                    >
                      Book This Service
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;