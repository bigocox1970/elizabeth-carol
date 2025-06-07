const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method not allowed' })
    };
  }

  const { name, email, phone, message } = JSON.parse(event.body);

  // Basic validation
  if (!name || !email || !message) {
    return {
      statusCode: 400,
      body: JSON.stringify({ 
        message: 'Missing required fields: name, email, and message are required' 
      })
    };
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Invalid email address' })
    };
  }

  try {
    // Send contact email
    const transporter = nodemailer.createTransporter({
      host: 'smtpout.secureserver.net',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    const mailOptions = {
      from: '"Elizabeth Carol Website" <info@elizabethcarol.co.uk>',
      to: 'info@elizabethcarol.co.uk',
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
        
        <hr>
        <p><em>This email was sent from the Elizabeth Carol website contact form.</em></p>
      `,
      text: `
New Contact Form Submission

Name: ${name}
Email: ${email}
${phone ? `Phone: ${phone}` : ''}

Message:
${message}

---
This email was sent from the Elizabeth Carol website contact form.
      `
    };

    await transporter.sendMail(mailOptions);

    // Add to mailing list automatically
    try {
      let subscribers = [];
      const filePath = path.join(process.cwd(), 'data', 'subscribers.json');
      
      try {
        const data = await fs.readFile(filePath, 'utf8');
        subscribers = JSON.parse(data);
      } catch (err) {
        subscribers = [];
      }

      // Check if email already exists
      const existingSubscriber = subscribers.find(sub => sub.email.toLowerCase() === email.toLowerCase());
      
      if (!existingSubscriber) {
        subscribers.push({
          email: email.toLowerCase(),
          name: name,
          source: 'contact_form',
          dateAdded: new Date().toISOString(),
          active: true
        });

        await fs.writeFile(filePath, JSON.stringify(subscribers, null, 2));
      }
    } catch (err) {
      console.error('Failed to add to mailing list:', err);
      // Don't fail the contact form if mailing list fails
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: 'Message sent successfully! Elizabeth will get back to you soon.' 
      })
    };

  } catch (error) {
    console.error('Error sending email:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        message: 'Failed to send message. Please try again later.' 
      })
    };
  }
}; 