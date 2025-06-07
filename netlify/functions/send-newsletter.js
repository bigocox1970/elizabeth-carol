const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');

// Get Supabase credentials from environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

exports.handler = async (event, context) => {
  console.log('=== NEWSLETTER FUNCTION START ===');
  console.log('Environment check:', {
    SUPABASE_URL: SUPABASE_URL ? 'SET' : 'MISSING',
    SUPABASE_ANON_KEY: SUPABASE_ANON_KEY ? 'SET' : 'MISSING',
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ? 'SET' : 'MISSING'
  });

  if (event.httpMethod !== 'POST') {
    console.log('Method not allowed:', event.httpMethod);
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method not allowed' })
    };
  }

  console.log('Request body:', event.body);
  
  try {
    const { subject, message, password } = JSON.parse(event.body);
    console.log('Parsed request:', {
      subject: subject ? 'PROVIDED' : 'MISSING',
      message: message ? 'PROVIDED' : 'MISSING', 
      password: password ? 'PROVIDED' : 'MISSING'
    });

    // Get admin password from environment variable
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    console.log('Password check:', {
      providedPassword: password ? 'Provided' : 'Missing',
      envPassword: process.env.ADMIN_PASSWORD ? 'Set' : 'Not set'
    });

    // For development and testing, use a fallback password if the environment variable is not set
    // In production, this should be properly set in the Netlify dashboard
    const isDevelopment = process.env.NODE_ENV !== 'production';
    const usePassword = adminPassword || (isDevelopment ? 'elizabeth2024' : null);
    
    if (!usePassword) {
      console.error('ADMIN_PASSWORD environment variable is not set in production');
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Server configuration error: Admin password not set' })
      };
    }

    // Simple password verification
    if (password !== usePassword) {
      console.log('Password mismatch');
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Unauthorized' })
      };
    }

    // Basic validation
    if (!subject || !message) {
      console.log('Missing subject or message');
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Subject and message are required' })
      };
    }

    console.log('=== STARTING SUBSCRIBER FETCH ===');

    // Get subscribers from Supabase
    let subscribers = [];
    
    try {
      console.log('Fetching subscribers from Supabase...');
      const url = `${SUPABASE_URL}/rest/v1/subscribers?select=*`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Supabase fetch error:', errorText);
        throw new Error(`Failed to fetch subscribers: ${response.status} - ${errorText}`);
      }

      const supabaseSubscribers = await response.json();
      console.log('=== SUPABASE RESPONSE SUCCESS ===');
      console.log('Number of subscribers found:', supabaseSubscribers.length);
      
      if (supabaseSubscribers.length > 0) {
        console.log('First subscriber raw data:', JSON.stringify(supabaseSubscribers[0], null, 2));
        console.log('All subscribers raw data:', JSON.stringify(supabaseSubscribers, null, 2));
      }
      
      // Just use all subscribers for now to test
      const activeSubscribers = supabaseSubscribers;
      console.log(`Total subscribers: ${supabaseSubscribers.length}, Active: ${activeSubscribers.length}`);
      
      // Debug the mapping process
      subscribers = activeSubscribers.map(sub => {
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
         body: JSON.stringify({ 
           message: 'Failed to retrieve subscribers from database',
           error: supabaseError.message
         })
       };
     }

    if (subscribers.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'No active subscribers found' })
      };
    }

    // Setup email transporter
    console.log('=== EMAIL SETUP ===');
    console.log('Email credentials:', {
      user: process.env.EMAIL_USER ? 'SET' : 'MISSING',
      pass: process.env.EMAIL_PASSWORD ? 'SET' : 'MISSING'
    });
    
    const transporter = nodemailer.createTransport({
      host: 'smtpout.secureserver.net',
      port: 587,
      secure: false,
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
    const emailPromises = subscribers.map(async (subscriber, index) => {
      try {
        console.log(`Sending email ${index + 1} to:`, subscriber.email);
        const personalizedMessage = message.replace(/\n/g, '<br>');
        
        const mailOptions = {
          from: '"Elizabeth Carol" <info@elizabethcarol.co.uk>',
          to: subscriber.email,
          subject: subject,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #4c1d95;">Hello ${subscriber.name || 'Friend'},</h2>
              
              <div style="margin: 20px 0;">
                ${personalizedMessage}
              </div>
              
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
              
              <p style="font-size: 14px; color: #666; margin: 20px 0;">
                <strong>Elizabeth Carol</strong><br>
                Psychic Medium & Spiritual Guide<br>
                Phone: 01865 361 786<br>
                Email: info@elizabethcarol.co.uk
              </p>
              
              <p style="font-size: 12px; color: #999; margin-top: 30px;">
                You're receiving this because you subscribed to updates from Elizabeth Carol. 
                To unsubscribe, simply reply to this email with "unsubscribe" in the subject line.
              </p>
            </div>
          `,
          text: `
Hello ${subscriber.name || 'Friend'},

${message}

---
Elizabeth Carol
Psychic Medium & Spiritual Guide
Phone: 01865 361 786
Email: info@elizabethcarol.co.uk

You're receiving this because you subscribed to updates from Elizabeth Carol. 
To unsubscribe, simply reply to this email with "unsubscribe" in the subject line.
          `
        };

        const result = await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${subscriber.email}:`, result.messageId);
        sentCount++;
      } catch (error) {
        console.error(`Failed to send to ${subscriber.email}:`, error.message);
        console.error('Full error:', error);
      }
    });

    await Promise.all(emailPromises);

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: `Newsletter sent successfully to ${sentCount} subscribers!`,
        sentCount: sentCount,
        totalSubscribers: subscribers.length
      })
    };

  } catch (error) {
    console.error('Error sending newsletter:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to send newsletter' })
    };
  }
};
