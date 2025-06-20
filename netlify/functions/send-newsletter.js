const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');

// Import our beautiful email templates
const { createNewsletterTemplate } = require('../../src/utils/emailTemplates.js');

// Get Supabase credentials from environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

exports.handler = async (event, context) => {
  console.log('=== NEWSLETTER FUNCTION STARTED ===');
  
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({ message: 'Method not allowed' })
    };
  }

  // Handle CORS preflight (OPTIONS requests only)
  if (event.httpMethod === 'OPTIONS') {
    const allowedOrigins = [
      'https://elizabethcarol.co.uk',
      'https://www.elizabethcarol.co.uk',
      'https://elizabethcarol.netlify.app',
      'http://localhost:3000'
    ];
    
    const origin = event.headers.origin || event.headers.Origin;
    if (allowedOrigins.includes(origin)) {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Methods': 'POST, OPTIONS'
        },
        body: JSON.stringify({ message: 'CORS preflight successful' })
      };
    }
  }

  console.log('Request body:', event.body);
  
  try {
    const { subject, message, sendToMode = 'all', selectedSubscribers } = JSON.parse(event.body);
    console.log('Parsed request body:', { 
      hasSubject: !!subject, 
      hasMessage: !!message,
      sendToMode,
      selectedSubscribersCount: selectedSubscribers?.length || 0
    });

    // Get the user's JWT token from the Authorization header
    const authHeader = event.headers.authorization || event.headers.Authorization;
    if (!authHeader) {
      console.log('No authorization header found');
      return {
        statusCode: 401,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Methods': 'POST, OPTIONS'
        },
        body: JSON.stringify({ message: 'No authorization token provided' })
      };
    }

    // Extract the token from the Bearer header
    const token = authHeader.replace('Bearer ', '');
    console.log('Token extracted, length:', token.length);

    // Verify the user is authenticated and is an admin
    try {
      // First, get the user ID from the token
      const userResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${token}`
        }
      });

      if (!userResponse.ok) {
        console.error('Failed to get user info:', await userResponse.text());
        return {
          statusCode: 401,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Allow-Methods': 'POST, OPTIONS'
          },
          body: JSON.stringify({ message: 'Invalid token' })
        };
      }

      const userData = await userResponse.json();
      console.log('User authenticated:', userData.email);

      // Verify the user is an admin
      const isAdminResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/is_admin`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_id: userData.id })
      });

      const isAdmin = await isAdminResponse.json();
      console.log('Admin check result:', isAdmin);

      if (!isAdmin) {
        console.log('User is not an admin');
        return {
          statusCode: 401,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Allow-Methods': 'POST, OPTIONS'
          },
          body: JSON.stringify({ message: 'Unauthorized' })
        };
      }

    } catch (error) {
      console.error('Error verifying token:', error);
      return {
        statusCode: 401,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Methods': 'POST, OPTIONS'
        },
        body: JSON.stringify({ message: 'Unauthorized' })
      };
    }

    // Basic validation
    if (!subject || !message) {
      console.log('Missing subject or message');
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Methods': 'POST, OPTIONS'
        },
        body: JSON.stringify({ message: 'Subject and message are required' })
      };
    }

    console.log('=== STARTING SUBSCRIBER FETCH ===');

    // Get subscribers from Supabase
    let subscribers = [];
    
    try {
      console.log('Fetching subscribers from Supabase...');
      console.log('Send mode:', sendToMode);
      console.log('Selected subscribers:', selectedSubscribers);
      
      // For now, always fetch all subscribers to avoid query issues
      let url = `${SUPABASE_URL}/rest/v1/subscribers?select=*&order=date_added.desc`;
      
      console.log('Making request to:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Supabase fetch error:', errorText);
        throw new Error(`Failed to fetch subscribers: ${response.status} - ${errorText}`);
      }

      const supabaseSubscribers = await response.json();
      console.log('=== SUPABASE RESPONSE SUCCESS ===');
      console.log('Number of subscribers found:', supabaseSubscribers.length);
      
      if (supabaseSubscribers.length === 0) {
        console.log('WARNING: No subscribers returned from database!');
      }
      
      // Filter for active subscribers only
      const activeSubscribers = supabaseSubscribers.filter(sub => sub.active !== false);
      console.log(`Total subscribers: ${supabaseSubscribers.length}, Active: ${activeSubscribers.length}`);
      
      // If sending to selected subscribers, filter the results
      let filteredSubscribers = activeSubscribers;
      if (sendToMode === 'selected' && selectedSubscribers && selectedSubscribers.length > 0) {
        console.log('Filtering for selected subscribers:', selectedSubscribers);
        filteredSubscribers = activeSubscribers.filter(sub => 
          selectedSubscribers.includes(sub.id.toString())
        );
        console.log(`Filtered to ${filteredSubscribers.length} selected subscribers`);
      }
      
      // Map to the format expected by email sending
      subscribers = filteredSubscribers.map(sub => {
        const mappedSubscriber = {
          email: sub.email,
          name: sub.name,
          active: sub.active
        };
        console.log('Mapped subscriber:', mappedSubscriber);
        return mappedSubscriber;
      });
      
      // Filter out any subscribers without email addresses
      const validSubscribers = subscribers.filter(sub => sub.email && sub.email.trim() !== '');
      console.log(`Subscribers with valid emails: ${validSubscribers.length} out of ${subscribers.length}`);
      
      subscribers = validSubscribers;
      console.log(`Found ${subscribers.length} valid subscribers for email sending`);
      
    } catch (supabaseError) {
      console.error('Failed to get subscribers from Supabase:', supabaseError);
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Methods': 'POST, OPTIONS'
        },
        body: JSON.stringify({ 
          message: 'Failed to retrieve subscribers from database',
          error: supabaseError.message
        })
      };
    }

    if (subscribers.length === 0) {
      const noSubscribersMessage = sendToMode === 'selected' 
        ? 'No selected subscribers found or they are inactive'
        : 'No active subscribers found';
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Methods': 'POST, OPTIONS'
        },
        body: JSON.stringify({ message: noSubscribersMessage })
      };
    }

    // Setup email transporter
    console.log('=== EMAIL SETUP ===');
    console.log('Email credentials:', {
      user: process.env.EMAIL_USER ? 'SET' : 'MISSING',
      pass: process.env.EMAIL_PASSWORD ? 'SET' : 'MISSING'
    });
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.error('CRITICAL: Email credentials are missing!');
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Methods': 'POST, OPTIONS'
        },
        body: JSON.stringify({ 
          message: 'Email configuration error: Missing credentials',
          error: 'EMAIL_USER or EMAIL_PASSWORD not set'
        })
      };
    }
    
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

    // Skip email verification for now - let individual sends handle errors
    console.log('Email transporter created, will test with actual sends');

    // Send emails
    console.log('=== SENDING EMAILS ===');
    console.log(`Attempting to send to ${subscribers.length} subscribers`);
    
    let sentCount = 0;
    let failedCount = 0;
    const emailPromises = subscribers.map(async (subscriber, index) => {
      try {
        console.log(`Sending email ${index + 1} to:`, subscriber.email);
        const personalizedMessage = message.replace(/\n/g, '<br>');
        
        // Create beautiful newsletter email using our template
        const emailTemplate = createNewsletterTemplate({
          subscriberName: subscriber.name || 'Beautiful Soul',
          subject: subject,
          content: personalizedMessage,
          websiteUrl: 'https://www.elizabethcarol.co.uk'
        });

        const mailOptions = {
          from: '"Elizabeth Carol - Spiritual Guidance" <info@elizabethcarol.co.uk>',
          to: subscriber.email,
          subject: subject,
          html: emailTemplate.html,
          text: emailTemplate.text
        };

        const result = await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${subscriber.email}:`, result.messageId);
        sentCount++;
        return { success: true, email: subscriber.email };
      } catch (error) {
        console.error(`Failed to send to ${subscriber.email}:`, error.message);
        console.error('Full error:', error);
        failedCount++;
        return { success: false, email: subscriber.email, error: error.message };
      }
    });

    const results = await Promise.all(emailPromises);
    
    console.log('=== EMAIL SENDING COMPLETE ===');
    console.log(`Sent: ${sentCount}, Failed: ${failedCount}, Total attempted: ${subscribers.length}`);
    console.log('Results summary:', results.map(r => ({ email: r.email, success: r.success })));

    const successMessage = sendToMode === 'selected' 
      ? `Newsletter sent successfully to ${sentCount} selected subscribers!`
      : `Newsletter sent successfully to ${sentCount} subscribers!`;

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({ 
        message: successMessage,
        sentCount: sentCount,
        failedCount: failedCount,
        totalSubscribers: subscribers.length,
        sendToMode: sendToMode
      })
    };

  } catch (error) {
    console.error('=== CRITICAL ERROR IN NEWSLETTER FUNCTION ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({ 
        message: 'Failed to send newsletter',
        error: error.message,
        errorType: error.constructor.name
      })
    };
  }
};
