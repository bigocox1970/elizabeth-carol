// Email service for booking notifications
// You can replace this with your preferred email service (Resend, SendGrid, etc.)

interface EmailData {
  customerName: string;
  customerEmail: string;
  date: string;
  time: string;
  serviceType: string;
  notes?: string;
}

// Use the Netlify function to send emails
const sendEmailViaNetlify = async (type: string, data: EmailData) => {
  try {
    console.log(`🔄 Attempting to send ${type} email to:`, data.customerEmail);
    console.log('📧 Email data:', data);
    
    const response = await fetch('/.netlify/functions/send-booking-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type, data })
    });

    console.log('📡 Response status:', response.status);
    const result = await response.json();
    console.log('📨 Response result:', result);
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to send email');
    }

    console.log(`✅ ${type} email sent successfully!`);
    return result;
  } catch (error) {
    console.error(`❌ Failed to send ${type} email:`, error);
    throw error;
  }
};

export const sendCustomerBookingConfirmation = async (data: EmailData) => {
  console.log('🎯 sendCustomerBookingConfirmation called');
  return await sendEmailViaNetlify('customer-booking-request', data);
};

export const sendAdminBookingNotification = async (data: EmailData) => {
  console.log('🎯 sendAdminBookingNotification called');
  return await sendEmailViaNetlify('admin-booking-notification', data);
};

export const sendBookingApprovalEmail = async (data: EmailData & { approved: boolean }) => {
  console.log('🎯 sendBookingApprovalEmail called');
  return await sendEmailViaNetlify('booking-approval', data);
};

export const sendBookingCancellationEmail = async (data: EmailData & { refundAmount?: string }) => {
  console.log('🎯 sendBookingCancellationEmail called');
  return await sendEmailViaNetlify('booking-cancellation', data);
};

// Email templates (you can customize these)
export const emailTemplates = {
  customerBookingRequest: (data: EmailData) => ({
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
  
  adminBookingNotification: (data: EmailData) => ({
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
  
  bookingApproved: (data: EmailData) => ({
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
  
  bookingDeclined: (data: EmailData) => ({
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
      <p><a href="https://elizabethcarol.co.uk/contact" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Contact Us</a></p>
      <p>Best regards,<br>Elizabeth Carol</p>
    `
  })
}; 