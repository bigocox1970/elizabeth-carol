const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://itsxxdxyigsyqxkeonqr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0c3h4ZHh5aWdzeXF4a2VvbnFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzMDQ1NjgsImV4cCI6MjA2NDg4MDU2OH0.YeWzqm0FsIBs8ojIdyMSkprWn1OA4SfFgB2DM3j2ko'
);

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({ message: 'Method not allowed' })
    };
  }

  try {
    const { data: subscribers, error } = await supabase
      .from('subscribers')
      .select('*')
      .order('date_added', { ascending: false });

    if (error) {
      throw error;
    }

    // Format data for the admin panel
    const formattedSubscribers = subscribers.map(sub => ({
      email: sub.email,
      name: sub.name,
      source: sub.source,
      dateAdded: sub.date_added,
      active: sub.active
    }));

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({ 
        subscribers: formattedSubscribers
      })
    };

  } catch (error) {
    console.error('Error reading subscribers:', error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({ message: 'Failed to get subscribers' })
    };
  }
}; 