const multipart = require('parse-multipart-data');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ message: 'Method not allowed' })
    };
  }

  try {
    // Check admin authentication
    const boundary = event.headers['content-type']?.split('boundary=')[1];
    if (!boundary) {
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ message: 'Invalid content type' })
      };
    }

    const parts = multipart.parse(Buffer.from(event.body, 'base64'), boundary);
    
    // Find password and image parts
    let password = '';
    let imageFile = null;
    
    for (const part of parts) {
      if (part.name === 'password') {
        password = part.data.toString();
      } else if (part.name === 'image') {
        imageFile = part;
      }
    }

    // Verify admin password
    if (password !== process.env.ADMIN_PASSWORD) {
      return {
        statusCode: 401,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ message: 'Unauthorized' })
      };
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
        imageUrl: urlData.publicUrl,
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