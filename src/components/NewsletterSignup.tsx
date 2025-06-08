import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Check, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getApiUrl } from "@/utils/api";

// Define types for subscribers
interface Subscriber {
  email: string;
  name: string;
  source: string;
  user_id: string | null;
  date_added: string;
  active?: boolean;
}

const NewsletterSignup = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const { user } = useAuth();

  const validateEmail = (email: string) => {
    return email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation
    if (!email.trim()) {
      setMessage('Please enter your email address.');
      return;
    }

    if (!validateEmail(email)) {
      setMessage('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      // Always use the real API, even in development mode
      console.log('Newsletter signup:', { name: name.trim(), email: email.trim() });

      // Check if we're in development mode to handle the case where Netlify Functions aren't available
      const isDevelopment = import.meta.env.DEV;
      
      if (isDevelopment) {
        // In development, simulate a successful response since Netlify Functions aren't running locally
        console.log('Development mode: Simulating successful subscription');
        
        // Save to local storage for development testing
        try {
          const existingSubscribers = JSON.parse(localStorage.getItem('subscribers') || '[]');
          const newSubscriber = {
            email: email.trim(),
            name: name.trim(),
            source: 'newsletter',
            user_id: user?.id || null,
            date_added: new Date().toISOString()
          };
          
          // Check if already subscribed
          const alreadySubscribed = existingSubscribers.some(
            (sub: Subscriber) => sub.email.toLowerCase() === email.trim().toLowerCase()
          );
          
          if (alreadySubscribed) {
            setIsSuccess(true);
            setMessage('You are already subscribed! (Development mode)');
          } else {
            existingSubscribers.push(newSubscriber);
            localStorage.setItem('subscribers', JSON.stringify(existingSubscribers));
            setIsSuccess(true);
            setMessage('Successfully subscribed! (Development mode)');
          }
          
          setEmail('');
          setName('');
          return;
        } catch (localStorageError) {
          console.error('Error with localStorage:', localStorageError);
        }
      }

      // In production, use the Netlify Function
      const response = await fetch(getApiUrl('add-subscriber'), {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim(),
          source: 'newsletter',
          user_id: user?.id || null // Send user ID if available
        })
      });

      // Handle the response
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setIsSuccess(true);
        setMessage('Successfully subscribed! Thank you for joining our newsletter.');
        setEmail('');
        setName('');
      } else {
        setMessage(result.message || 'Failed to subscribe. Please try again.');
      }
    } catch (error) {
      console.error('Newsletter signup error:', error);
      setMessage('Connection error. Please check your internet connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setIsSuccess(false);
    setMessage('');
    setEmail('');
    setName('');
  };

  return (
    <Card className="bg-gradient-to-r from-purple-900/10 to-black/10 border-purple-900/20">
      <CardContent className="p-6">
        <div className="text-center mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-900 to-black flex items-center justify-center mx-auto mb-3">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Stay Connected
          </h3>
          <p className="text-muted-foreground text-sm">
            Get notified about upcoming events, workshops, and spiritual guidance sessions.
          </p>
        </div>

        {!isSuccess ? (
          <form 
            onSubmit={handleSubmit} 
            className="space-y-4"
            name="newsletter-signup" 
            method="POST" 
            data-netlify="true"
            netlify-honeypot="bot-field"
          >
            {/* Hidden form name for Netlify */}
            <input type="hidden" name="form-name" value="newsletter-signup" />
            
            {/* Honeypot field */}
            <div style={{ display: 'none' }}>
              <label>
                Don't fill this out if you're human: <input name="bot-field" />
              </label>
            </div>

            <div>
              <Input
                type="text"
                name="name"
                placeholder="Your name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-background"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <Input
                type="email"
                name="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-background"
                disabled={isSubmitting}
              />
            </div>
            <Button 
              type="submit" 
              disabled={isSubmitting || !email.trim()}
              className="w-full bg-gradient-to-r from-purple-900 to-black hover:from-black hover:to-gray-900 text-white disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Subscribing...
                </>
              ) : (
                'Subscribe for Updates'
              )}
            </Button>
            
            {message && !isSuccess && (
              <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{message}</p>
              </div>
            )}
          </form>
        ) : (
          <div className="text-center space-y-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-green-600 font-medium">{message}</p>
            <p className="text-sm text-muted-foreground">
              Thank you for subscribing! You'll hear from Elizabeth soon.
            </p>
            <Button 
              onClick={resetForm}
              variant="ghost"
              size="sm"
              className="text-primary"
            >
              Subscribe Another Email
            </Button>
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center mt-4">
          No spam, ever. Unsubscribe anytime by replying to any email.
        </p>
      </CardContent>
    </Card>
  );
};

export default NewsletterSignup;
