// Email service for booking notifications
// You can replace this with your preferred email service (Resend, SendGrid, etc.)

interface BookingEmailData {
  customerEmail: string;
  customerName: string;
  date: string;
  time: string;
  serviceType: string;
  notes?: string;
}

interface AdminNotificationData {
  customerEmail: string;
  customerName: string;
  date: string;
  time: string;
  serviceType: string;
  notes?: string;
}

// For now, we'll use a simple fetch to a serverless function
// You'll need to set up the actual email service of your choice

export const sendCustomerBookingConfirmation = async (data: BookingEmailData) => {
  try {
    // TODO: Replace with your actual email service
    console.log('Sending customer confirmation email:', data);
    
    // Example with fetch to a serverless function
    // const response = await fetch('/api/send-email', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     to: data.customerEmail,
    //     subject: 'Booking Request Received - Elizabeth Carol Psychic Readings',
    //     template: 'customer-booking-request',
    //     data
    //   })
    // });
    
    // For demonstration, we'll simulate success
    return { success: true };
  } catch (error) {
    console.error('Error sending customer email:', error);
    return { success: false, error };
  }
};

export const sendAdminBookingNotification = async (data: AdminNotificationData) => {
  try {
    // TODO: Replace with your actual email service
    console.log('Sending admin notification email:', data);
    
    // Example with fetch to a serverless function
    // const response = await fetch('/api/send-email', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     to: 'elizabeth@example.com', // Replace with mum's email
    //     subject: 'New Booking Request - Action Required',
    //     template: 'admin-booking-notification',
    //     data
    //   })
    // });
    
    // For demonstration, we'll simulate success
    return { success: true };
  } catch (error) {
    console.error('Error sending admin email:', error);
    return { success: false, error };
  }
};

export const sendBookingApprovalEmail = async (data: BookingEmailData & { approved: boolean }) => {
  try {
    console.log('Sending booking approval/decline email:', data);
    
    // TODO: Replace with your actual email service
    // const response = await fetch('/api/send-email', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     to: data.customerEmail,
    //     subject: data.approved 
    //       ? 'Booking Confirmed - Elizabeth Carol Psychic Readings'
    //       : 'Booking Request Update - Elizabeth Carol Psychic Readings',
    //     template: data.approved ? 'booking-approved' : 'booking-declined',
    //     data
    //   })
    // });
    
    return { success: true };
  } catch (error) {
    console.error('Error sending approval email:', error);
    return { success: false, error };
  }
};

// Email templates (you can customize these)
export const emailTemplates = {
  customerBookingRequest: (data: BookingEmailData) => ({
    subject: 'Booking Request Received - Elizabeth Carol Psychic Readings',
    html: `
      <h2>Booking Request Received</h2>
      <p>Dear ${data.customerName},</p>
      <p>Thank you for your booking request! Here are the details:</p>
      <div style="background: #f5f5f5; padding: 15px; margin: 15px 0; border-radius: 5px;">
        <strong>Date:</strong> ${data.date}<br>
        <strong>Time:</strong> ${data.time}<br>
        <strong>Service Type:</strong> ${data.serviceType}<br>
        ${data.notes ? `<strong>Notes:</strong> ${data.notes}<br>` : ''}
      </div>
      <p>Elizabeth Carol will review your request and confirm within 24 hours.</p>
      <p>You'll receive an email confirmation once your booking is approved.</p>
      <p>Best regards,<br>Elizabeth Carol Psychic Readings</p>
    `
  }),
  
  adminBookingNotification: (data: AdminNotificationData) => ({
    subject: 'New Booking Request - Action Required',
    html: `
      <h2>New Booking Request</h2>
      <p>You have a new booking request that needs your approval:</p>
      <div style="background: #f5f5f5; padding: 15px; margin: 15px 0; border-radius: 5px;">
        <strong>Customer:</strong> ${data.customerName} (${data.customerEmail})<br>
        <strong>Date:</strong> ${data.date}<br>
        <strong>Time:</strong> ${data.time}<br>
        <strong>Service Type:</strong> ${data.serviceType}<br>
        ${data.notes ? `<strong>Notes:</strong> ${data.notes}<br>` : ''}
      </div>
      <p>Please log in to your admin dashboard to approve or decline this request.</p>
      <p><a href="https://yoursite.com/admin" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Admin Dashboard</a></p>
    `
  }),
  
  bookingApproved: (data: BookingEmailData) => ({
    subject: 'Booking Confirmed - Elizabeth Carol Psychic Readings',
    html: `
      <h2>Booking Confirmed!</h2>
      <p>Dear ${data.customerName},</p>
      <p>Great news! Your booking has been confirmed:</p>
      <div style="background: #e8f5e8; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #28a745;">
        <strong>Date:</strong> ${data.date}<br>
        <strong>Time:</strong> ${data.time}<br>
        <strong>Service Type:</strong> ${data.serviceType}<br>
      </div>
      <p>Please arrive 5 minutes early for your appointment.</p>
      <p>Looking forward to connecting with you!</p>
      <p>Best regards,<br>Elizabeth Carol</p>
    `
  }),
  
  bookingDeclined: (data: BookingEmailData) => ({
    subject: 'Booking Request Update - Elizabeth Carol Psychic Readings',
    html: `
      <h2>Booking Request Update</h2>
      <p>Dear ${data.customerName},</p>
      <p>Thank you for your interest. Unfortunately, the requested time slot is no longer available:</p>
      <div style="background: #fff3cd; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #ffc107;">
        <strong>Date:</strong> ${data.date}<br>
        <strong>Time:</strong> ${data.time}<br>
      </div>
      <p>Please visit our booking page to select an alternative time slot.</p>
      <p><a href="https://yoursite.com/book" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Book Another Time</a></p>
      <p>Best regards,<br>Elizabeth Carol</p>
    `
  })
}; 