import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, RefreshCw } from "lucide-react";

interface Subscriber {
  name: string;
  email: string;
  source: string;
  dateAdded: string;
}

interface SubscribersListProps {
  password: string;
}

const SubscribersList = ({ password }: SubscribersListProps) => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSubscribers();
  }, []);

  const loadSubscribers = async () => {
    setIsLoading(true);
    try {
      // Check if we're in development mode
      const isDevelopment = import.meta.env.DEV;
      
      if (isDevelopment) {
        console.log('Development mode: Loading subscribers from localStorage');
        // In development, get subscribers from localStorage
        try {
          const storedSubscribers = localStorage.getItem('subscribers');
          if (storedSubscribers) {
            const parsedSubscribers = JSON.parse(storedSubscribers);
            setSubscribers(parsedSubscribers);
          } else {
            // If no subscribers in localStorage, use empty array
            setSubscribers([]);
          }
        } catch (localStorageError) {
          console.error('Error reading from localStorage:', localStorageError);
          setSubscribers([]);
        }
      } else {
        // In production, use the Netlify function
        const response = await fetch('/.netlify/functions/get-subscribers');
        if (!response.ok) {
          throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        setSubscribers(data.subscribers || []);
      }
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
