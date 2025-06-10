import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getApiUrl } from "@/utils/api";

interface Subscriber {
  name: string;
  email: string;
  source: string;
  dateAdded: string;
}

const SubscribersList = () => {
  const { session } = useAuth();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (session) {
      loadSubscribers();
    }
  }, [session]);

  const loadSubscribers = async () => {
    if (!session) return;

    setIsLoading(true);
    try {
      const response = await fetch(getApiUrl('get-subscribers'), {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setSubscribers(data.subscribers || []);
    } catch (error) {
      console.error('Failed to load subscribers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="w-5 h-5" />
          <span>Subscribers ({subscribers.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : subscribers.length === 0 ? (
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
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh List
        </Button>
      </CardContent>
    </Card>
  );
};

export default SubscribersList;
