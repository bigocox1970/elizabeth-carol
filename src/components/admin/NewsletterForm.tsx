import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Mail, Send } from "lucide-react";

interface NewsletterFormProps {
  password: string;
  subscriberCount: number;
}

const NewsletterForm = ({ password, subscriberCount }: NewsletterFormProps) => {
  const [emailData, setEmailData] = useState({
    subject: '',
    message: ''
  });
  const [isSending, setIsSending] = useState(false);
  const [sendMessage, setSendMessage] = useState('');

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
            disabled={isSending || subscriberCount === 0}
            className="w-full bg-gradient-to-r from-purple-900 to-black hover:from-black hover:to-gray-900 text-white disabled:opacity-50"
          >
            <Send className="w-4 h-4 mr-2" />
            {isSending ? 'Sending...' : `Send to ${subscriberCount} Subscribers`}
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
