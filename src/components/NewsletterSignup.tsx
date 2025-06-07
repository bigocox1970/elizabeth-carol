import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Check, AlertCircle } from "lucide-react";

const NewsletterSignup = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    // Create form data for Netlify Forms
    const formData = new FormData();
    formData.append('form-name', 'newsletter-signup');
    formData.append('email', email);
    formData.append('name', name);

    try {
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams([...formData] as [string, string][]).toString()
      });

      if (response.ok) {
        setIsSuccess(true);
        setMessage('Successfully subscribed! Thank you for joining our newsletter.');
        setEmail('');
        setName('');
      } else {
        setMessage('Failed to subscribe. Please try again.');
      }
    } catch (error) {
      setMessage('Failed to subscribe. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
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
              />
            </div>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-purple-900 to-black hover:from-black hover:to-gray-900 text-white disabled:opacity-50"
            >
              {isSubmitting ? 'Subscribing...' : 'Subscribe for Updates'}
            </Button>
            
            {message && !isSuccess && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
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
              onClick={() => {
                setIsSuccess(false);
                setMessage('');
              }}
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