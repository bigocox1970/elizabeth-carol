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
        body, table, td, p, a, li, blockquote {
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
            margin: 0;
            padding: 0;
        }
        
        body {
            font-family: 'Georgia', 'Times New Roman', serif;
            background-color: #f8fafc;
        }
        
        table {
            border-collapse: collapse;
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
        }
        
        /* Colors for easy reuse - Elizabeth Carol brand colors */
        .purple-bg { background-color: #1f2937; }
        .light-purple-bg { background-color: #f3e8ff; }
        .white-bg { background-color: #ffffff; }
        .dark-bg { background-color: #1f2937; }
        
        .purple-text { color: #374151; }
        .white-text { color: #ffffff; }
        .gray-text { color: #374151; }
        .light-gray-text { color: #9ca3af; }
        
        /* Button styling */
        .btn {
            background-color: #1f2937;
            color: #ffffff;
            text-decoration: none;
            padding: 12px 24px;
            font-weight: bold;
            border: 2px solid #1f2937;
            display: inline-block;
        }
    </style>
</head>
<body>
    <center>
        <!-- Main Email Container -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f1f5f9;">
            <tr>
                <td align="center" valign="top" style="padding: 20px 0;">
                    <table border="0" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                        
                        <!-- Header Section -->
                        <tr>
                            <td align="center" valign="top" style="background-color: #1f2937; padding: 40px 20px;">
                                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                    <tr>
                                        <td align="center" style="padding-bottom: 20px;">
                                            <img src="${websiteUrl}/images/elizabeth-carol-logo-full-dark.png" alt="Elizabeth Carol" style="width: 100%; max-width: 400px; height: auto; display: block;">
                                        </td>
                                    </tr>
                                    <tr>
                                        <td align="center" style="color: #ffffff; font-size: 24px; font-weight: bold; padding-bottom: 10px;">
                                            ✨ Spiritual Insights & Guidance ✨
                                        </td>
                                    </tr>
                                    <tr>
                                        <td align="center" style="color: #e0e7ff; font-size: 16px; font-style: italic;">
                                            From Elizabeth Carol • ${currentDate}
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        
                        <!-- Content Section -->
                        <tr>
                            <td align="left" valign="top" style="background-color: #ffffff; padding: 40px 30px;">
                                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                    <tr>
                                        <td style="color: #374151; font-size: 24px; font-weight: bold; padding-bottom: 20px;">
                                            Hello ${subscriberName},
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="color: #374151; font-size: 16px; line-height: 1.7; padding-bottom: 30px;">
                                            ${content}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td align="center" style="padding: 20px 0;">
                                            <a href="${websiteUrl}/contact" class="btn" style="background-color: #1f2937; color: #ffffff; text-decoration: none; padding: 15px 30px; font-weight: bold; border: 2px solid #1f2937; display: inline-block;">
                                                📞 Book Your Reading
                                            </a>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        
                        <!-- Footer Section -->
                        <tr>
                            <td align="center" valign="top" style="background-color: #1f2937; padding: 30px 20px;">
                                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                    <tr>
                                        <td align="center" style="padding-bottom: 20px;">
                                            <img src="${websiteUrl}/images/elizabeth-carol-logo-icon-trans.png" alt="Elizabeth Carol" style="width: 80px; height: auto; display: block;">
                                        </td>
                                    </tr>
                                    <tr>
                                        <td align="center" style="color: #ffffff; font-weight: bold; font-size: 18px; padding-bottom: 10px;">
                                            Elizabeth Carol
                                        </td>
                                    </tr>
                                    <tr>
                                        <td align="center" style="color: #d1d5db; font-size: 14px; line-height: 1.6;">
                                            Psychic Medium & Spiritual Guide<br>
                                            35+ Years of Spiritual Guidance
                                        </td>
                                    </tr>
                                    <tr>
                                        <td align="center" style="color: #d1d5db; font-size: 14px; line-height: 1.6; padding: 15px 0;">
                                            <strong style="color: #ffffff;">Phone:</strong> <a href="tel:01865361786" style="color: #c4b5fd; text-decoration: none;">01865 361 786</a><br>
                                            <strong style="color: #ffffff;">Email:</strong> <a href="mailto:info@elizabethcarol.co.uk" style="color: #c4b5fd; text-decoration: none;">info@elizabethcarol.co.uk</a><br>
                                            <strong style="color: #ffffff;">Website:</strong> <a href="${websiteUrl}" style="color: #c4b5fd; text-decoration: none;">${websiteUrl}</a><br>
                                            <strong style="color: #ffffff;">Location:</strong> Oxford, Oxfordshire, UK
                                        </td>
                                    </tr>
                                    <tr>
                                        <td align="center" style="color: #9ca3af; font-size: 12px; padding-top: 20px; border-top: 1px solid #4b5563;">
                                            You're receiving this because you subscribed to spiritual insights from Elizabeth Carol.<br>
                                            To unsubscribe, simply reply to this email with "unsubscribe" in the subject line.<br>
                                            <br>
                                            <em style="color: #c4b5fd;">May your journey be filled with light and wisdom.</em> ✨
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        
                    </table>
                </td>
            </tr>
        </table>
    </center>
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
            background-color: #f1f5f9; 
        }
        .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white; 
            border: 1px solid #e2e8f0;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .header { 
            background-color: #1f2937; 
            color: white; 
            padding: 30px; 
            text-align: center; 
        }
        .content { 
            padding: 30px; 
        }
        .enquiry-box { 
            background: #f8fafc; 
            border-left: 4px solid #1f2937; 
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
            color: #374151; 
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
            background: #1f2937;
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
                <div class="value"><a href="mailto:${customerEmail}" style="color: #1f2937;">${customerEmail}</a></div>
                
                ${customerPhone ? `
                <div class="label">Phone Number:</div>
                <div class="value"><a href="tel:${customerPhone}" style="color: #1f2937;">${customerPhone}</a></div>
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
            background-color: #f1f5f9; 
        }
        .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white; 
            border: 1px solid #e2e8f0;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .header { 
            background-color: #1f2937; 
            color: white; 
            padding: 40px 30px; 
            text-align: center; 
        }
        .content { 
            padding: 40px 30px; 
        }
        .message-summary { 
            background: #f8fafc; 
            border-left: 4px solid #1f2937; 
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
            background: #1f2937;
            color: white;
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 25px;
            font-weight: bold;
            margin: 0 10px 10px 0;
        }
        .footer { 
            background-color: #1f2937; 
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
                <h3 style="color: #374151; margin-top: 0;">Your Message Details:</h3>
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