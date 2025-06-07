import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, MapPin, Clock, MessageCircle, Star } from "lucide-react";

const Contact = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-celestial">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-gradient-mystical text-primary-foreground">
              Get In Touch
            </Badge>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6">
              Book Your Reading Today
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Ready to connect with spirit or seek guidance? I'm here to help. 
              Contact me to schedule your personal reading or discuss any questions you may have.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {/* Phone */}
            <Card className="text-center p-6 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300">
              <CardContent className="p-0">
                <div className="w-16 h-16 rounded-full bg-gradient-mystical flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Call Me</h3>
                <p className="text-muted-foreground mb-4">
                  The quickest way to book your reading or ask questions
                </p>
                <a 
                  href="tel:01865361786"
                  className="text-2xl font-bold text-primary hover:text-primary/80 transition-colors"
                >
                  01865 361 786
                </a>
              </CardContent>
            </Card>

            {/* Location */}
            <Card className="text-center p-6 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300">
              <CardContent className="p-0">
                <div className="w-16 h-16 rounded-full bg-gradient-golden flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-accent-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Location</h3>
                <p className="text-muted-foreground mb-4">
                  Serving Oxford and surrounding areas
                </p>
                <p className="text-lg font-semibold text-foreground">
                  Oxford, Oxfordshire
                </p>
              </CardContent>
            </Card>

            {/* Hours */}
            <Card className="text-center p-6 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300">
              <CardContent className="p-0">
                <div className="w-16 h-16 rounded-full bg-gradient-mystical flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Availability</h3>
                <p className="text-muted-foreground mb-4">
                  Flexible scheduling to suit your needs
                </p>
                <p className="text-lg font-semibold text-foreground">
                  By Appointment
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Evenings & weekends available
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form and Info */}
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  <span>Send a Message</span>
                </CardTitle>
                <CardDescription>
                  Fill out the form below and I'll get back to you as soon as possible.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input id="firstName" placeholder="Your first name" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input id="lastName" placeholder="Your last name" required />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input id="email" type="email" placeholder="your@email.com" required />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" placeholder="Your phone number" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="service">Service Interest</Label>
                  <select 
                    id="service" 
                    className="w-full px-3 py-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Select a service</option>
                    <option value="one-to-one">One-to-One Reading</option>
                    <option value="group">Group Reading</option>
                    <option value="phone">Telephone/Video Reading</option>
                    <option value="home-evening">Home Psychic Evening</option>
                    <option value="talk">Talk/Workshop</option>
                    <option value="general">General Inquiry</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea 
                    id="message" 
                    placeholder="Tell me about what you're looking for or any questions you have..."
                    rows={4}
                    required 
                  />
                </div>
                
                <Button className="w-full bg-gradient-mystical hover:opacity-90 text-primary-foreground">
                  Send Message
                </Button>
                
                <p className="text-sm text-muted-foreground text-center">
                  I typically respond within 24 hours. For urgent matters, please call directly.
                </p>
              </CardContent>
            </Card>

            {/* Additional Info */}
            <div className="space-y-8">
              {/* Service Areas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    <span>Areas I Serve</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <div>• Oxford</div>
                    <div>• Oxfordshire</div>
                    <div>• Witney</div>
                    <div>• Bicester</div>
                    <div>• Didcot</div>
                    <div>• Abingdon</div>
                    <div>• Banbury</div>
                    <div>• Thame</div>
                    <div>• Carterton</div>
                    <div>• Wantage</div>
                    <div>• Chipping Norton</div>
                    <div>• Surrounding areas</div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    I also offer telephone and video readings for clients anywhere in the UK and internationally.
                  </p>
                </CardContent>
              </Card>

              {/* What to Expect */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Star className="w-5 h-5 text-primary" />
                    <span>What to Expect</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    <strong className="text-foreground">Quick Response:</strong> I aim to respond to all inquiries within 24 hours.
                  </p>
                  <p>
                    <strong className="text-foreground">Friendly Discussion:</strong> We'll chat about your needs and find the right service for you.
                  </p>
                  <p>
                    <strong className="text-foreground">Flexible Scheduling:</strong> I work around your schedule, including evenings and weekends.
                  </p>
                  <p>
                    <strong className="text-foreground">Clear Pricing:</strong> All costs are discussed upfront with no hidden fees.
                  </p>
                </CardContent>
              </Card>

              {/* Emergency Contact */}
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-3">Need Immediate Guidance?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    For urgent spiritual guidance or crisis support, please call directly. 
                    I understand that sometimes you need immediate connection and comfort.
                  </p>
                  <Button 
                    size="sm" 
                    className="bg-gradient-mystical hover:opacity-90 text-primary-foreground"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Call Now: 01865 361 786
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;