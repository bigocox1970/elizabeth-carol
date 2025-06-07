// This function verifies the admin password without exposing it in the frontend code

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ message: 'Method not allowed' })
    };
  }

  try {
    // Parse the request body
    const { password } = JSON.parse(event.body);
    
    // Get the admin password from environment variable
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    // Log for debugging (don't log the actual passwords in production)
    console.log('Admin password verification:', {
      passwordProvided: password ? 'Yes' : 'No',
      envPasswordSet: adminPassword ? 'Yes' : 'No',
      environment: process.env.NODE_ENV || 'development'
    });
    
    // For development and testing, use a fallback password if the environment variable is not set
    // In production, this should be properly set in the Netlify dashboard
    const isDevelopment = process.env.NODE_ENV !== 'production';
    const usePassword = adminPassword || (isDevelopment ? 'elizabeth2024' : null);
    
    // Check if the admin password is set
    if (!usePassword) {
      console.error('ADMIN_PASSWORD environment variable is not set in production');
      return {
        statusCode: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ 
          success: false,
          message: 'Server configuration error: Admin password not set'
        })
      };
    }
    
    // Verify the password
    const isValid = password === usePassword;
    
    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ 
        success: isValid,
        message: isValid ? 'Authentication successful' : 'Invalid password'
      })
    };
  } catch (error) {
    console.error('Error verifying admin password:', error);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ 
        success: false,
        message: 'Server error during verification'
      })
    };
  }
};
