import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const PendingBookingsNotification = () => {
  const [pendingCount, setPendingCount] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPendingBookings();
  }, []);

  const loadPendingBookings = async () => {
    try {
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('id')
        .eq('status', 'pending');

      if (bookingsError) {
        console.error('Error loading pending bookings:', bookingsError);
        return;
      }

      const count = bookingsData?.length || 0;
      setPendingCount(count);
      setShowNotification(count > 0);
    } catch (error) {
      console.error('Error loading pending bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !showNotification) {
    return null;
  }

  return (
    <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20 shadow-lg mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
            <Bell className="w-5 h-5 animate-pulse" />
            New Booking Requests
            <Badge variant="secondary" className="bg-orange-200 text-orange-800">
              {pendingCount}
            </Badge>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowNotification(false)}
            className="text-orange-600 hover:text-orange-700"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-orange-700 dark:text-orange-300">
          You have {pendingCount} booking request{pendingCount === 1 ? '' : 's'} awaiting your approval.
        </p>
        
        <p className="text-xs text-orange-600 dark:text-orange-400">
          Look for dates highlighted in orange on your calendar to review and approve requests.
        </p>
        
        <Button
          className="w-full bg-orange-600 hover:bg-orange-700"
          onClick={() => {
            setShowNotification(false);
          }}
        >
          Got it!
        </Button>
      </CardContent>
    </Card>
  );
};

export default PendingBookingsNotification; 