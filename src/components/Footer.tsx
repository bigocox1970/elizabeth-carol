import { Link } from "react-router-dom";
import { Star, Phone, Mail, MapPin, Clock } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-secondary/30 border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <img 
                src="/images/elizabeth-carol-logo-icon-trans.png" 
                alt="Elizabeth Carol Logo" 
                className="h-8 w-8"
              />
              <div className="flex flex-col">
                <span className="font-serif text-xl font-bold text-foreground tracking-wider">Elizabeth Carol</span>
                <span className="text-sm text-muted-foreground">Clairvoyant & Psychic Medium</span>
              </div>
            </div>
            <p className="text-muted-foreground">
              Over 35 years of spiritual guidance experience serving Oxford, Oxfordshire and beyond. 
              Welsh heritage, professional service, compassionate insight.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Quick Links</h3>
            <nav className="flex flex-col space-y-2">
              <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                Home
              </Link>
              <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">
                About Elizabeth
              </Link>
              <Link to="/services" className="text-muted-foreground hover:text-primary transition-colors">
                Services
              </Link>
                              <Link to="/testimonials" className="text-muted-foreground hover:text-primary transition-colors">
                  Reviews
                </Link>
              <Link to="/blog" className="text-muted-foreground hover:text-primary transition-colors">
                Blog
              </Link>
              <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                Contact
              </Link>
            </nav>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Services</h3>
            <nav className="flex flex-col space-y-2">
              <Link to="/services" className="text-muted-foreground hover:text-primary transition-colors">
                One-to-One Readings
              </Link>
              <Link to="/services" className="text-muted-foreground hover:text-primary transition-colors">
                Telephone/Video Sessions
              </Link>
              <Link to="/services" className="text-muted-foreground hover:text-primary transition-colors">
                Home Psychic Evenings
              </Link>
              <Link to="/services" className="text-muted-foreground hover:text-primary transition-colors">
                View All Services
              </Link>
              <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                Book a Reading
              </Link>
            </nav>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Contact Information</h3>
            <div className="space-y-3">
              <a 
                href="tel:01865361786" 
                className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>01865 361 786</span>
              </a>
              
              <div className="flex items-center space-x-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>Oxford, Oxfordshire</span>
              </div>
              
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>By Appointment</span>
              </div>
            </div>

            <div className="pt-4">
              <h4 className="font-medium text-foreground mb-2">Areas Covered</h4>
              <p className="text-sm text-muted-foreground">
                Oxford, Oxfordshire, Witney, Bicester, Didcot, Abingdon, Banbury, and surrounding areas
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-center md:text-left text-sm text-muted-foreground space-y-2 md:space-y-0">
              <div>© 2024 Elizabeth Carol. All rights reserved.</div>
              <div>
                Website Design by{" "}
                <a
                  href="https://diamondinternet.co.uk/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors underline"
                >
                  Diamond Internet
                </a>
              </div>
            </div>
            <div className="flex space-x-6 text-sm">
              <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;