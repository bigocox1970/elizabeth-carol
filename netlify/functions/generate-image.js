// This function generates images using OpenAI's DALL-E API

const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method not allowed' }),
    };
  }

  try {
    const { password, title, topic, category } = JSON.parse(event.body);

    // Verify admin password
    if (password !== ADMIN_PASSWORD) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Unauthorized' }),
      };
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          success: false,
          message: 'OpenAI API key not configured. Please add OPENAI_API_KEY to your environment variables.' 
        }),
      };
    }

    // Use title if available, otherwise use topic
    const imageSubject = title || topic;
    
    if (!imageSubject) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          success: false,
          message: 'Please provide either a blog title or topic for image generation.' 
        }),
      };
    }

    // Create image description based on the subject and category
    const imageDescription = createImageDescription(imageSubject, category);

    console.log('Generating image with description:', imageDescription);

    // Generate image using DALL-E
    const imageResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: imageDescription,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      style: "natural"
    });

    const imageUrl = imageResponse.data[0].url;

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        imageUrl: imageUrl,
        message: 'Beautiful spiritual image generated successfully!'
      }),
    };

  } catch (error) {
    console.error('Image generation error:', error);
    
    let errorMessage = 'Failed to generate image. Please try again.';
    
    if (error.code === 'insufficient_quota') {
      errorMessage = 'OpenAI API quota exceeded. Please check your billing settings.';
    } else if (error.code === 'invalid_api_key') {
      errorMessage = 'Invalid OpenAI API key. Please check your configuration.';
    } else if (error.message && error.message.includes('content_policy_violation')) {
      errorMessage = 'Image request was rejected due to content policy. Please try a different topic.';
    }

    return {
      statusCode: 500,
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

  return `${baseStyle} inspired by "${cleanSubject}", ${categoryElement}. The image should be calming, inspirational, and suitable for a spiritual blog. Avoid any text or words in the image. Style: photorealistic with artistic, dreamy quality.`;
} 