import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const defaultHost =
  Platform.OS === 'web' ? window.location.hostname : '192.168.1.2';

export const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL || `http://${defaultHost}:3000/api`
).replace(/\/+$/, '');

export const fetchWithAuth = async (endpoint, options = {}) => {
  const token = await AsyncStorage.getItem('userToken');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const responseText = await response.text();
  let data = null;
  try {
    data = responseText ? JSON.parse(responseText) : null;
  } catch {
    throw new Error('A szerver érvénytelen választ küldött.');
  }

  if (!response.ok) {
    throw new Error(data?.error || data?.message || 'Hiba történt a kérés során.');
  }
  return data;
};