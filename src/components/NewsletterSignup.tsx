import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Mail, Send, Check, Sparkles, Heart } from "lucide-react";

interface NewsletterSignupProps {
  variant?: 'default' | 'compact' | 'featured';
  className?: string;
}

const NewsletterSignup = ({ 
  variant = 'default',
  className = ""
}: NewsletterSignupProps) => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    try {
      // Here you would integrate with your newsletter service (Mailchimp, ConvertKit, etc.)
      // For now, we'll simulate the subscription
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsSubscribed(true);
      setMessage("Thank you for subscribing to Elizabeth's spiritual insights!");
      setEmail("");
      setName("");
    } catch (error) {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (variant === 'compact') {
    return (
      <div className={`bg-gradient-mystical p-6 rounded-lg text-center ${className}`}>
        <h3 className="text-xl font-serif font-bold text-primary-foreground mb-2">
          Spiritual Insights Newsletter
        </h3>
        <p className="text-primary-foreground/90 text-sm mb-4">
          Weekly guidance & spiritual wisdom from Elizabeth
        </p>
        
        {!isSubscribed ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            <Input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white/20 border-white/30 placeholder:text-white/70 text-white"
            />
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-white text-primary hover:bg-white/90"
            >
              {isSubmitting ? 'Subscribing...' : 'Subscribe'}
            </Button>
          </form>
        ) : (
          <div className="text-primary-foreground">
            <Check className="w-6 h-6 mx-auto mb-2" />
            <p className="text-sm">Welcome to our spiritual community!</p>
          </div>
        )}
      </div>
    );
  }

  if (variant === 'featured') {
    return (
      <Card className={`border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/10 ${className}`}>
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-mystical flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-serif">Spiritual Insights Newsletter</CardTitle>
          <p className="text-muted-foreground">
            Join thousands who receive Elizabeth's weekly spiritual guidance, meditation tips, 
            and exclusive insights delivered straight to your inbox.
          </p>
        </CardHeader>
        <CardContent>
          {!isSubscribed ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="newsletter-name">Name</Label>
                <Input
                  id="newsletter-name"
                  type="text"
                  placeholder="Your first name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="newsletter-email">Email *</Label>
                <Input
                  id="newsletter-email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-gradient-mystical hover:opacity-90 text-primary-foreground"
              >
                <Send className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Subscribing...' : 'Join Our Spiritual Community'}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                No spam, ever. Unsubscribe anytime with one click.
              </p>
            </form>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
                             <h3 className="text-xl font-semibold text-foreground mb-2">Welcome!</h3>
               <p className="text-muted-foreground mb-6">
                 Thank you for joining our spiritual community. You'll receive your first newsletter soon!
               </p>
            </div>
          )}

          {message && (
            <div className={`mt-4 p-3 rounded-md text-center ${
              message.includes('Thank you') 
                ? 'bg-green-50 text-green-600' 
                : 'bg-red-50 text-red-600'
            }`}>
              <p className="text-sm">{message}</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Default variant
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Mail className="w-5 h-5" />
          <span>Stay Connected</span>
        </CardTitle>
        <p className="text-muted-foreground">
          Receive weekly spiritual insights and updates on Elizabeth's services.
        </p>
      </CardHeader>
      <CardContent>
        {!isSubscribed ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full"
            >
              <Send className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Subscribing...' : 'Subscribe to Newsletter'}
            </Button>
          </form>
        ) : (
          <div className="text-center py-6">
                         <Heart className="w-8 h-8 mx-auto mb-3 text-primary" />
             <p className="text-muted-foreground">Thank you for subscribing!</p>
          </div>
        )}

        {message && (
          <div className={`mt-4 p-3 rounded-md ${
            message.includes('Thank you') 
              ? 'bg-green-50 text-green-600' 
              : 'bg-red-50 text-red-600'
          }`}>
            <p className="text-sm">{message}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NewsletterSignup;
