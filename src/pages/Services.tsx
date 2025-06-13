import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import Services from "@/components/Services";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, Clock, MapPin, Heart, Star, Users } from "lucide-react";
import { getPageSEO } from "@/utils/seo";

const ServicesPage = () => {
  const seoData = getPageSEO('services');

  const faqs = [
    {
      question: "How long does a reading take?",
      answer: "Both one-to-one and telephone/video readings are 60 minutes. Home psychic evenings typically last 3-4 hours depending on the number of participants."
    },
    {
      question: "Do I need to prepare anything for my reading?",
      answer: "Simply come with an open mind and heart. You may want to think of questions you'd like to ask, but it's not necessary. Spirit often brings through the messages you need to hear most."
    },
    {
      question: "Can you guarantee specific messages will come through?",
      answer: "While I cannot guarantee specific spirits will communicate, I always work with love and integrity to bring through whatever messages are meant for you. Each reading is unique and sacred."
    },
    {
      question: "Do you travel for home psychic evenings?",
      answer: "I travel throughout Oxford, Oxfordshire, and surrounding areas for home psychic evenings and multiple bookings only. For one-to-one readings, clients visit me at my location. Travel costs may apply depending on distance for group events."
    },
    {
      question: "How do telephone and video readings work?",
      answer: "Spiritual energy isn't limited by distance. I connect just as effectively over the phone or video call. All you need is a quiet, comfortable space where you can speak freely."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO {...seoData} />
      <Navigation />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-celestial">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6">
              Psychic & Mediumship Services
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Discover the perfect spiritual service for your needs. From intimate one-to-one readings 
              to group experiences and educational workshops - all delivered with 35+ years of expertise.
            </p>
          </div>
        </div>
      </section>

      {/* Services Component */}
      <Services />

      {/* Booking Process */}
      <section className="py-20 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-serif font-bold text-foreground mb-12 text-center">
              How to Book Your Reading
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="text-center p-6">
                <CardHeader className="pb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-mystical flex items-center justify-center mx-auto mb-4">
                    <Phone className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-xl">1. Get in Touch</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    <a href="tel:01865361786" className="text-primary hover:underline">Call 01865 361 786</a> or use the contact form to discuss your needs and preferred service type.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center p-6">
                <CardHeader className="pb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-golden flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-accent-foreground" />
                  </div>
                  <CardTitle className="text-xl">2. Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    We'll find a convenient time that works for you, including evenings and weekends if needed.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center p-6">
                <CardHeader className="pb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-mystical flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-xl">3. Connect</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Arrive with an open heart and mind, ready to receive the spiritual guidance meant for you.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-serif font-bold text-foreground mb-12 text-center">
              Frequently Asked Questions
            </h2>
            
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{faq.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <p className="text-muted-foreground mb-6">
                Have another question? I'm happy to discuss your specific needs and answer any concerns.
              </p>
              <a href="tel:01865361786">
                <Button className="bg-gradient-mystical hover:opacity-90 text-primary-foreground">
                  <Phone className="w-4 h-4 mr-2" />
                  Ask Elizabeth - 01865 361 786
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Location & Coverage */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-serif font-bold text-foreground mb-12 text-center">
              Areas Covered in Oxfordshire
            </h2>
            
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-4">Areas Covered</h3>
                <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>Oxford</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>Witney</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>Bicester</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>Didcot</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>Abingdon</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>Banbury</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>Thame</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>Carterton</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  Plus surrounding villages and towns throughout Oxfordshire. 
                  Travel charges may apply for distances over 15 miles from Oxford.
                </p>
              </div>
              
              <div className="space-y-6">
                <Card className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-mystical flex items-center justify-center">
                      <Users className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">In-Person Readings</h4>
                      <p className="text-sm text-muted-foreground">
                        Available throughout Oxfordshire in comfortable, private settings
                      </p>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-golden flex items-center justify-center">
                      <Phone className="w-6 h-6 text-accent-foreground" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">Remote Readings</h4>
                      <p className="text-sm text-muted-foreground">
                        Telephone and video readings available anywhere in the UK and internationally
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ServicesPage;