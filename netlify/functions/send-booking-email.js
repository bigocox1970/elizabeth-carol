const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {
  console.log('🚀 send-booking-email function called');
  console.log('📥 Event method:', event.httpMethod);
  console.log('📥 Event body:', event.body);

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({ message: 'Method not allowed' })
    };
  }

  try {
    const { type, data } = JSON.parse(event.body);
    console.log('📧 Email type:', type);
    console.log('📧 Email data:', data);

    // Validate required fields
    if (!type || !data) {
      console.log('❌ Missing type or data');
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type",
        },
        body: JSON.stringify({ message: 'Type and data are required' })
      };
    }

    // Only send emails if credentials are available
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log('⚠️ Email credentials not configured - skipping emails');
      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type",
        },
        body: JSON.stringify({ success: true, message: 'Email sending skipped - no credentials' })
      };
    }

    console.log('🔧 Creating email transporter...');
    console.log('Email credentials:', {
      user: process.env.EMAIL_USER ? 'SET' : 'MISSING',
      pass: process.env.EMAIL_PASSWORD ? 'SET' : 'MISSING'
    });
    
    const transporter = nodemailer.createTransport({
      host: 'smtp.office365.com',
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // Test the transporter connection
    try {
      await transporter.verify();
      console.log('✅ SMTP connection verified successfully');
    } catch (verifyError) {
      console.error('❌ SMTP connection failed:', verifyError);
      throw new Error(`SMTP connection failed: ${verifyError.message}`);
    }

    let emailSent = false;

    console.log('📨 Processing email type:', type);
    switch (type) {
      case 'customer-booking-request':
        const customerEmail = {
          from: '"Elizabeth Carol - Spiritual Guidance" <info@elizabethcarol.co.uk>',
          to: data.customerEmail,
          subject: '✨ Booking Request Received - Elizabeth Carol',
          text: `Booking Request Received

Dear ${data.customerName},

Thank you for your booking request! Here are the details:

Date: ${data.date}
Time: ${data.time}
Reading Type: ${data.serviceType}
${data.notes ? `Notes: ${data.notes}` : ''}

Elizabeth Carol will review your request and confirm within 24 hours.
You'll receive an email confirmation once your booking is approved.

Best regards,
Elizabeth Carol

📧 info@elizabethcarol.co.uk | 📞 01865 361 786`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #6366f1; margin: 0;">Elizabeth Carol</h1>
                <p style="color: #64748b; margin: 5px 0;">Spiritual Guidance & Psychic Readings</p>
              </div>
              
              <h2 style="color: #1e293b;">Booking Request Received ✨</h2>
              <p>Dear ${data.customerName},</p>
              <p>Thank you for your booking request! Here are the details:</p>
              
              <div style="background: #f8fafc; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #6366f1;">
                <p style="margin: 0; padding: 5px 0;"><strong>Date:</strong> ${data.date}</p>
                <p style="margin: 0; padding: 5px 0;"><strong>Time:</strong> ${data.time}</p>
                <p style="margin: 0; padding: 5px 0;"><strong>Reading Type:</strong> ${data.serviceType}</p>
                ${data.notes ? `<p style="margin: 0; padding: 5px 0;"><strong>Notes:</strong> ${data.notes}</p>` : ''}
              </div>
              
              <p>Elizabeth Carol will review your request and confirm within 24 hours.</p>
              <p>You'll receive an email confirmation once your booking is approved.</p>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b;">
                <p>Best regards,<br>Elizabeth Carol</p>
                <p style="font-size: 12px;">📧 info@elizabethcarol.co.uk | 📞 01865 361 786</p>
              </div>
            </div>
          `
        };
        
        try {
          const customerResult = await transporter.sendMail(customerEmail);
          console.log('✅ Customer booking confirmation sent to:', data.customerEmail);
          console.log('📧 Email result:', customerResult);
          console.log('📧 Message ID:', customerResult.messageId);
          console.log('📧 Response:', customerResult.response);
          emailSent = true;
        } catch (emailError) {
          console.error('❌ Failed to send customer email:', emailError);
          console.error('❌ Error details:', {
            code: emailError.code,
            command: emailError.command,
            response: emailError.response,
            responseCode: emailError.responseCode
          });
          throw emailError;
        }
        break;

      case 'admin-booking-notification':
        const adminEmail = {
          from: '"Booking System" <info@elizabethcarol.co.uk>',
          to: 'info@elizabethcarol.co.uk',
          subject: `🔔 New Booking Request from ${data.customerName}`,
          text: `New Booking Request

You have a new booking request that needs your approval:

Customer: ${data.customerName}
Email: ${data.customerEmail}
Date: ${data.date}
Time: ${data.time}
Reading Type: ${data.serviceType}
${data.notes ? `Notes: ${data.notes}` : ''}

Log in to your admin dashboard to approve or decline this request.
Admin Dashboard: https://www.elizabethcarol.co.uk/admin`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #dc2626;">New Booking Request 🔔</h2>
              <p>You have a new booking request that needs your approval:</p>
              
              <div style="background: #fef7ff; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #dc2626;">
                <p style="margin: 0; padding: 5px 0;"><strong>Customer:</strong> ${data.customerName}</p>
                <p style="margin: 0; padding: 5px 0;"><strong>Email:</strong> ${data.customerEmail}</p>
                <p style="margin: 0; padding: 5px 0;"><strong>Date:</strong> ${data.date}</p>
                <p style="margin: 0; padding: 5px 0;"><strong>Time:</strong> ${data.time}</p>
                <p style="margin: 0; padding: 5px 0;"><strong>Reading Type:</strong> ${data.serviceType}</p>
                ${data.notes ? `<p style="margin: 0; padding: 5px 0;"><strong>Notes:</strong> ${data.notes}</p>` : ''}
              </div>
              
              <p style="text-align: center;">
                <a href="https://www.elizabethcarol.co.uk/admin" style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Go to Admin Dashboard</a>
              </p>
              
              <p style="font-size: 14px; color: #64748b;">Log in to your admin dashboard to approve or decline this request.</p>
            </div>
          `
        };
        
        try {
          const adminResult = await transporter.sendMail(adminEmail);
          console.log('✅ Admin booking notification sent to info@elizabethcarol.co.uk');
          console.log('📧 Email result:', adminResult);
          console.log('📧 Message ID:', adminResult.messageId);
          console.log('📧 Response:', adminResult.response);
          emailSent = true;
        } catch (emailError) {
          console.error('❌ Failed to send admin email:', emailError);
          console.error('❌ Error details:', {
            code: emailError.code,
            command: emailError.command,
            response: emailError.response,
            responseCode: emailError.responseCode
          });
          throw emailError;
        }
        break;

      case 'booking-approval':
        const approvalEmail = {
          from: '"Elizabeth Carol - Spiritual Guidance" <info@elizabethcarol.co.uk>',
          to: data.customerEmail,
          subject: data.approved 
            ? '✅ Booking Confirmed - Elizabeth Carol'
            : '📅 Booking Request Update - Elizabeth Carol',
          text: data.approved ? `Booking Confirmed!

Dear ${data.customerName},

Great news! Your booking has been confirmed:

Date: ${data.date}
Time: ${data.time}
Reading Type: ${data.serviceType}

Please arrive 5 minutes early for your appointment.
Looking forward to connecting with you!

Best regards,
Elizabeth Carol

📧 info@elizabethcarol.co.uk | 📞 01865 361 786` : `Booking Request Update

Dear ${data.customerName},

Thank you for your interest. Unfortunately, the requested time slot is no longer available:

Date: ${data.date}
Time: ${data.time}

Please visit our booking page to select an alternative time slot.
Booking Page: https://www.elizabethcarol.co.uk/book

Best regards,
Elizabeth Carol

📧 info@elizabethcarol.co.uk | 📞 01865 361 786`,
          html: data.approved ? `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #059669; margin: 0;">Elizabeth Carol</h1>
                <p style="color: #64748b; margin: 5px 0;">Spiritual Guidance & Psychic Readings</p>
              </div>
              
              <h2 style="color: #059669;">Booking Confirmed! ✅</h2>
              <p>Dear ${data.customerName},</p>
              <p>Great news! Your booking has been confirmed:</p>
              
              <div style="background: #f0fdf4; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #059669;">
                <p style="margin: 0; padding: 5px 0;"><strong>Date:</strong> ${data.date}</p>
                <p style="margin: 0; padding: 5px 0;"><strong>Time:</strong> ${data.time}</p>
                <p style="margin: 0; padding: 5px 0;"><strong>Reading Type:</strong> ${data.serviceType}</p>
              </div>
              
              <p>Please arrive 5 minutes early for your appointment.</p>
              <p>Looking forward to connecting with you!</p>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b;">
                <p>Best regards,<br>Elizabeth Carol</p>
                <p style="font-size: 12px;">📧 info@elizabethcarol.co.uk | 📞 01865 361 786</p>
              </div>
            </div>
          ` : `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #dc2626; margin: 0;">Elizabeth Carol</h1>
                <p style="color: #64748b; margin: 5px 0;">Spiritual Guidance & Psychic Readings</p>
              </div>
              
              <h2 style="color: #dc2626;">Booking Request Update 📅</h2>
              <p>Dear ${data.customerName},</p>
              <p>Thank you for your interest. Unfortunately, the requested time slot is no longer available:</p>
              
              <div style="background: #fefce8; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #eab308;">
                <p style="margin: 0; padding: 5px 0;"><strong>Date:</strong> ${data.date}</p>
                <p style="margin: 0; padding: 5px 0;"><strong>Time:</strong> ${data.time}</p>
              </div>
              
              <p>Please visit our booking page to select an alternative time slot.</p>
              
              <p style="text-align: center;">
                <a href="https://www.elizabethcarol.co.uk/book" style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Book Another Time</a>
              </p>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b;">
                <p>Best regards,<br>Elizabeth Carol</p>
                <p style="font-size: 12px;">📧 info@elizabethcarol.co.uk | 📞 01865 361 786</p>
              </div>
            </div>
          `
        };
        
        const approvalResult = await transporter.sendMail(approvalEmail);
        console.log(`✅ Booking ${data.approved ? 'approval' : 'decline'} email sent to:`, data.customerEmail);
        console.log('📧 Email result:', approvalResult);
        emailSent = true;
        break;

      default:
        return {
          statusCode: 400,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type",
          },
          body: JSON.stringify({ message: 'Invalid email type' })
        };
    }

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({ 
        success: true,
        message: emailSent ? 'Email sent successfully' : 'Email skipped'
      })
    };

  } catch (error) {
    console.error('=== CRITICAL ERROR IN BOOKING EMAIL FUNCTION ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({ 
        success: false,
        message: 'Failed to send email',
        error: error.message,
        errorType: error.constructor.name
      })
    };
  }
}; 