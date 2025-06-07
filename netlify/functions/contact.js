const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');

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

    // Here you would typically:
    // 1. Send an email to Elizabeth with the contact details
    // 2. Send a confirmation email to the customer
    // 3. Add to mailing list if they opted in
    // 4. Save to a database or CRM

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