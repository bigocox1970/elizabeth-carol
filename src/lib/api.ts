// API utility that automatically uses production functions in development
const PRODUCTION_URL = 'https://elizabethcarol.netlify.app';

// Detect if we're running on localhost
const isLocalhost = window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1' ||
                   window.location.hostname.includes('192.168.');

// Get the base URL for API calls
export const getApiBaseUrl = () => {
  if (isLocalhost) {
    // Use production functions when on localhost
    return PRODUCTION_URL;
  }
  // Use current domain for production/preview
  return '';
};

// Wrapper function for all Netlify function calls
export const callNetlifyFunction = async (functionName: string, options: RequestInit = {}) => {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/.netlify/functions/${functionName}`;
  
  console.log(`🚀 Calling function: ${functionName} via ${baseUrl || 'current domain'}`);
  
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
}; 