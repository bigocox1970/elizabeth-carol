import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, ChevronLeft, ChevronRight, Clock, User, CheckCircle, Video, Phone, UserCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { sendCustomerBookingConfirmation, sendAdminBookingNotification } from '@/lib/emailService';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';

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

// TypeScript declaration for window.paypal
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    paypal?: any;
  }
}

const Book = () => {
  const navigate = useNavigate();
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
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
      setInitialLoading(true);
      
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
      setInitialLoading(false);
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

  // Helper function to check if a date string has available slots
  const hasAvailableSlotsForDateString = (dateString: string) => {
    const dateObj = new Date(dateString);
    return getAvailableSlotsForDate(dateObj).length > 0;
  };

  // Helper function to get previous day with available slots (searches up to 30 days back)
  const getPreviousDayWithSlots = (currentDateString: string) => {
    const currentDateObj = new Date(currentDateString);
    const today = new Date().toISOString().split('T')[0];
    
    // Search up to 30 days back for a day with available slots
    for (let i = 1; i <= 30; i++) {
      const checkDay = new Date(currentDateObj);
      checkDay.setDate(checkDay.getDate() - i);
      const checkDateString = checkDay.toISOString().split('T')[0];
      
      // Don't go before today
      if (checkDateString < today) break;
      
      if (hasAvailableSlotsForDateString(checkDateString)) {
        return checkDateString;
      }
    }
    return null;
  };

  // Helper function to get next day with available slots (searches up to 90 days ahead)
  const getNextDayWithSlots = (currentDateString: string) => {
    const currentDateObj = new Date(currentDateString);
    
    // Search up to 90 days ahead for a day with available slots
    for (let i = 1; i <= 90; i++) {
      const checkDay = new Date(currentDateObj);
      checkDay.setDate(checkDay.getDate() + i);
      const checkDateString = checkDay.toISOString().split('T')[0];
      
      if (hasAvailableSlotsForDateString(checkDateString)) {
        return checkDateString;
      }
    }
    return null;
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  const selectDate = (date: Date) => {
    // Fix timezone issue by using local date formatting
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    
    setSelectedDate(dateString);
    setBookingStep('confirm');
  };

  const selectSlot = (slot: AvailabilitySlot) => {
    setSelectedSlot(slot);
    setBookingStep('reading-type');
  };

  const [bookingProgress, setBookingProgress] = useState<string>('');
  const [progressStage, setProgressStage] = useState<number>(0);
  const [showProgressModal, setShowProgressModal] = useState<boolean>(false);

  const handleBookingRequest = async () => {
    if (!selectedSlot || !selectedReadingType || bookingLoading) return;

    // Check if user is logged in
    if (!user) {
      // Redirect to login with the current page as redirect
      window.location.href = `/auth?mode=login&redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
      return;
    }

    setBookingLoading(true);
    setShowProgressModal(true);
    setProgressStage(1);
    setBookingProgress('Validating booking request...');
    
    try {
      // Stage 1: Validate and create booking request
      await new Promise(resolve => setTimeout(resolve, 1500)); // Increased for validation
      
      // Fetch user profile info
      let profile = null;
      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('name, email, phone')
          .eq('id', user.id)
          .single();
        profile = profileData;
      }

      const { error } = await supabase
        .from('bookings')
        .insert({
          availability_slot_id: selectedSlot.id,
          user_id: user.id,
          booking_type: 'online',
          reading_type: selectedReadingType,
          status: 'pending',
          notes: 'Customer booking request',
          client_name: profile?.name || user.user_metadata?.name || user.email?.split('@')[0] || '',
          client_email: profile?.email || user.email || '',
          client_phone: profile?.phone || ''
        });

      if (error) {
        console.error('Error creating booking request:', error);
        toast.error('Failed to create booking request');
        setShowProgressModal(false);
        setProgressStage(0);
        setBookingProgress('');
        return;
      }

      // Stage 2: Drafting emails
      setProgressStage(2);
      setBookingProgress('Drafting email notifications...');
      await new Promise(resolve => setTimeout(resolve, 1200)); // Increased

      const readingTypeDisplay = selectedReadingType === 'in_person' ? 'One to One (In-person)' :
                                selectedReadingType === 'video' ? 'Video Call' : 'Telephone';

      const emailData = {
        customerEmail: user.email!,
        customerName: user.user_metadata?.name || user.email?.split('@')[0] || 'Customer',
        date: formatDate(selectedSlot.date),
        time: `${formatTime(selectedSlot.start_time)} - ${formatTime(selectedSlot.end_time)}`,
        serviceType: readingTypeDisplay,
        notes: selectedSlot.notes
      };

      // Stage 3: Send both emails in parallel
      setProgressStage(3);
      setBookingProgress('Sending email notifications...');
      
      // Send both emails in parallel (no artificial delay here - let the real email time show)
      const emailPromises = [
        sendCustomerBookingConfirmation(emailData),
        sendAdminBookingNotification(emailData)
      ];

      try {
        await Promise.all(emailPromises);
      } catch (emailError) {
        console.warn('Email sending failed, but booking was created:', emailError);
      }
      
      // Stage 4: Processing
      setProgressStage(4);
      setBookingProgress('Processing your booking...');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Show processing stage
      
      // Stage 5: Complete
      setProgressStage(5);
      setBookingProgress('Completing booking process...');
      await new Promise(resolve => setTimeout(resolve, 800));
      setBookingProgress('Booking request sent successfully!');

      // Show completion stage briefly
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      setShowProgressModal(false);
      setBookingStep('complete');
      setProgressStage(0);
      setBookingProgress('');
      
      // Show success confirmation for 3 seconds, then redirect to profile
      toast.success('Booking request sent successfully!');
      
      // Wait 3 seconds to show the confirmation, then redirect
      setTimeout(() => {
        navigate('/profile?tab=readings');
      }, 3000);

    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to send booking request');
      setShowProgressModal(false);
      setProgressStage(0);
      setBookingProgress('');
    } finally {
      setBookingLoading(false);
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

  // PayPal Hosted Button integration
  // IMPORTANT: Make sure the PayPal SDK script is included in public/index.html as per PayPal's instructions.
  const PayPalButton = () => {
    useEffect(() => {
      if (window.paypal && window.paypal.HostedButtons) {
        window.paypal.HostedButtons({
          hostedButtonId: "CS7837DA9Y362" // £1 test button
        }).render("#paypal-container-CS7837DA9Y362");
      }
    }, []);
    return <div id="paypal-container-CS7837DA9Y362"></div>;
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-background">
        <SEO 
          title="Book Your Reading - Elizabeth Carol"
          description="Book your personal psychic reading with Elizabeth Carol. Choose from in-person, video call, or telephone readings."
        />
        <Navigation />
        
        {/* Hero Section */}
        <section className="py-20 bg-gradient-celestial">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6">
                Book Your Reading
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Loading available time slots...
              </p>
            </div>
          </div>
        </section>

        {/* Loading Content */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Book Your Reading - Elizabeth Carol"
        description="Book your personal psychic reading with Elizabeth Carol. Choose from in-person, video call, or telephone readings."
      />
      <Navigation />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-celestial">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6">
              Book Your Reading
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Choose an available time slot for your personal reading with Elizabeth Carol. 
              Select from in-person, video call, or telephone sessions to suit your needs.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">

        {bookingStep === 'calendar' && (
          <Card className="hover:shadow-lg hover:shadow-primary/20 transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-center">
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="sm" onClick={() => navigateDate('prev')}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <h3 className="font-serif font-semibold text-center text-foreground min-w-[200px]">
                    {currentDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                  </h3>
                  <Button variant="outline" size="sm" onClick={() => navigateDate('next')}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <CardDescription className="text-center">
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
          <Card className="hover:shadow-lg hover:shadow-primary/20 transition-all duration-300">
            <CardHeader>
              <div className="space-y-4">
                {/* Date Navigation Row */}
                <div className="flex items-center justify-between">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      const prevDate = getPreviousDayWithSlots(selectedDate);
                      if (prevDate) {
                        setSelectedDate(prevDate);
                      }
                    }}
                    disabled={!getPreviousDayWithSlots(selectedDate)}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  
                  <CardTitle className="flex items-center gap-2 font-serif text-foreground">
                    <Calendar className="w-5 h-5" />
                    {formatDate(selectedDate)}
                  </CardTitle>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      const nextDate = getNextDayWithSlots(selectedDate);
                      if (nextDate) {
                        setSelectedDate(nextDate);
                      }
                    }}
                    disabled={!getNextDayWithSlots(selectedDate)}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Back to Calendar Button Row */}
                <div className="flex justify-center">
                  <Button variant="outline" size="sm" onClick={() => setBookingStep('calendar')}>
                    ← Back to Calendar
                  </Button>
                </div>
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
          <Card className="hover:shadow-lg hover:shadow-primary/20 transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 font-serif text-foreground">
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
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium text-center">Choose your preferred reading type:</h4>
                
                {selectedSlot.service_type !== 'remote' && (
                  <Button 
                    variant="outline"
                    className={`w-full p-6 h-auto flex flex-col gap-2 transition-all duration-200 ${
                      selectedReadingType === 'in_person' 
                        ? 'bg-green-50 border-2 border-green-500 text-green-800 shadow-md dark:bg-green-950/20 dark:text-green-200 hover:bg-green-50 hover:border-green-500 hover:text-green-800' 
                        : 'hover:bg-green-100 hover:border-green-400 hover:text-green-800 dark:hover:bg-green-900/30'
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
                          ? 'bg-green-50 border-2 border-green-500 text-green-800 shadow-md dark:bg-green-950/20 dark:text-green-200 hover:bg-green-50 hover:border-green-500 hover:text-green-800' 
                          : 'hover:bg-green-100 hover:border-green-400 hover:text-green-800 dark:hover:bg-green-900/30'
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
                          ? 'bg-green-50 border-2 border-green-500 text-green-800 shadow-md dark:bg-green-950/20 dark:text-green-200 hover:bg-green-50 hover:border-green-500 hover:text-green-800' 
                          : 'hover:bg-green-100 hover:border-green-400 hover:text-green-800 dark:hover:bg-green-900/30'
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
              
              {/* Progress Indicator - Shows during booking process */}
              {bookingLoading && bookingProgress && (
                <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    <div>
                      <p className="font-medium text-blue-900 dark:text-blue-100">{bookingProgress}</p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">Please wait while we process your request...</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Book Button - Appears when reading type is selected */}
              {selectedReadingType && (
                <div className="pt-4 border-t">
                  <PayPalButton />
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
          <Card className="hover:shadow-lg hover:shadow-primary/20 transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600 font-serif">
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
      </section>
      <Footer />

      {/* Progress Modal Overlay */}
      {showProgressModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background border rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-foreground mb-4">Processing Your Booking</h3>
              
              {/* Progress Bar */}
              <div className="w-full bg-muted rounded-full h-2 mb-6">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${(progressStage / 5) * 100}%` }}
                ></div>
              </div>

              {/* Progress Stages */}
              <div className="space-y-4 mb-6">
                <div className={`flex items-center gap-3 p-3 rounded-lg ${progressStage >= 1 ? 'bg-green-50 dark:bg-green-950/20' : 'bg-muted/50'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    progressStage > 1 ? 'bg-green-600 text-white' : 
                    progressStage === 1 ? 'bg-blue-600 text-white' : 'bg-muted text-muted-foreground'
                  }`}>
                    {progressStage > 1 ? '✓' : progressStage === 1 ? 
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div> : '1'}
                  </div>
                  <span className={`${progressStage >= 1 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                    Validating booking details
                  </span>
                </div>

                <div className={`flex items-center gap-3 p-3 rounded-lg ${progressStage >= 2 ? 'bg-green-50 dark:bg-green-950/20' : 'bg-muted/50'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    progressStage > 2 ? 'bg-green-600 text-white' : 
                    progressStage === 2 ? 'bg-blue-600 text-white' : 'bg-muted text-muted-foreground'
                  }`}>
                    {progressStage > 2 ? '✓' : progressStage === 2 ? 
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div> : '2'}
                  </div>
                  <span className={`${progressStage >= 2 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                    Drafting email notifications
                  </span>
                </div>

                <div className={`flex items-center gap-3 p-3 rounded-lg ${progressStage >= 3 ? 'bg-green-50 dark:bg-green-950/20' : 'bg-muted/50'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    progressStage > 3 ? 'bg-green-600 text-white' : 
                    progressStage === 3 ? 'bg-blue-600 text-white' : 'bg-muted text-muted-foreground'
                  }`}>
                    {progressStage > 3 ? '✓' : progressStage === 3 ? 
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div> : '3'}
                  </div>
                  <span className={`${progressStage >= 3 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                    Sending email notifications
                  </span>
                </div>

                <div className={`flex items-center gap-3 p-3 rounded-lg ${progressStage >= 4 ? 'bg-green-50 dark:bg-green-950/20' : 'bg-muted/50'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    progressStage > 4 ? 'bg-green-600 text-white' : 
                    progressStage === 4 ? 'bg-blue-600 text-white' : 'bg-muted text-muted-foreground'
                  }`}>
                    {progressStage > 4 ? '✓' : progressStage === 4 ? 
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div> : '4'}
                  </div>
                  <span className={`${progressStage >= 4 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                    Processing your booking
                  </span>
                </div>

                <div className={`flex items-center gap-3 p-3 rounded-lg ${progressStage >= 5 ? 'bg-green-50 dark:bg-green-950/20' : 'bg-muted/50'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    progressStage >= 5 ? 'bg-green-600 text-white' : 'bg-muted text-muted-foreground'
                  }`}>
                    {progressStage >= 5 ? '✓' : '5'}
                  </div>
                  <span className={`${progressStage >= 5 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                    Finalizing booking
                  </span>
                </div>
              </div>

              {/* Current Status */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Current Status:</p>
                <p className="font-medium text-foreground">{bookingProgress}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Book; 