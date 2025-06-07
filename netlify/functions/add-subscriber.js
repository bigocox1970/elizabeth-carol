const fs = require('fs').promises;
const path = require('path');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method not allowed' })
    };
  }

  const { email, name, source = 'subscription' } = JSON.parse(event.body);

  // Basic validation
  if (!email) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Email is required' })
    };
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Invalid email address' })
    };
  }

  try {
    // Read existing subscribers
    let subscribers = [];
    const filePath = path.join(process.cwd(), 'data', 'subscribers.json');
    
    try {
      const data = await fs.readFile(filePath, 'utf8');
      subscribers = JSON.parse(data);
    } catch (err) {
      // File doesn't exist yet, start with empty array
      subscribers = [];
    }

    // Check if email already exists
    const existingSubscriber = subscribers.find(sub => sub.email.toLowerCase() === email.toLowerCase());
    
    if (!existingSubscriber) {
      // Add new subscriber
      subscribers.push({
        email: email.toLowerCase(),
        name: name || '',
        source: source, // 'subscription' or 'contact_form'
        dateAdded: new Date().toISOString(),
        active: true
      });

      // Save updated list
      await fs.writeFile(filePath, JSON.stringify(subscribers, null, 2));
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: existingSubscriber ? 'Already subscribed' : 'Successfully subscribed!',
        isNew: !existingSubscriber
      })
    };

  } catch (error) {
    console.error('Error managing subscriber:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to process subscription' })
    };
  }
}; 