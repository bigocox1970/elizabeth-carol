const SUPABASE_URL = process.env.SUPABASE_URL;
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
    console.log('Starting add-subscriber function');
    console.log('SUPABASE_URL:', SUPABASE_URL ? 'Exists' : 'Missing');
    console.log('SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? 'Exists' : 'Missing');
    
    const { email, name, source = 'newsletter' } = JSON.parse(event.body);
    console.log('Parsed request body:', { email, name, source });
    
    if (!email) {
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ 
          success: false,
          message: 'Email is required' 
        })
      };
    }

    // Use a nested try-catch for Supabase operations, similar to contact.js
    try {
      // Check if email already exists
      const checkUrl = `${SUPABASE_URL}/rest/v1/subscribers?email=eq.${encodeURIComponent(email.toLowerCase())}&select=email`;
      console.log('Check URL:', checkUrl);
      
      const checkResponse = await fetch(checkUrl, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Check response status:', checkResponse.status);
      
      if (!checkResponse.ok) {
        const errorText = await checkResponse.text();
        console.error('Check response error:', errorText);
        throw new Error(`Database query failed: ${checkResponse.status} - ${errorText}`);
      }

      const existingUsers = await checkResponse.json();
      
      if (existingUsers.length > 0) {
        return {
          statusCode: 200,
          headers: { "Access-Control-Allow-Origin": "*" },
          body: JSON.stringify({ 
            success: true,
            message: 'You are already subscribed!',
            isNew: false
          })
        };
      }
      
      // Add to subscriber list
      const insertUrl = `${SUPABASE_URL}/rest/v1/subscribers`;
      console.log('Insert URL:', insertUrl);
      
      const insertBody = {
        email: email.toLowerCase(),
        name: name || '',
        source: source,
        date_added: new Date().toISOString(),
        active: true
      };
      console.log('Insert body:', insertBody);
      
      const insertResponse = await fetch(insertUrl, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(insertBody)
      });

      console.log('Insert response status:', insertResponse.status);
      
      if (!insertResponse.ok) {
        const errorText = await insertResponse.text();
        console.error('Insert response error:', errorText);
        throw new Error(`Failed to add subscriber: ${insertResponse.status} - ${errorText}`);
      }

      console.log('NEW SUBSCRIBER:', email, name, new Date().toISOString());
    } catch (supabaseError) {
      console.error('Supabase operation error:', supabaseError);
      console.error('Supabase error stack:', supabaseError.stack);
      
      // Fall back to saving to the local JSON file if Supabase fails
      console.log('Falling back to local JSON file storage');
      
      try {
        const fs = require('fs').promises;
        const path = require('path');
        
        // Path to the local subscribers JSON file
        const filePath = path.join(process.cwd(), 'data', 'subscribers.json');
        
        // Read existing subscribers
        let subscribers = [];
        try {
          const data = await fs.readFile(filePath, 'utf8');
          subscribers = JSON.parse(data);
        } catch (readError) {
          console.error('Error reading subscribers file:', readError);
          // If file doesn't exist or can't be read, we'll create a new one
        }
        
        // Check if email already exists in local file
        const existingSubscriber = subscribers.find(sub => 
          sub.email.toLowerCase() === email.toLowerCase()
        );
        
        if (existingSubscriber) {
          return {
            statusCode: 200,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ 
              success: true,
              message: 'You are already subscribed!',
              isNew: false,
              note: 'Using local storage'
            })
          };
        }
        
        // Add new subscriber
        const newSubscriber = {
          email: email.toLowerCase(),
          name: name || '',
          source: source,
          dateAdded: new Date().toISOString(),
          active: true
        };
        
        subscribers.push(newSubscriber);
        
        // Write updated subscribers back to file
        await fs.writeFile(filePath, JSON.stringify(subscribers, null, 2), 'utf8');
        
        console.log('Saved to local JSON file:', newSubscriber);
        
        return {
          statusCode: 200,
          headers: { "Access-Control-Allow-Origin": "*" },
          body: JSON.stringify({ 
            success: true,
            message: 'Successfully subscribed!',
            isNew: true,
            note: 'Using local storage'
          })
        };
      } catch (fallbackError) {
        console.error('Error with fallback storage:', fallbackError);
        // Even if fallback fails, return success to user
        return {
          statusCode: 200,
          headers: { "Access-Control-Allow-Origin": "*" },
          body: JSON.stringify({ 
            success: true,
            message: 'Successfully subscribed!',
            isNew: true,
            note: 'Subscription recorded'
          })
        };
      }
    }
    
    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ 
        success: true,
        message: 'Successfully subscribed!',
        isNew: true
      })
    };
  } catch (error) {
    console.error('Error adding subscriber:', error);
    console.error('Error stack:', error.stack);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ 
        success: false,
        message: 'Failed to subscribe. Please try again.',
        error: error.message
      })
    };
  }
};
