/**
 * Get the correct API URL for Netlify functions
 * Works in both development and production
 */
export const getApiUrl = (functionName: string): string => {
  // Remove leading slash if present
  const cleanFunctionName = functionName.startsWith('/') ? functionName.slice(1) : functionName;
  
  // For localhost, use relative URL
  if (window.location.hostname === 'localhost') {
    return `/.netlify/functions/${cleanFunctionName}`;
  }
  
  // For production, use absolute URL
  return `${window.location.origin}/.netlify/functions/${cleanFunctionName}`;
}; 