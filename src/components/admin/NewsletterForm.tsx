import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Send, Users, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getApiUrl } from "@/utils/api";

interface NewsletterFormProps {
  subscriberCount: number;
}

interface Subscriber {
  id: string;
  name: string;
  email: string;
  source: string;
  dateAdded: string;
  active: boolean;
}

const NewsletterForm = ({ subscriberCount }: NewsletterFormProps) => {
  const { session } = useAuth();
  const [emailData, setEmailData] = useState({
    subject: '',
    message: ''
  });
  const [isSending, setIsSending] = useState(false);
  const [sendMessage, setSendMessage] = useState('');
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [selectedSubscribers, setSelectedSubscribers] = useState<Set<string>>(new Set());
  const [sendToMode, setSendToMode] = useState<'all' | 'selected'>('all');
  const [showSubscriberSelection, setShowSubscriberSelection] = useState(false);

  useEffect(() => {
    if (session) {
      loadSubscribers();
    }
  }, [session]);

  // Listen for subscriber selection from SubscribersList
  useEffect(() => {
    const handleSelectedSubscribers = (event: CustomEvent) => {
      const selectedIds = event.detail;
      setSelectedSubscribers(new Set(selectedIds));
      if (selectedIds.length > 0) {
        setSendToMode('selected');
        setShowSubscriberSelection(true);
      }
    };

    window.addEventListener('selectedSubscribers', handleSelectedSubscribers as EventListener);
    return () => {
      window.removeEventListener('selectedSubscribers', handleSelectedSubscribers as EventListener);
    };
  }, []);

  const loadSubscribers = async () => {
    if (!session) return;

    try {
      const response = await fetch(getApiUrl('manage-subscribers'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ action: 'get-all-subscribers' }),
      });
      
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
    console.log('=== NEWSLETTER FORM SUBMIT ===');
    console.log('Session:', session ? 'EXISTS' : 'MISSING');
    console.log('Send mode:', sendToMode);
    console.log('Selected subscribers:', Array.from(selectedSubscribers));
    console.log('Email data:', emailData);
    
    if (!session) {
      setSendMessage('You must be logged in to send newsletters.');
      return;
    }

    const recipientCount = sendToMode === 'all' ? subscriberCount : selectedSubscribers.size;
    console.log('Recipient count:', recipientCount);
    
    if (recipientCount === 0) {
      setSendMessage('No subscribers selected to send to.');
      return;
    }

    setIsSending(true);
    setSendMessage('');

    try {
      const requestBody = {
        subject: emailData.subject,
        message: emailData.message,
        sendToMode: sendToMode,
        selectedSubscribers: sendToMode === 'selected' ? Array.from(selectedSubscribers) : undefined
      };
      
      console.log('Request body:', requestBody);
      console.log('Making request to /.netlify/functions/send-newsletter');
      
      const response = await fetch('/.netlify/functions/send-newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        setSendMessage(`Email sent successfully to ${data.sentCount} subscribers!`);
        setEmailData({ subject: '', message: '' });
        setSelectedSubscribers(new Set());
        setSendToMode('all');
        setShowSubscriberSelection(false);
      } else {
        setSendMessage(data.message || 'Failed to send email.');
      }
    } catch (error) {
      console.error('Newsletter request error:', error);
      setSendMessage('Failed to send email. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const toggleSubscriber = (subscriberId: string) => {
    const newSelected = new Set(selectedSubscribers);
    if (newSelected.has(subscriberId)) {
      newSelected.delete(subscriberId);
    } else {
      newSelected.add(subscriberId);
    }
    setSelectedSubscribers(newSelected);
  };

  const toggleAllSubscribers = () => {
    if (selectedSubscribers.size === subscribers.length) {
      setSelectedSubscribers(new Set());
    } else {
      setSelectedSubscribers(new Set(subscribers.map(sub => sub.id)));
    }
  };

  const recipientCount = sendToMode === 'all' ? subscriberCount : selectedSubscribers.size;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Mail className="w-5 h-5" />
          <span>Send Newsletter</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSendEmail} className="space-y-4">
          {/* Recipient Selection */}
          <div className="space-y-3">
            <Label>Send To</Label>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={sendToMode === 'all'}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSendToMode('all');
                      setShowSubscriberSelection(false);
                    }
                  }}
                />
                <Label className="text-sm">All Subscribers ({subscriberCount})</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={sendToMode === 'selected'}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSendToMode('selected');
                      setShowSubscriberSelection(true);
                    }
                  }}
                />
                <Label className="text-sm">Selected Subscribers ({selectedSubscribers.size})</Label>
                {selectedSubscribers.size > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {selectedSubscribers.size} selected
                  </Badge>
                )}
              </div>
            </div>

            {sendToMode === 'selected' && (
              <div className="mt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSubscriberSelection(!showSubscriberSelection)}
                >
                  <Users className="w-4 h-4 mr-2" />
                  {showSubscriberSelection ? 'Hide' : 'Show'} Subscriber Selection
                </Button>
              </div>
            )}
          </div>

          {/* Subscriber Selection Panel */}
          {sendToMode === 'selected' && showSubscriberSelection && (
            <Card className="max-h-64 overflow-y-auto">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="font-medium">Select Recipients</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSubscriberSelection(false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center space-x-2 p-2 bg-secondary/10 rounded border">
                    <Checkbox
                      checked={selectedSubscribers.size === subscribers.length && subscribers.length > 0}
                      onCheckedChange={toggleAllSubscribers}
                    />
                    <Label className="text-sm">Select All ({subscribers.length})</Label>
                  </div>

                  {subscribers.map((subscriber) => (
                    <div key={subscriber.id} className="flex items-center space-x-2 p-2 rounded hover:bg-secondary/20">
                      <Checkbox
                        checked={selectedSubscribers.has(subscriber.id)}
                        onCheckedChange={() => toggleSubscriber(subscriber.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {subscriber.name || 'No name'}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {subscriber.email}
                        </p>
                      </div>
                      <Badge variant={subscriber.source === 'contact_form' ? 'default' : 'secondary'} className="text-xs">
                        {subscriber.source === 'contact_form' ? 'Contact' : 'Newsletter'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

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
            disabled={isSending || recipientCount === 0 || !session}
            className="w-full bg-gradient-to-r from-purple-900 to-black hover:from-black hover:to-gray-900 text-white disabled:opacity-50"
          >
            <Send className="w-4 h-4 mr-2" />
            {isSending ? 'Sending...' : `Send to ${recipientCount} ${recipientCount === 1 ? 'Subscriber' : 'Subscribers'}`}
          </Button>
          
          {sendMessage && (
            <div className={`p-3 rounded-md ${sendMessage.includes('successfully') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
              <p className="text-sm">{sendMessage}</p>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default NewsletterForm;
