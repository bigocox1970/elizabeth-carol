const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

exports.handler = async (event, context) => {
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
    const { firstName, lastName, email, phone, service, message } = JSON.parse(event.body);

    // Basic validation
    if (!firstName || !lastName || !email || !message) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type",
        },
        body: JSON.stringify({ message: 'Required fields missing' })
      };
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type",
        },
        body: JSON.stringify({ message: 'Invalid email address' })
      };
    }

    // Log the contact form submission
    console.log('Contact form submission:', {
      firstName,
      lastName,
      email,
      phone,
      service,
      message,
      dateSubmitted: new Date().toISOString()
    });

    // Add to subscriber list automatically (check if email already exists first)
    try {
      const checkResponse = await fetch(`${SUPABASE_URL}/rest/v1/subscribers?email=eq.${email.toLowerCase()}&select=email`, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      if (checkResponse.ok) {
        const existingUsers = await checkResponse.json();
        
        if (existingUsers.length === 0) {
          // Add to subscriber list
          const insertResponse = await fetch(`${SUPABASE_URL}/rest/v1/subscribers`, {
            method: 'POST',
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
              email: email.toLowerCase(),
              name: `${firstName} ${lastName}`,
              source: 'contact_form',
              date_added: new Date().toISOString(),
              active: true
            })
          });

          if (insertResponse.ok) {
            console.log('Added to subscriber list from contact form');
          }
        }
      }
    } catch (subscriberError) {
      console.error('Failed to add to subscriber list:', subscriberError);
      // Don't fail the contact form if subscriber addition fails
    }

    // Send confirmation email to user if email credentials are available
    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
      try {
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

        const confirmationEmail = {
          from: '"Elizabeth Carol" <info@elizabethcarol.co.uk>',
          to: email,
          subject: 'Thank you for contacting Elizabeth Carol',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #4c1d95;">Hello ${firstName},</h2>
              
              <p>Thank you for reaching out to me through my website. I've received your message and wanted to confirm that it came through successfully.</p>
              
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #4c1d95; margin-top: 0;">Your Message Details:</h3>
                <p><strong>Name:</strong> ${firstName} ${lastName}</p>
                ${service ? `<p><strong>Service Interest:</strong> ${service}</p>` : ''}
                ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
                <p><strong>Message:</strong></p>
                <div style="background-color: white; padding: 15px; border-radius: 4px; margin-top: 10px;">
                  ${message.replace(/\n/g, '<br>')}
                </div>
              </div>
              
              <p>I typically respond to all enquiries within 24 hours. For urgent matters, please feel free to call me directly at <strong>01865 361 786</strong>.</p>
              
              <p>I look forward to connecting with you soon!</p>
              
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
              
              <p style="font-size: 14px; color: #666; margin: 20px 0;">
                <strong>Elizabeth Carol</strong><br>
                Psychic Medium & Spiritual Guide<br>
                Phone: 01865 361 786<br>
                Email: info@elizabethcarol.co.uk<br>
                Oxford, Oxfordshire, UK
              </p>
              
              <p style="font-size: 12px; color: #999; margin-top: 30px;">
                This is an automated confirmation. Please do not reply to this email - I will respond to your enquiry from my main email address.
              </p>
            </div>
          `,
          text: `
Hello ${firstName},

Thank you for reaching out to me through my website. I've received your message and wanted to confirm that it came through successfully.

Your Message Details:
Name: ${firstName} ${lastName}
${service ? `Service Interest: ${service}` : ''}
${phone ? `Phone: ${phone}` : ''}
Message: ${message}

I typically respond to all enquiries within 24 hours. For urgent matters, please feel free to call me directly at 01865 361 786.

I look forward to connecting with you soon!

---
Elizabeth Carol
Psychic Medium & Spiritual Guide
Phone: 01865 361 786
Email: info@elizabethcarol.co.uk
Oxford, Oxfordshire, UK

This is an automated confirmation. Please do not reply to this email - I will respond to your enquiry from my main email address.
          `
        };

        await transporter.sendMail(confirmationEmail);
        console.log('Confirmation email sent successfully to:', email);

        // CRITICAL: Send the enquiry to Elizabeth Carol's business email
        const businessEmail = {
          from: '"Website Contact Form" <info@elizabethcarol.co.uk>',
          to: 'info@elizabethcarol.co.uk',
          subject: `New Enquiry from ${firstName} ${lastName}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #4c1d95;">New Website Enquiry</h2>
              
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #4c1d95; margin-top: 0;">Contact Details:</h3>
                <p><strong>Name:</strong> ${firstName} ${lastName}</p>
                <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                ${phone ? `<p><strong>Phone:</strong> <a href="tel:${phone}">${phone}</a></p>` : ''}
                ${service ? `<p><strong>Service Interest:</strong> ${service}</p>` : ''}
                
                <h3 style="color: #4c1d95; margin-top: 20px;">Message:</h3>
                <div style="background-color: white; padding: 15px; border-radius: 4px; margin-top: 10px;">
                  ${message.replace(/\n/g, '<br>')}
                </div>
              </div>
              
              <p style="font-size: 14px; color: #666;">
                <strong>Submitted:</strong> ${new Date().toLocaleString('en-GB', { 
                  timeZone: 'Europe/London',
                  dateStyle: 'full',
                  timeStyle: 'short'
                })}<br>
                <strong>Source:</strong> Website Contact Form
              </p>
              
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
              
              <p style="font-size: 12px; color: #999;">
                The customer has been sent an automatic confirmation email. 
                Please respond to their enquiry directly at: ${email}
              </p>
            </div>
          `,
          text: `
NEW WEBSITE ENQUIRY

Contact Details:
Name: ${firstName} ${lastName}
Email: ${email}
${phone ? `Phone: ${phone}` : ''}
${service ? `Service Interest: ${service}` : ''}

Message:
${message}

---
Submitted: ${new Date().toLocaleString('en-GB', { 
  timeZone: 'Europe/London',
  dateStyle: 'full',
  timeStyle: 'short'
})}
Source: Website Contact Form

The customer has been sent an automatic confirmation email. 
Please respond to their enquiry directly at: ${email}
          `
        };

        await transporter.sendMail(businessEmail);
        console.log('Business enquiry email sent successfully to info@elizabethcarol.co.uk');

      } catch (emailError) {
        console.error('Failed to send emails:', emailError);
        // Don't fail the contact form if email sending fails
      }
    } else {
      console.log('Email credentials not configured - skipping emails');
    }

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({ 
        success: true,
        message: 'Message sent successfully! Elizabeth will get back to you soon.'
      })
    };

  } catch (error) {
    console.error('Contact form error:', error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({ 
        success: false,
        message: 'Failed to send message' 
      })
    };
  }
};
