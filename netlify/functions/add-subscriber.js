const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://itsxxdxyigsyqxkeonqr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0c3h4ZHh5aWdzeXF4a2VvbnFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzMDQ1NjgsImV4cCI6MjA2NDg4MDU2OH0.YeWzqm0FsIBs8ojIdyMSkprWn1OA4SfFgB2DM3j2ko'
);

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({ message: 'Method not allowed' })
    };
  }

  const { email, name, source = 'subscription' } = JSON.parse(event.body);

  // Basic validation
  if (!email) {
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({ message: 'Email is required' })
    };
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({ message: 'Invalid email address' })
    };
  }

  try {
    // Check if email already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('subscribers')
      .select('email')
      .eq('email', email.toLowerCase())
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    let isNew = true;
    if (!existingUser) {
      // Add new subscriber
      const { error: insertError } = await supabase
        .from('subscribers')
        .insert([
          {
            email: email.toLowerCase(),
            name: name || '',
            source: source,
            date_added: new Date().toISOString(),
            active: true
          }
        ]);

      if (insertError) {
        throw insertError;
      }
    } else {
      isNew = false;
    }

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({ 
        message: isNew ? 'Successfully subscribed!' : 'Already subscribed',
        isNew: isNew
      })
    };

  } catch (error) {
    console.error('Error processing subscription:', error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({ message: 'Failed to process subscription' })
    };
  }
}; 