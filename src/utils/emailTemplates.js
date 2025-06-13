// Beautiful email templates for Elizabeth Carol's spiritual communications
// Designed to be mobile-responsive, elegant, and mystical

export const createNewsletterTemplate = ({ 
  subscriberName = 'Beautiful Soul', 
  subject, 
  content, 
  websiteUrl = 'https://www.elizabethcarol.co.uk'
}) => {
  const currentDate = new Date().toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return {
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
    <style>
        /* Reset styles */
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        /* Email client specific styles */
        body, table, td, p, a, li, blockquote {
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }
        
        /* Main container */
        .email-container {
            font-family: 'Georgia', 'Times New Roman', serif;
            max-width: 600px;
            margin: 0 auto;
            background: linear-gradient(135deg, #1e1b4b 0%, #4c1d95 50%, #7c3aed 100%);
            border-radius: 0;
            overflow: hidden;
        }
        
        /* Header section */
        .header {
            background: linear-gradient(135deg, rgba(30, 27, 75, 0.95), rgba(76, 29, 149, 0.95)), 
                        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="stars" patternUnits="userSpaceOnUse" width="20" height="20"><circle cx="2" cy="2" r="0.5" fill="rgba(255,255,255,0.3)"/><circle cx="12" cy="8" r="0.3" fill="rgba(255,255,255,0.2)"/><circle cx="18" cy="15" r="0.4" fill="rgba(255,255,255,0.25)"/></pattern></defs><rect width="100" height="100" fill="url(%23stars)"/></svg>');
            padding: 40px 20px;
            text-align: center;
            position: relative;
        }
        
        .logo-container {
            margin-bottom: 20px;
        }
        
        .logo {
            max-width: 200px;
            height: auto;
        }
        
        .header-title {
            color: #ffffff;
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        
        .header-subtitle {
            color: #e0e7ff;
            font-size: 16px;
            font-style: italic;
        }
        
        /* Content section */
        .content {
            background: #ffffff;
            padding: 40px 30px;
            position: relative;
        }
        
        .greeting {
            color: #4c1d95;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 20px;
        }
        
        .content-body {
            color: #374151;
            font-size: 16px;
            line-height: 1.7;
            margin-bottom: 30px;
        }
        
        .content-body p {
            margin-bottom: 16px;
        }
        
        .content-body h2 {
            color: #4c1d95;
            font-size: 22px;
            margin: 30px 0 15px 0;
            border-bottom: 2px solid #e0e7ff;
            padding-bottom: 10px;
        }
        
        .content-body h3 {
            color: #6d28d9;
            font-size: 18px;
            margin: 25px 0 10px 0;
        }
        
        /* Special sections */
        .highlight-box {
            background: linear-gradient(135deg, #f3e8ff, #e0e7ff);
            border-left: 4px solid #7c3aed;
            padding: 20px;
            margin: 25px 0;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .quote-section {
            background: #faf8ff;
            border: 1px solid #e0e7ff;
            border-radius: 12px;
            padding: 25px;
            margin: 25px 0;
            text-align: center;
            position: relative;
        }
        
        .quote-section::before {
            content: '"';
            font-size: 60px;
            color: #c4b5fd;
            position: absolute;
            top: 10px;
            left: 20px;
            font-family: serif;
        }
        
        .quote-text {
            font-style: italic;
            font-size: 18px;
            color: #4c1d95;
            margin: 10px 0;
        }
        
        /* Call to action */
        .cta-section {
            text-align: center;
            margin: 35px 0;
        }
        
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #7c3aed, #4c1d95);
            color: #ffffff !important;
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 25px;
            font-weight: bold;
            font-size: 16px;
            box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
            transition: all 0.3s ease;
        }
        
        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(124, 58, 237, 0.4);
        }
        
        /* Footer */
        .footer {
            background: linear-gradient(135deg, #1f2937, #374151);
            color: #d1d5db;
            padding: 30px 20px;
            text-align: center;
        }
        
        .footer-logo {
            max-width: 150px;
            height: auto;
            margin-bottom: 20px;
            opacity: 0.8;
        }
        
        .footer-content {
            font-size: 14px;
            line-height: 1.6;
        }
        
        .footer-content strong {
            color: #ffffff;
        }
        
        .contact-info {
            margin: 15px 0;
        }
        
        .contact-info a {
            color: #c4b5fd;
            text-decoration: none;
        }
        
        .unsubscribe {
            font-size: 12px;
            color: #9ca3af;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #4b5563;
        }
        
        /* Mobile responsive */
        @media screen and (max-width: 600px) {
            .email-container {
                width: 100% !important;
                margin: 0 !important;
            }
            
            .header {
                padding: 30px 15px !important;
            }
            
            .content {
                padding: 30px 20px !important;
            }
            
            .header-title {
                font-size: 24px !important;
            }
            
            .greeting {
                font-size: 20px !important;
            }
            
            .content-body {
                font-size: 15px !important;
            }
            
            .logo {
                max-width: 150px !important;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <div class="logo-container">
                <img src="${websiteUrl}/images/elizabeth-carol-logo-full-dark.png" alt="Elizabeth Carol" class="logo">
            </div>
            <h1 class="header-title">Spiritual Insights & Guidance</h1>
            <p class="header-subtitle">From Elizabeth Carol • ${currentDate}</p>
        </div>
        
        <!-- Main Content -->
        <div class="content">
            <h2 class="greeting">Hello ${subscriberName},</h2>
            
            <div class="content-body">
                ${content}
            </div>
            
            <div class="cta-section">
                <a href="${websiteUrl}/contact" class="cta-button">Book Your Reading</a>
            </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <img src="${websiteUrl}/images/elizabeth-carol-logo-icon-trans.png" alt="Elizabeth Carol" class="footer-logo">
            
            <div class="footer-content">
                <strong>Elizabeth Carol</strong><br>
                Psychic Medium & Spiritual Guide<br>
                35+ Years of Spiritual Guidance
                
                <div class="contact-info">
                    <strong>Phone:</strong> <a href="tel:01865361786">01865 361 786</a><br>
                    <strong>Email:</strong> <a href="mailto:info@elizabethcarol.co.uk">info@elizabethcarol.co.uk</a><br>
                    <strong>Website:</strong> <a href="${websiteUrl}">${websiteUrl}</a><br>
                    <strong>Location:</strong> Oxford, Oxfordshire, UK
                </div>
                
                <div class="unsubscribe">
                    You're receiving this because you subscribed to spiritual insights from Elizabeth Carol.<br>
                    To unsubscribe, simply reply to this email with "unsubscribe" in the subject line.<br>
                    <br>
                    <em>May your journey be filled with light and wisdom.</em> ✨
                </div>
            </div>
        </div>
    </div>
</body>
</html>
    `,
    
    text: `
ELIZABETH CAROL - SPIRITUAL INSIGHTS & GUIDANCE
${currentDate}

Hello ${subscriberName},

${content.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ')}

---

Book Your Reading: ${websiteUrl}/contact

ELIZABETH CAROL
Psychic Medium & Spiritual Guide
35+ Years of Spiritual Guidance

Phone: 01865 361 786
Email: info@elizabethcarol.co.uk
Website: ${websiteUrl}
Location: Oxford, Oxfordshire, UK

You're receiving this because you subscribed to spiritual insights from Elizabeth Carol.
To unsubscribe, simply reply to this email with "unsubscribe" in the subject line.

May your journey be filled with light and wisdom.
    `
  };
};

// Create a contact form enquiry template (for business)
export const createContactEnquiryTemplate = ({ 
  customerName, 
  customerEmail, 
  customerPhone, 
  service, 
  message, 
  websiteUrl = 'https://www.elizabethcarol.co.uk' 
}) => {
  const currentDate = new Date().toLocaleString('en-GB', {
    timeZone: 'Europe/London',
    dateStyle: 'full',
    timeStyle: 'short'
  });

  return {
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Enquiry from ${customerName}</title>
    <style>
        body { 
            font-family: 'Georgia', 'Times New Roman', serif; 
            margin: 0; 
            padding: 20px; 
            background-color: #f8fafc; 
        }
        .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white; 
            border-radius: 12px; 
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .header { 
            background: linear-gradient(135deg, #4c1d95, #7c3aed); 
            color: white; 
            padding: 30px; 
            text-align: center; 
        }
        .content { 
            padding: 30px; 
        }
        .enquiry-box { 
            background: #f8fafc; 
            border-left: 4px solid #7c3aed; 
            padding: 20px; 
            margin: 20px 0; 
            border-radius: 8px;
        }
        .contact-details { 
            background: #faf8ff; 
            padding: 20px; 
            border-radius: 8px; 
            margin: 20px 0;
        }
        .label { 
            font-weight: bold; 
            color: #4c1d95; 
            margin-bottom: 5px;
        }
        .value { 
            margin-bottom: 15px; 
            color: #374151;
        }
        .message-content { 
            background: white; 
            padding: 15px; 
            border-radius: 6px; 
            border: 1px solid #e0e7ff;
            white-space: pre-wrap;
            font-size: 15px;
            line-height: 1.6;
        }
        .footer { 
            background: #f3f4f6; 
            padding: 20px; 
            text-align: center; 
            font-size: 12px; 
            color: #6b7280;
        }
        .quick-actions {
            text-align: center;
            margin: 25px 0;
        }
        .quick-actions a {
            display: inline-block;
            margin: 0 10px;
            padding: 10px 20px;
            background: #7c3aed;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📧 New Website Enquiry</h1>
            <p>Received ${currentDate}</p>
        </div>
        
        <div class="content">
            <div class="contact-details">
                <div class="label">Customer Name:</div>
                <div class="value">${customerName}</div>
                
                <div class="label">Email Address:</div>
                <div class="value"><a href="mailto:${customerEmail}" style="color: #7c3aed;">${customerEmail}</a></div>
                
                ${customerPhone ? `
                <div class="label">Phone Number:</div>
                <div class="value"><a href="tel:${customerPhone}" style="color: #7c3aed;">${customerPhone}</a></div>
                ` : ''}
                
                ${service ? `
                <div class="label">Service Interest:</div>
                <div class="value"><strong>${service}</strong></div>
                ` : ''}
            </div>
            
            <div class="enquiry-box">
                <div class="label">Customer Message:</div>
                <div class="message-content">${message}</div>
            </div>
            
            <div class="quick-actions">
                <a href="mailto:${customerEmail}?subject=Re: Your spiritual reading enquiry">Reply to Customer</a>
                <a href="tel:${customerPhone}">Call Customer</a>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>Elizabeth Carol - Spiritual Guidance</strong></p>
            <p>This enquiry was submitted through your website contact form.<br>
            The customer has been sent an automatic confirmation email.</p>
        </div>
    </div>
</body>
</html>
    `,
    
    text: `
NEW WEBSITE ENQUIRY - ${currentDate}

Customer Details:
Name: ${customerName}
Email: ${customerEmail}
${customerPhone ? `Phone: ${customerPhone}` : ''}
${service ? `Service Interest: ${service}` : ''}

Message:
${message}

---
This enquiry was submitted through your website contact form.
The customer has been sent an automatic confirmation email.
Please respond directly to: ${customerEmail}
    `
  };
};

// Create customer confirmation template  
export const createCustomerConfirmationTemplate = ({ 
  customerName, 
  customerEmail, 
  customerPhone, 
  service, 
  message, 
  websiteUrl = 'https://www.elizabethcarol.co.uk' 
}) => {
  return {
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thank you for contacting Elizabeth Carol</title>
    <style>
        body { 
            font-family: 'Georgia', 'Times New Roman', serif; 
            margin: 0; 
            padding: 20px; 
            background-color: #f8fafc; 
        }
        .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white; 
            border-radius: 12px; 
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .header { 
            background: linear-gradient(135deg, #4c1d95, #7c3aed); 
            color: white; 
            padding: 40px 30px; 
            text-align: center; 
        }
        .content { 
            padding: 40px 30px; 
        }
        .message-summary { 
            background: #f8fafc; 
            border-left: 4px solid #7c3aed; 
            padding: 20px; 
            margin: 25px 0; 
            border-radius: 8px;
        }
        .cta-section {
            text-align: center;
            margin: 30px 0;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #7c3aed, #4c1d95);
            color: white;
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 25px;
            font-weight: bold;
            margin: 0 10px 10px 0;
        }
        .footer { 
            background: linear-gradient(135deg, #1f2937, #374151); 
            color: #d1d5db; 
            padding: 30px; 
            text-align: center; 
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✨ Thank You ${customerName}</h1>
            <p>Your spiritual journey inquiry has been received</p>
        </div>
        
        <div class="content">
            <p>Dear ${customerName},</p>
            
            <p>Thank you for reaching out through my website. I've received your message and wanted to confirm that it came through successfully. I'm honored that you're considering me for your spiritual guidance.</p>
            
            <div class="message-summary">
                <h3 style="color: #4c1d95; margin-top: 0;">Your Message Details:</h3>
                <p><strong>Name:</strong> ${customerName}</p>
                <p><strong>Email:</strong> ${customerEmail}</p>
                ${customerPhone ? `<p><strong>Phone:</strong> ${customerPhone}</p>` : ''}
                ${service ? `<p><strong>Service Interest:</strong> ${service}</p>` : ''}
                
                <p><strong>Your Message:</strong></p>
                <div style="background: white; padding: 15px; border-radius: 6px; margin-top: 10px; white-space: pre-wrap;">
${message}
                </div>
            </div>
            
            <p>I typically respond to all enquiries within 24 hours during my normal working hours. For urgent matters, please feel free to call me directly at <strong>01865 361 786</strong>.</p>
            
            <p>I look forward to connecting with you soon and helping you on your spiritual journey.</p>
            
            <div class="cta-section">
                <a href="tel:01865361786" class="cta-button">📞 Call Me</a>
                <a href="${websiteUrl}/about" class="cta-button">✨ Learn About Me</a>
            </div>
            
            <p><em>With love and light,</em><br><strong>Elizabeth Carol</strong></p>
        </div>
        
        <div class="footer">
            <p><strong>Elizabeth Carol</strong><br>
            Psychic Medium & Spiritual Guide<br>
            35+ Years of Spiritual Guidance</p>
            
            <p>Phone: 01865 361 786<br>
            Email: info@elizabethcarol.co.uk<br>
            Website: ${websiteUrl}<br>
            Oxford, Oxfordshire, UK</p>
            
            <p style="font-size: 12px; margin-top: 20px; opacity: 0.8;">
                This is an automated confirmation. Please do not reply to this email - 
                I will respond to your enquiry from my main email address.
            </p>
        </div>
    </div>
</body>
</html>
    `,
    
    text: `
THANK YOU ${customerName.toUpperCase()}

Thank you for reaching out through my website. I've received your message and wanted to confirm that it came through successfully.

Your Message Details:
Name: ${customerName}
Email: ${customerEmail}
${customerPhone ? `Phone: ${customerPhone}` : ''}
${service ? `Service Interest: ${service}` : ''}

Your Message:
${message}

I typically respond to all enquiries within 24 hours. For urgent matters, please call me directly at 01865 361 786.

I look forward to connecting with you soon and helping you on your spiritual journey.

With love and light,
Elizabeth Carol

---
Elizabeth Carol
Psychic Medium & Spiritual Guide
35+ Years of Spiritual Guidance
Phone: 01865 361 786
Email: info@elizabethcarol.co.uk
Website: ${websiteUrl}
Oxford, Oxfordshire, UK

This is an automated confirmation. Please do not reply to this email - I will respond to your enquiry from my main email address.
    `
  };
}; 