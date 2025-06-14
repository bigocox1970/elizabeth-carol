import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, ChevronLeft, ChevronRight, Clock, User, CheckCircle, Video, Phone, UserCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { sendCustomerBookingConfirmation, sendAdminBookingNotification } from '@/lib/emailService';

interface AvailabilitySlot {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
  service_type: string;
  notes?: string;
}

interface Booking {
  availability_slot_id: number;
  status: string;
}

const Book = () => {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [selectedReadingType, setSelectedReadingType] = useState<'in_person' | 'video' | 'telephone' | null>(null);
  const [bookingStep, setBookingStep] = useState<'calendar' | 'confirm' | 'reading-type' | 'complete'>('calendar');
  const { user } = useAuth();

  useEffect(() => {
    loadAvailability();
  }, []);

  const loadAvailability = async () => {
    try {
      setLoading(true);
      
      // Load future availability slots only
      const today = new Date().toISOString().split('T')[0];
      
      const { data: slotsData, error: slotsError } = await supabase
        .from('availability_slots')
        .select('*')
        .gte('date', today)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });

      if (slotsError) {
        console.error('Error loading slots:', slotsError);
        toast.error('Failed to load availability');
        return;
      }

      // Load confirmed bookings to hide booked slots
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('availability_slot_id, status')
        .eq('status', 'confirmed');

      if (bookingsError) {
        console.error('Error loading bookings:', bookingsError);
        toast.error('Failed to load bookings');
        return;
      }

      setSlots(slotsData || []);
      setBookings(bookingsData || []);
    } catch (error) {
      console.error('Error loading availability:', error);
      toast.error('Failed to load availability');
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getAvailableSlotsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    const slotsForDate = slots.filter(slot => slot.date === dateString);
    
    // Filter out booked slots
    return slotsForDate.filter(slot => 
      !bookings.some(booking => booking.availability_slot_id === slot.id)
    );
  };

  const hasAvailableSlots = (date: Date) => {
    return getAvailableSlotsForDate(date).length > 0;
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  const selectDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    setSelectedDate(dateString);
    setBookingStep('confirm');
  };

  const selectSlot = (slot: AvailabilitySlot) => {
    setSelectedSlot(slot);
    setBookingStep('reading-type');
  };

  const handleBookingRequest = async () => {
    if (!selectedSlot || !selectedReadingType) return;

    // Check if user is logged in
    if (!user) {
      // Redirect to login with the current page as redirect
      window.location.href = `/auth?mode=login&redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
      return;
    }

    try {
      // Create a booking request in the bookings table with 'pending' status
      const { error } = await supabase
        .from('bookings')
        .insert({
          availability_slot_id: selectedSlot.id,
          client_name: user.user_metadata?.name || user.email?.split('@')[0],
          client_email: user.email,
          booking_type: 'online',
          reading_type: selectedReadingType,
          status: 'pending',
          notes: 'Customer booking request - needs manual approval'
        });

      if (error) {
        console.error('Error creating booking request:', error);
        toast.error('Failed to create booking request');
        return;
      }

      // Send email notifications
      const readingTypeDisplay = selectedReadingType === 'in_person' ? 'One to One (In-person)' :
                                selectedReadingType === 'video' ? 'Video Call' : 'Telephone';

      await sendCustomerBookingConfirmation({
        customerEmail: user.email!,
        customerName: user.user_metadata?.name || user.email?.split('@')[0] || 'Customer',
        date: formatDate(selectedSlot.date),
        time: `${formatTime(selectedSlot.start_time)} - ${formatTime(selectedSlot.end_time)}`,
        serviceType: readingTypeDisplay,
        notes: selectedSlot.notes
      });

      await sendAdminBookingNotification({
        customerEmail: user.email!,
        customerName: user.user_metadata?.name || user.email?.split('@')[0] || 'Customer',
        date: formatDate(selectedSlot.date),
        time: `${formatTime(selectedSlot.start_time)} - ${formatTime(selectedSlot.end_time)}`,
        serviceType: readingTypeDisplay,
        notes: selectedSlot.notes
      });

      setBookingStep('complete');
      toast.success('Booking request sent successfully!');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to send booking request');
    }
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01 ${timeString}`).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900 py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Book Your Reading
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Choose an available time slot for your personal reading with Elizabeth Carol
          </p>
        </div>

        {bookingStep === 'calendar' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => navigateDate('prev')}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <h3 className="font-semibold min-w-[200px] text-center">
                    {currentDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                  </h3>
                  <Button variant="outline" size="sm" onClick={() => navigateDate('next')}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>
                🟢 Available dates • Click any date to see available times
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Day headers */}
                <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium text-muted-foreground">
                  <div>Sun</div>
                  <div>Mon</div>
                  <div>Tue</div>
                  <div>Wed</div>
                  <div>Thu</div>
                  <div>Fri</div>
                  <div>Sat</div>
                </div>
                
                {/* Calendar days */}
                <div className="grid grid-cols-7 gap-1">
                  {getDaysInMonth(currentDate).map((date, index) => (
                    <div key={index} className="aspect-square min-w-0">
                      {date ? (
                        <Button
                          variant="ghost"
                          className={`w-full h-full p-1 text-xs sm:text-sm min-w-0 ${
                            hasAvailableSlots(date)
                              ? 'bg-green-100 hover:bg-green-200 text-green-800 border border-green-300'
                              : 'opacity-50'
                          } ${
                            date < new Date(new Date().setHours(0,0,0,0)) 
                              ? 'opacity-30 cursor-not-allowed' 
                              : hasAvailableSlots(date) 
                                ? 'cursor-pointer'
                                : 'cursor-not-allowed'
                          }`}
                          onClick={() => hasAvailableSlots(date) && date >= new Date(new Date().setHours(0,0,0,0)) && selectDate(date)}
                          disabled={!hasAvailableSlots(date) || date < new Date(new Date().setHours(0,0,0,0))}
                        >
                          <div className="flex flex-col items-center min-w-0">
                            <span className="truncate">{date.getDate()}</span>
                            {hasAvailableSlots(date) && (
                              <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
                                {Array.from({ length: getAvailableSlotsForDate(date).length }, (_, i) => (
                                  <div key={i} className="w-1 h-1 rounded-full bg-green-600"></div>
                                ))}
                              </div>
                            )}
                          </div>
                        </Button>
                      ) : (
                        <div></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {bookingStep === 'confirm' && selectedDate && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  {formatDate(selectedDate)}
                </CardTitle>
                <Button variant="outline" size="sm" onClick={() => setBookingStep('calendar')}>
                  ← Back to Calendar
                </Button>
              </div>
              <CardDescription>
                Choose your preferred time slot
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {getAvailableSlotsForDate(new Date(selectedDate)).map((slot) => (
                  <div key={slot.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                    <div className="flex-1">
                      <div className="font-medium flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                      </div>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {slot.service_type === 'both' ? 'In-person & Remote' :
                           slot.service_type === 'in_person' ? 'In-person Only' : 'Remote Only'}
                        </Badge>
                      </div>
                      {slot.notes && (
                        <p className="text-sm text-muted-foreground mt-2">{slot.notes}</p>
                      )}
                    </div>
                    <Button onClick={() => selectSlot(slot)}>
                      Select
                    </Button>
                  </div>
                ))}
                
                {getAvailableSlotsForDate(new Date(selectedDate)).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No available time slots for this date.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {bookingStep === 'reading-type' && selectedSlot && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5" />
                  Choose Your Reading Type
                </CardTitle>
                <Button variant="outline" size="sm" onClick={() => setBookingStep('confirm')}>
                  ← Back to Times
                </Button>
              </div>
              <CardDescription>
                Select how you'd like to receive your reading
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Selected Time Slot - Highlighted in Green */}
              <div className="p-4 border-2 border-green-500 rounded-lg bg-green-50 dark:bg-green-950/20 shadow-md">
                <h4 className="font-medium mb-2 text-green-800 dark:text-green-200">✓ Selected Time Slot:</h4>
                <div className="flex items-center gap-2 text-green-900 dark:text-green-100">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">
                    {formatDate(selectedSlot.date)} at {formatTime(selectedSlot.start_time)} - {formatTime(selectedSlot.end_time)}
                  </span>
                </div>
                <Badge variant="outline" className="text-xs mt-2 border-green-300 text-green-700">
                  {selectedSlot.service_type === 'both' ? 'In-person & Remote Available' :
                   selectedSlot.service_type === 'in_person' ? 'In-person Only' : 'Remote Only'}
                </Badge>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium text-center">Choose your preferred reading type:</h4>
                
                {selectedSlot.service_type !== 'remote' && (
                  <Button 
                    variant="outline"
                    className={`w-full p-6 h-auto flex flex-col gap-2 transition-all duration-200 ${
                      selectedReadingType === 'in_person' 
                        ? 'bg-green-50 border-2 border-green-500 text-green-800 shadow-md dark:bg-green-950/20 dark:text-green-200' 
                        : 'hover:bg-green-50 hover:border-green-300 hover:text-green-700 dark:hover:bg-green-950/20'
                    }`}
                    onClick={() => setSelectedReadingType('in_person')}
                  >
                    <UserCheck className="w-6 h-6" />
                    <div className="text-center">
                      <div className="font-medium">One to One (In-person)</div>
                      <div className="text-xs opacity-80">Face-to-face reading session</div>
                    </div>
                  </Button>
                )}
                
                {selectedSlot.service_type !== 'in_person' && (
                  <>
                    <Button 
                      variant="outline"
                      className={`w-full p-6 h-auto flex flex-col gap-2 transition-all duration-200 ${
                        selectedReadingType === 'video' 
                          ? 'bg-green-50 border-2 border-green-500 text-green-800 shadow-md dark:bg-green-950/20 dark:text-green-200' 
                          : 'hover:bg-green-50 hover:border-green-300 hover:text-green-700 dark:hover:bg-green-950/20'
                      }`}
                      onClick={() => setSelectedReadingType('video')}
                    >
                      <Video className="w-6 h-6" />
                      <div className="text-center">
                        <div className="font-medium">Video Call</div>
                        <div className="text-xs opacity-80">Online video reading session</div>
                      </div>
                    </Button>
                    
                    <Button 
                      variant="outline"
                      className={`w-full p-6 h-auto flex flex-col gap-2 transition-all duration-200 ${
                        selectedReadingType === 'telephone' 
                          ? 'bg-green-50 border-2 border-green-500 text-green-800 shadow-md dark:bg-green-950/20 dark:text-green-200' 
                          : 'hover:bg-green-50 hover:border-green-300 hover:text-green-700 dark:hover:bg-green-950/20'
                      }`}
                      onClick={() => setSelectedReadingType('telephone')}
                    >
                      <Phone className="w-6 h-6" />
                      <div className="text-center">
                        <div className="font-medium">Telephone</div>
                        <div className="text-xs opacity-80">Phone call reading session</div>
                      </div>
                    </Button>
                  </>
                )}
              </div>
              
              {/* Book Button - Appears when reading type is selected */}
              {selectedReadingType && (
                <div className="pt-4 border-t">
                  <Button 
                    onClick={handleBookingRequest}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 shadow-lg"
                    size="lg"
                  >
                    Book Your {selectedReadingType === 'in_person' ? 'One to One Reading' : 
                               selectedReadingType === 'video' ? 'Video Call Reading' : 'Telephone Reading'}
                  </Button>
                </div>
              )}
              
              {!selectedReadingType && (
                <div className="text-xs text-muted-foreground text-center pt-2">
                  Select your preferred reading type above to continue
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {bookingStep === 'complete' && selectedSlot && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                Booking Request Sent!
              </CardTitle>
              <CardDescription>
                Your booking request has been sent to Elizabeth Carol
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950/20">
                <h4 className="font-medium mb-2">Requested Reading:</h4>
                <p className="text-sm">
                  <strong>{selectedReadingType === 'in_person' ? 'One to One (In-person)' : selectedReadingType === 'video' ? 'Video Call' : 'Telephone'}</strong>
                </p>
                <p className="text-sm">
                  {formatDate(selectedSlot.date)} at {formatTime(selectedSlot.start_time)} - {formatTime(selectedSlot.end_time)}
                </p>
              </div>
              
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Elizabeth Carol has been notified of your booking request</p>
                <p>• You will receive an email confirmation once your booking is approved</p>
                <p>• Please check your email regularly for updates</p>
              </div>
              
              <Button 
                className="w-full"
                onClick={() => {
                  setBookingStep('calendar');
                  setSelectedSlot(null);
                  setSelectedDate(null);
                  setSelectedReadingType(null);
                }}
              >
                Book Another Reading
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Book; 