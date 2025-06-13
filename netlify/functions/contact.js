const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');

// Import our beautiful email templates
const { createContactEnquiryTemplate, createCustomerConfirmationTemplate } = require('../../src/utils/emailTemplates.js');
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

        // Create beautiful customer confirmation email
        const customerTemplate = createCustomerConfirmationTemplate({
          customerName: firstName,
          customerEmail: email,
          customerPhone: phone,
          service: service,
          message: message,
          websiteUrl: 'https://www.elizabethcarol.co.uk'
        });

        const confirmationEmail = {
          from: '"Elizabeth Carol - Spiritual Guidance" <info@elizabethcarol.co.uk>',
          to: email,
          subject: '✨ Thank you for contacting Elizabeth Carol',
          html: customerTemplate.html,
          text: customerTemplate.text
        };

        await transporter.sendMail(confirmationEmail);
        console.log('Confirmation email sent successfully to:', email);

        // CRITICAL: Send the enquiry to Elizabeth Carol's business email
        const businessTemplate = createContactEnquiryTemplate({
          customerName: `${firstName} ${lastName}`,
          customerEmail: email,
          customerPhone: phone,
          service: service,
          message: message,
          websiteUrl: 'https://www.elizabethcarol.co.uk'
        });

        const businessEmail = {
          from: '"Website Contact Form" <info@elizabethcarol.co.uk>',
          to: 'info@elizabethcarol.co.uk',
          subject: `📧 New Enquiry from ${firstName} ${lastName}`,
          html: businessTemplate.html,
          text: businessTemplate.text
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
