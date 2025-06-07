import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Phone, Star } from "lucide-react";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About Elizabeth" },
    { href: "/services", label: "Services" },
    { href: "/testimonials", label: "Testimonials" },
    { href: "/blog", label: "Blog" },
    { href: "/contact", label: "Contact" },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Star className="h-8 w-8 text-primary animate-glow" />
            <div className="flex flex-col">
              <span className="font-serif text-xl font-bold text-foreground">Elizabeth Carol</span>
              <span className="text-xs text-muted-foreground">Clairvoyant & Psychic Medium</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive(item.href) ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Phone Number & CTA */}
          <div className="hidden md:flex items-center space-x-4">
            <a
              href="tel:01865361786"
              className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <Phone className="h-4 w-4" />
              <span>01865 361 786</span>
            </a>
            <Button size="sm" className="bg-gradient-mystical hover:opacity-90 text-primary-foreground">
              Book Reading
            </Button>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col space-y-4 mt-8">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`text-lg font-medium transition-colors hover:text-primary ${
                        isActive(item.href) ? "text-primary" : "text-foreground"
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                  <div className="pt-4 border-t border-border">
                    <a
                      href="tel:01865361786"
                      className="flex items-center space-x-2 text-lg text-muted-foreground hover:text-primary transition-colors mb-4"
                    >
                      <Phone className="h-5 w-5" />
                      <span>01865 361 786</span>
                    </a>
                    <Button className="w-full bg-gradient-mystical hover:opacity-90 text-primary-foreground">
                      Book Reading
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;