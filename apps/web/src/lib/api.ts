/**
 * Central API base URL.
 * In production (Render), VITE_API_URL is set as an environment variable.
 * In local development, it falls back to localhost:3001.
 */
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';
