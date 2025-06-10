// This function generates images using OpenAI's DALL-E API

const { OpenAI } = require('openai');
const { createClient } = require('@supabase/supabase-js');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ message: 'Method not allowed' }),
    };
  }

  try {
    const { prompt, title, topic, category } = JSON.parse(event.body);
    
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

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return {
        statusCode: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ 
          success: false,
          message: 'OpenAI API key not configured. Please add OPENAI_API_KEY to your environment variables.' 
        }),
      };
    }

    // Use prompt if available, otherwise use title or topic
    const imageSubject = prompt || title || topic;
    
    if (!imageSubject) {
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ 
          success: false,
          message: 'Please provide either a blog title or topic for image generation.' 
        }),
      };
    }

    // Create image description based on the subject and category
    const imageDescription = createImageDescription(imageSubject, category);

    console.log('Generating image with description:', imageDescription);

    // Generate image using DALL-E with a smaller size to reduce processing time
    const imageResponse = await openai.images.generate({
      model: "dall-e-2", // Use DALL-E 2 which is faster than DALL-E 3
      prompt: imageDescription,
      n: 1,
      size: "512x512", // Smaller size for faster generation
      response_format: "url"
    });

    const tempImageUrl = imageResponse.data[0].url;
    console.log('AI image generated successfully');

    // Return the temporary URL directly instead of downloading and re-uploading
    // This avoids the time-consuming download and upload process
    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({
        success: true,
        imageUrl: tempImageUrl,
        message: 'Beautiful spiritual image generated successfully!'
      }),
    };

    // NOTE: The code below is commented out to avoid timeout issues
    // In a production environment with higher timeout limits, you might want to
    // download and store the image in your own storage for permanence
    /*
    // Download the image from OpenAI's temporary URL
    const imageDownloadResponse = await fetch(tempImageUrl);
    
    if (!imageDownloadResponse.ok) {
      throw new Error('Failed to download generated image');
    }

    const imageBuffer = await imageDownloadResponse.arrayBuffer();
    const fileName = `ai-generated-${Date.now()}.jpg`;
    
    console.log('Uploading image to Supabase storage...');

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('blog-images')
      .upload(fileName, imageBuffer, {
        contentType: 'image/jpeg',
        upsert: false
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      throw new Error('Failed to save generated image to storage');
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('blog-images')
      .getPublicUrl(fileName);

    const permanentImageUrl = urlData.publicUrl;
    console.log('AI image saved to Supabase:', permanentImageUrl);
    */

    // This return statement is now handled above after generating the image

  } catch (error) {
    console.error('Image generation error:', error);
    
    let errorMessage = 'Failed to generate image. Please try again.';
    
    if (error.code === 'insufficient_quota') {
      errorMessage = 'OpenAI API quota exceeded. Please check your billing settings.';
    } else if (error.code === 'invalid_api_key') {
      errorMessage = 'Invalid OpenAI API key. Please check your configuration.';
    } else if (error.message && error.message.includes('content_policy_violation')) {
      errorMessage = 'Image request was rejected due to content policy. Please try a different topic.';
    } else if (error.message && error.message.includes('storage')) {
      errorMessage = 'Failed to save generated image. Please try again.';
    }

    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({
        success: false,
        message: errorMessage
      }),
    };
  }
};

function createImageDescription(subject, category) {
  // Create a spiritual, artistic image description based on the subject
  const baseStyle = "A beautiful, serene spiritual artwork in soft, ethereal tones";
  
  // Category-specific elements
  const categoryElements = {
    'Spiritual Guidance': 'with gentle light rays, peaceful energy, and sacred symbols',
    'Crystal Healing': 'featuring luminous crystals, healing energy, and rainbow light',
    'Meditation': 'with tranquil meditation space, soft candlelight, and peaceful atmosphere',
    'Angel Messages': 'with angelic presence, divine light, and heavenly clouds',
    'Life Wisdom': 'with ancient wisdom symbols, golden light, and timeless beauty',
    'Healing': 'with healing energy, gentle hands, and restorative light'
  };

  const categoryElement = categoryElements[category] || 'with spiritual symbols and divine light';
  
  // Clean and prepare the subject for the image prompt
  const cleanSubject = subject.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return `${baseStyle} inspired by "${cleanSubject}", ${categoryElement}. The image should be calming, inspirational, and suitable for a spiritual blog. Absolutely no text, letters, numbers, words, or writing of any kind should appear anywhere in the image. The image must be 100% free of all text and symbols that resemble writing. Style: photorealistic with artistic, dreamy quality.`;
}
