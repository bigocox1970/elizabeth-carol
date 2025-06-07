const fs = require('fs').promises;
const path = require('path');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method not allowed' })
    };
  }

  try {
    const filePath = path.join(process.cwd(), 'data', 'subscribers.json');
    
    try {
      const data = await fs.readFile(filePath, 'utf8');
      const subscribers = JSON.parse(data);
      
      return {
        statusCode: 200,
        body: JSON.stringify({ 
          subscribers: subscribers.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
        })
      };
    } catch (err) {
      // File doesn't exist yet
      return {
        statusCode: 200,
        body: JSON.stringify({ subscribers: [] })
      };
    }

  } catch (error) {
    console.error('Error reading subscribers:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to get subscribers' })
    };
  }
}; 