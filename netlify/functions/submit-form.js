exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed",
    };
  }

  try {
    const { formName, ...formData } = JSON.parse(event.body);
    
    // Log the submission (you can integrate with email services here)
    console.log(`Form submission for ${formName}:`, formData);
    
    // For now, just return success
    // In production, you'd integrate with an email service like:
    // - Sendgrid
    // - Mailgun
    // - AWS SES
    // - Nodemailer with SMTP
    
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({
        success: true,
        message: "Form submitted successfully"
      }),
    };
    
  } catch (error) {
    console.error("Form submission error:", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({
        success: false,
        message: "Form submission failed"
      }),
    };
  }
}; 