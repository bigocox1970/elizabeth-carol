import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import NewsletterSignup from "@/components/NewsletterSignup";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, MapPin, Clock, MessageCircle, Star, Check, AlertCircle, Loader2 } from "lucide-react";

const Contact = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    service: '',
    message: ''
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const validateEmail = (email: string) => {
    return email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
    // Clear error message when user starts typing
    if (errorMessage) {
      setErrorMessage('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation
    if (!formData.firstName.trim()) {
      setErrorMessage('Please enter your first name.');
      return;
    }

    if (!formData.lastName.trim()) {
      setErrorMessage('Please enter your last name.');
      return;
    }

    if (!formData.email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    if (!validateEmail(formData.email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!formData.message.trim()) {
      setErrorMessage('Please enter your message.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // Create form data for Netlify Forms
      const formDataToSubmit = new FormData();
      formDataToSubmit.append('form-name', 'contact-form');
      formDataToSubmit.append('firstName', formData.firstName.trim());
      formDataToSubmit.append('lastName', formData.lastName.trim());
      formDataToSubmit.append('email', formData.email.trim());
      formDataToSubmit.append('phone', formData.phone.trim());
      formDataToSubmit.append('service', formData.service);
      formDataToSubmit.append('message', formData.message.trim());

      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams([...formDataToSubmit] as [string, string][]).toString()
      });

      if (response.ok) {
        setShowSuccess(true);
        // Scroll to success message
        setTimeout(() => {
          document.getElementById('success-message')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        // Handle different error responses
        if (response.status === 400) {
          setErrorMessage('Please check your information and try again.');
        } else if (response.status >= 500) {
          setErrorMessage('Server error. Please try again in a moment.');
        } else {
          setErrorMessage('Failed to send message. Please try again.');
        }
      }
    } catch (error) {
      console.error('Contact form error:', error);
      setErrorMessage('Connection error. Please check your internet connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-celestial">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
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
                {!showSuccess ? (
                  <form 
                    onSubmit={handleSubmit} 
                    className="space-y-6"
                    name="contact-form"
                    method="POST"
                    data-netlify="true"
                    netlify-honeypot="bot-field"
                  >
                    {/* Hidden form name for Netlify */}
                    <input type="hidden" name="form-name" value="contact-form" />
                    
                    {/* Honeypot field */}
                    <div style={{ display: 'none' }}>
                      <label>
                        Don't fill this out if you're human: <input name="bot-field" />
                      </label>
                    </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                        <Input 
                          id="firstName" 
                          name="firstName"
                          placeholder="Your first name" 
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required 
                          disabled={isSubmitting}
                        />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                        <Input 
                          id="lastName" 
                          name="lastName"
                          placeholder="Your last name" 
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required 
                          disabled={isSubmitting}
                        />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                      <Input 
                        id="email" 
                        name="email"
                        type="email" 
                        placeholder="your@email.com" 
                        value={formData.email}
                        onChange={handleInputChange}
                        required 
                        disabled={isSubmitting}
                      />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                      <Input 
                        id="phone" 
                        name="phone"
                        type="tel" 
                        placeholder="Your phone number" 
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                      />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="service">Service Interest</Label>
                  <select 
                    id="service" 
                        name="service"
                    className="w-full px-3 py-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
                        value={formData.service}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                  >
                    <option value="">Select a service</option>
                        <option value="One-to-One Reading">One-to-One Reading</option>
                        <option value="Group Reading">Group Reading</option>
                        <option value="Telephone/Video Reading">Telephone/Video Reading</option>
                        <option value="Home Psychic Evening">Home Psychic Evening</option>
                        <option value="Talk/Workshop">Talk/Workshop</option>
                        <option value="General Inquiry">General Inquiry</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea 
                    id="message" 
                        name="message"
                    placeholder="Tell me about what you're looking for or any questions you have..."
                    rows={4}
                        value={formData.message}
                        onChange={handleInputChange}
                    required 
                    disabled={isSubmitting}
                  />
                </div>
                
                    <Button 
                      type="submit" 
                      disabled={isSubmitting || !formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || !formData.message.trim()}
                      className="w-full bg-gradient-to-r from-purple-900 to-black hover:from-black hover:to-gray-900 text-white font-medium shadow-lg disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        'Send Message'
                      )}
                </Button>
                    
                    {errorMessage && (
                      <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
                        <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-600">{errorMessage}</p>
                      </div>
                    )}
                
                <p className="text-sm text-muted-foreground text-center">
                  I typically respond within 24 hours. For urgent matters, please call directly.
                </p>
                  </form>
                ) : (
                  <div id="success-message" className="text-center space-y-6">
                    <div className="flex justify-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                        <Check className="w-8 h-8 text-green-600" />
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        Thank you, {formData.firstName}!
                      </h3>
                      <p className="text-muted-foreground">
                        Your message has been sent successfully to Elizabeth. She will get back to you as soon as possible, usually within 24 hours.
                      </p>
                    </div>

                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-600">
                        <strong>Message delivered!</strong><br/>
                        Check your email for a confirmation if you provided one.
                      </p>
                    </div>

                    <Button 
                      onClick={() => {
                        setShowSuccess(false);
                        setFormData({
                          firstName: '',
                          lastName: '',
                          email: '',
                          phone: '',
                          service: '',
                          message: ''
                        });
                      }}
                      variant="ghost"
                      className="text-primary"
                    >
                      Send Another Message
                    </Button>
                  </div>
                )}
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



              {/* Newsletter Signup */}
              <div className="mt-8">
                <NewsletterSignup />
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;