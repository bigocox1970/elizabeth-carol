const multipart = require('parse-multipart-data');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ message: 'Method not allowed' })
    };
  }

  try {
    // Get the user's JWT token from the Authorization header
    const authHeader = event.headers.authorization || event.headers.Authorization;
    if (!authHeader) {
      console.error('No authorization header provided');
      return {
        statusCode: 401,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ 
          success: false,
          message: 'No authorization token provided'
        })
      };
    }

    // Extract the token from the Bearer header
    const token = authHeader.replace('Bearer ', '');
    
    // Verify the user is an admin using Supabase
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return {
        statusCode: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ 
          success: false,
          message: 'Server configuration error: Supabase credentials not set'
        })
      };
    }
    
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
          headers: { "Access-Control-Allow-Origin": "*" },
          body: JSON.stringify({ 
            success: false,
            message: 'Invalid token'
          })
        };
      }

      const userData = await userResponse.json();

      // Now verify the user is an admin
      const isAdminResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/is_admin`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_id: userData.id })
      });

      if (!isAdminResponse.ok) {
        return {
          statusCode: 401,
          headers: { "Access-Control-Allow-Origin": "*" },
          body: JSON.stringify({ 
            success: false,
            message: 'Unauthorized: Not an admin user'
          })
        };
      }

      const isAdmin = await isAdminResponse.json();
      if (!isAdmin) {
        return {
          statusCode: 401,
          headers: { "Access-Control-Allow-Origin": "*" },
          body: JSON.stringify({ 
            success: false,
            message: 'Unauthorized: Not an admin user'
          })
        };
      }
    } catch (error) {
      console.error('Error verifying admin status:', error);
      return {
        statusCode: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ 
          success: false,
          message: 'Server error during authentication'
        })
      };
    }

    // Parse multipart form data
    const boundary = event.headers['content-type']?.split('boundary=')[1];
    if (!boundary) {
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ message: 'Invalid content type' })
      };
    }

    const parts = multipart.parse(Buffer.from(event.body, 'base64'), boundary);
    
    // Find the image file
    let imageFile = null;
    
    for (const part of parts) {
      if (part.name === 'file') {
        imageFile = part;
      }
    }

    if (!imageFile) {
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ message: 'No image file provided' })
      };
    }

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Generate unique filename
    const timestamp = Date.now();
    const extension = imageFile.filename.split('.').pop();
    const filename = `${timestamp}.${extension}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('blog-images')
      .upload(filename, imageFile.data, {
        contentType: imageFile.type,
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      return {
        statusCode: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ message: 'Failed to upload image' })
      };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('blog-images')
      .getPublicUrl(filename);

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ 
        success: true,
        url: urlData.publicUrl,
        message: 'Image uploaded successfully' 
      })
    };

  } catch (error) {
    console.error('Error uploading image:', error);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
};
