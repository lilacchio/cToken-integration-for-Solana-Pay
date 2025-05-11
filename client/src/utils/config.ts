// Environment-based configuration
// This allows us to easily switch between development and production APIs

// Get the API URL from environment variables or use default
export const API_URL = process.env.REACT_APP_API_URL || '';

// Flag to determine if we're in development mode
export const isDevelopment = process.env.NODE_ENV === 'development';

// Base URL for API requests - use local proxy in development, direct URL in production
export const getBaseUrl = (): string => {
  if (isDevelopment) {
    return '/api/pop'; // Will use the proxy in package.json
  }
  return `${API_URL}/api/pop`; // Use environment variable in production
};

export default {
  apiUrl: getBaseUrl(),
  network: process.env.REACT_APP_SOLANA_NETWORK || 'devnet',
}; 