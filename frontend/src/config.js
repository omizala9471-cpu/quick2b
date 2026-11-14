// Central API configuration
export const API_BASE = typeof window !== 'undefined' && window.location.origin.includes(':5173')
  ? 'http://localhost:8000/api'
  : '/api';
