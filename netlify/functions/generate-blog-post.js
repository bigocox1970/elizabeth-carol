// This function generates blog posts using OpenAI's API

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
    const { password, topic, outline, category } = JSON.parse(event.body);
    
    // Verify admin password
    const adminPassword = process.env.ADMIN_PASSWORD;
    const isDevelopment = process.env.NODE_ENV !== 'production';
    const usePassword = adminPassword || (isDevelopment ? 'elizabeth2024' : null);
    
    if (!usePassword) {
      return {
        statusCode: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ 
          success: false,
          message: 'Server configuration error: Admin password not set'
        })
      };
    }
    
    if (password !== usePassword) {
      return {
        statusCode: 401,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ 
          success: false,
          message: 'Unauthorized: Invalid password'
        })
      };
    }

    // Check if OpenAI API key is configured
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return {
        statusCode: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ 
          success: false,
          message: 'OpenAI API key not configured. Please add OPENAI_API_KEY to your environment variables.'
        })
      };
    }

    // Validate required fields
    if (!topic || !topic.trim()) {
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ 
          success: false,
          message: 'Topic is required'
        })
      };
    }

    // Create the prompt for OpenAI
    const systemPrompt = `You are Elizabeth Carol, a wise and compassionate 77-year-old psychic medium and clairvoyant with over 35 years of spiritual guidance experience based in Oxford, England. 

CRITICAL WRITING REQUIREMENTS:
- ALWAYS use British English spelling, grammar, and expressions (colour not color, realise not realize, programme not program, etc.)
- Write with the wisdom and gentle authority of a 77-year-old spiritual guide
- Use slightly more formal, traditional British phrasing whilst remaining warm and accessible
- Include subtle references to your decades of experience and wisdom gained over the years
- Write as someone who has "seen it all" and offers gentle, maternal guidance

Your blog posts are:
- Warm, compassionate, and deeply wise
- Written with proper British English throughout
- Spiritually insightful but practical and grounded
- Helpful for people seeking spiritual guidance from someone with decades of experience
- Written in a caring, slightly formal but accessible tone befitting your age and wisdom
- Around 800-1200 words
- Include practical advice drawn from your years of helping people
- Reflect your expertise in psychic readings, spiritual healing, and mediumship
- Show the patience and understanding that comes with age and experience

Write in the first person as Elizabeth Carol. Be authentic and genuine, sharing wisdom that comes from nearly four decades of helping people on their spiritual journeys. Use phrases and expressions that reflect your British heritage and maturity.`;

    const userPrompt = `Please write a blog post about: ${topic}

${outline ? `Here's a brief outline to follow: ${outline}` : ''}

Category: ${category || 'Spiritual Guidance'}

IMPORTANT FORMATTING REQUIREMENTS:
- Do NOT use markdown headers (##, ###, etc.) in the content
- Use clear paragraph breaks instead of headers
- Write flowing, cohesive content without section breaks
- Use proper British English throughout

Please provide:
1. A compelling title (British English)
2. A brief excerpt (2-3 sentences, British English)
3. The full blog post content (British English throughout, NO markdown headers)

Format your response as JSON with the following structure:
{
  "title": "Blog post title",
  "excerpt": "Brief excerpt for the blog post",
  "content": "Full blog post content in plain text format with paragraph breaks but NO markdown headers"
}`;

    // Make request to OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      return {
        statusCode: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ 
          success: false,
          message: 'Failed to generate content. Please try again.'
        })
      };
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      return {
        statusCode: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ 
          success: false,
          message: 'Invalid response from AI service'
        })
      };
    }

    // Parse the AI response
    let aiContent;
    try {
      aiContent = JSON.parse(data.choices[0].message.content);
    } catch (parseError) {
      // If JSON parsing fails, try to extract content manually
      const content = data.choices[0].message.content;
      aiContent = {
        title: topic,
        excerpt: `A spiritual guide to ${topic.toLowerCase()}.`,
        content: content
      };
    }

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ 
        success: true,
        title: aiContent.title || topic,
        excerpt: aiContent.excerpt || `A spiritual guide to ${topic.toLowerCase()}.`,
        content: aiContent.content || data.choices[0].message.content,
        message: 'Blog post generated successfully!'
      })
    };

  } catch (error) {
    console.error('Error generating blog post:', error);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ 
        success: false,
        message: 'Server error during blog post generation. Please try again.'
      })
    };
  }
}; 