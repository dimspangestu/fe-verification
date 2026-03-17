// lib/apiService.js
export default async function apiService(method, endpoint, { data, headers = {} } = {}) {
    const baseUrl = 'https://api-live.uiii.ac.id/api';
    const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    
    const config = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'key': process.env.NEXT_PUBLIC_KEY,
        ...headers,
      },
    };
  
    if (data) {
      config.body = JSON.stringify(data);
    }
  
    try {
      const response = await fetch(url, config);
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.message || 'API request failed');
      }
  
      return responseData;
    } catch (error) {
      console.error('API error:', error);
      throw error;
    }
  }