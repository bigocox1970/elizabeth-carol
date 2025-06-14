import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { getApiUrl } from "@/utils/api";

interface RegisterFormProps {
  onSuccess?: () => void;
  onLoginClick?: () => void;
}

const RegisterForm = ({ onSuccess, onLoginClick }: RegisterFormProps) => {
  const { signUp } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    subscribeToNewsletter: true, // Default to checked
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData({
      ...formData,
      subscribeToNewsletter: checked,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate form
    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      setError("All fields are required");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await signUp(formData.email, formData.password, {
        name: formData.name,
        phone: formData.phone,
      });

      if (error) {
        throw error;
      }

      // If newsletter subscription is enabled and user signed up successfully
      if (formData.subscribeToNewsletter) {
        try {
          const response = await fetch(getApiUrl('add-subscriber'), {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              email: formData.email.trim(),
              name: formData.name.trim(),
              source: 'registration'
            })
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success) {
              toast({
                title: "Registration and subscription successful!",
                description: "Please check your email to confirm your account. You've also been subscribed to our newsletter.",
              });
            }
          }
        } catch (newsletterError) {
          console.error('Newsletter subscription error:', newsletterError);
          // Don't fail the registration if newsletter subscription fails
        }
      } else {
        toast({
          title: "Registration successful!",
          description: "Please check your email to confirm your account.",
        });
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError(err instanceof Error ? err.message : "Failed to register. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Create an Account</CardTitle>
        <CardDescription>
          Sign up to manage your reviews and comments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="Your name"
              value={formData.name}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="your.email@example.com"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="Your phone number"
              value={formData.phone}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="newsletter"
              checked={formData.subscribeToNewsletter}
              onCheckedChange={handleCheckboxChange}
              disabled={isLoading}
            />
            <Label htmlFor="newsletter" className="text-sm">
              Subscribe to Elizabeth Carol's newsletter for spiritual guidance and updates
            </Label>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating Account..." : "Register"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Button variant="link" className="p-0" onClick={onLoginClick}>
            Log in
          </Button>
        </p>
      </CardFooter>
    </Card>
  );
};

export default RegisterForm;
