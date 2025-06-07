const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method not allowed' })
    };
  }

  const { subject, message, password } = JSON.parse(event.body);

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
    return {
      statusCode: 401,
      body: JSON.stringify({ message: 'Unauthorized' })
    };
  }

  // Basic validation
  if (!subject || !message) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Subject and message are required' })
    };
  }

  try {
    // Get subscribers
    const filePath = path.join(process.cwd(), 'data', 'subscribers.json');
    let subscribers = [];
    
    try {
      const data = await fs.readFile(filePath, 'utf8');
      subscribers = JSON.parse(data).filter(sub => sub.active);
    } catch (err) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'No subscribers found' })
      };
    }

    if (subscribers.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'No active subscribers found' })
      };
    }

    // Setup email transporter
    const transporter = nodemailer.createTransport({
      host: 'smtpout.secureserver.net',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // Send emails
    let sentCount = 0;
    const emailPromises = subscribers.map(async (subscriber) => {
      try {
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

        await transporter.sendMail(mailOptions);
        sentCount++;
      } catch (error) {
        console.error(`Failed to send to ${subscriber.email}:`, error);
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
