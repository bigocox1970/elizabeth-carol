import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";

interface AvailabilitySlot {
  id?: number;
  date: string;
  start_time: string;
  end_time: string;
  service_type: string;
  notes?: string;
}

const AvailabilityManager = () => {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSlot, setNewSlot] = useState<AvailabilitySlot>({
    date: '',
    start_time: '',
    end_time: '',
    service_type: 'both',
    notes: ''
  });

  useEffect(() => {
    loadAvailability();
  }, []);

  const loadAvailability = async () => {
    try {
      setLoading(true);
      // For now, we'll use localStorage to store availability
      // Later we can connect to Supabase when ready
      const stored = localStorage.getItem('elizabeth_availability');
      if (stored) {
        setSlots(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading availability:', error);
      toast.error('Failed to load availability');
    } finally {
      setLoading(false);
    }
  };

  const saveAvailability = (updatedSlots: AvailabilitySlot[]) => {
    try {
      localStorage.setItem('elizabeth_availability', JSON.stringify(updatedSlots));
      setSlots(updatedSlots);
      toast.success('Availability saved successfully');
    } catch (error) {
      console.error('Error saving availability:', error);
      toast.error('Failed to save availability');
    }
  };

  const addSlot = () => {
    if (!newSlot.date || !newSlot.start_time || !newSlot.end_time) {
      toast.error('Please fill in all required fields');
      return;
    }

    const slotWithId = {
      ...newSlot,
      id: Date.now() // Simple ID for now
    };

    const updatedSlots = [...slots, slotWithId].sort((a, b) => 
      new Date(a.date + ' ' + a.start_time).getTime() - new Date(b.date + ' ' + b.start_time).getTime()
    );

    saveAvailability(updatedSlots);
    
    // Reset form
    setNewSlot({
      date: '',
      start_time: '',
      end_time: '',
      service_type: 'both',
      notes: ''
    });
  };

  const removeSlot = (id: number) => {
    const updatedSlots = slots.filter(slot => slot.id !== id);
    saveAvailability(updatedSlots);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01 ${timeString}`).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Manage Your Availability</h2>
        <p className="text-muted-foreground">
          Set the times when you're available for readings. Customers will only be able to book these slots.
        </p>
      </div>

      {/* Add New Slot */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add New Available Time
          </CardTitle>
          <CardDescription>
            Create a new time slot when you'll be available for readings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={newSlot.date}
                onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="start_time">Start Time</Label>
              <Input
                id="start_time"
                type="time"
                value={newSlot.start_time}
                onChange={(e) => setNewSlot({ ...newSlot, start_time: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_time">End Time</Label>
              <Input
                id="end_time"
                type="time"
                value={newSlot.end_time}
                onChange={(e) => setNewSlot({ ...newSlot, end_time: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="service_type">Service Type</Label>
              <select
                id="service_type"
                value={newSlot.service_type}
                onChange={(e) => setNewSlot({ ...newSlot, service_type: e.target.value })}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="both">Both (In-person & Remote)</option>
                <option value="in_person">In-person Only</option>
                <option value="remote">Remote Only</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Input
              id="notes"
              placeholder="Any special notes about this time slot..."
              value={newSlot.notes}
              onChange={(e) => setNewSlot({ ...newSlot, notes: e.target.value })}
            />
          </div>
          <Button onClick={addSlot} className="w-full">
            <Save className="w-4 h-4 mr-2" />
            Add Time Slot
          </Button>
        </CardContent>
      </Card>

      {/* Current Availability */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Your Current Availability
          </CardTitle>
          <CardDescription>
            {slots.length === 0 
              ? "No availability set yet. Add some time slots above."
              : `You have ${slots.length} available time slot${slots.length === 1 ? '' : 's'}`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {slots.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No availability set yet.</p>
              <p className="text-sm">Add your first time slot above to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {slots.map((slot) => (
                <div
                  key={slot.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-card"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="font-medium">
                        {formatDate(slot.date)}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                      </div>
                      <Badge variant="secondary">
                        {slot.service_type === 'both' ? 'In-person & Remote' :
                         slot.service_type === 'in_person' ? 'In-person Only' : 'Remote Only'}
                      </Badge>
                    </div>
                    {slot.notes && (
                      <p className="text-sm text-muted-foreground">{slot.notes}</p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => slot.id && removeSlot(slot.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {slots.length > 0 && (
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Tip:</strong> Customers will only be able to book the time slots you've added above. 
            Make sure to add availability regularly to keep your calendar up to date.
          </p>
        </div>
      )}
    </div>
  );
};

export default AvailabilityManager; 