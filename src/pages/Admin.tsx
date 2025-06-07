import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Mail, Users, Send, Eye, EyeOff, Plus, Edit, Trash2, Star, MessageCircle, BookOpen, ThumbsUp } from "lucide-react";

const Admin = () => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [subscribers, setSubscribers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [emailData, setEmailData] = useState({
    subject: '',
    message: ''
  });
  const [blogData, setBlogData] = useState({
    title: '',
    content: '',
    category: 'Spiritual Guidance',
    published: false
  });
  const [editingPost, setEditingPost] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sendMessage, setSendMessage] = useState('');
  const [blogMessage, setBlogMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    // Simple password check - you can change this
    if (password === 'elizabeth2024') {
      setIsAuthenticated(true);
      loadSubscribers();
    } else {
      alert('Incorrect password');
    }
  };

  const loadSubscribers = async () => {
    try {
      const response = await fetch('/.netlify/functions/get-subscribers');
      if (response.ok) {
        const data = await response.json();
        setSubscribers(data.subscribers || []);
      }
    } catch (error) {
      console.error('Failed to load subscribers:', error);
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setSendMessage('');

    try {
      const response = await fetch('/.netlify/functions/send-newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: emailData.subject,
          message: emailData.message,
          password: password // Include password for verification
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSendMessage(`Email sent successfully to ${data.sentCount} subscribers!`);
        setEmailData({ subject: '', message: '' });
      } else {
        setSendMessage(data.message || 'Failed to send email.');
      }
    } catch (error) {
      setSendMessage('Failed to send email. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Admin Login</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  placeholder="Enter admin password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <Button onClick={handleLogin} className="w-full">
              Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-foreground">Mailing List Admin</h1>
            <Button 
              onClick={() => setIsAuthenticated(false)}
              variant="outline"
            >
              Logout
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Subscribers List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Subscribers ({subscribers.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {subscribers.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      No subscribers yet
                    </p>
                  ) : (
                    subscribers.map((subscriber, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{subscriber.name || 'No name'}</p>
                          <p className="text-xs text-muted-foreground">{subscriber.email}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant={subscriber.source === 'contact_form' ? 'default' : 'secondary'}>
                            {subscriber.source === 'contact_form' ? 'Contact' : 'Subscriber'}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(subscriber.dateAdded).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <Button 
                  onClick={loadSubscribers}
                  variant="outline"
                  size="sm"
                  className="w-full mt-4"
                >
                  Refresh List
                </Button>
              </CardContent>
            </Card>

            {/* Send Email */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mail className="w-5 h-5" />
                  <span>Send Newsletter</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSendEmail} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Email Subject</Label>
                    <Input
                      id="subject"
                      value={emailData.subject}
                      onChange={(e) => setEmailData({...emailData, subject: e.target.value})}
                      placeholder="e.g., Upcoming Workshop - Spiritual Development"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">Email Message</Label>
                    <Textarea
                      id="message"
                      value={emailData.message}
                      onChange={(e) => setEmailData({...emailData, message: e.target.value})}
                      placeholder="Write your message here... You can include upcoming events, workshops, or spiritual guidance."
                      rows={8}
                      required
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={isSending || subscribers.length === 0}
                    className="w-full bg-gradient-to-r from-purple-900 to-black hover:from-black hover:to-gray-900 text-white disabled:opacity-50"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {isSending ? 'Sending...' : `Send to ${subscribers.length} Subscribers`}
                  </Button>
                  
                  {sendMessage && (
                    <div className={`p-3 rounded-md ${sendMessage.includes('successfully') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                      <p className="text-sm">{sendMessage}</p>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Tips */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Tips for Elizabeth</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• <strong>Contact Form:</strong> Anyone who fills out the contact form is automatically added to your mailing list</p>
              <p>• <strong>Newsletter Signup:</strong> Visitors can also subscribe directly using the newsletter form</p>
              <p>• <strong>Email Ideas:</strong> Upcoming workshops, meditation sessions, spiritual insights, testimonials, or special offers</p>
              <p>• <strong>Frequency:</strong> Monthly newsletters work well - not too often, but keeps you connected</p>
              <p>• <strong>Personal Touch:</strong> Share your spiritual insights and connect personally with your clients</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Admin; 