import axios from 'axios';
import type { WeatherData, SearchResult } from '../types';

// Nominatim API - OpenStreetMap Geocoding (ฟรี)
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
// Open-Meteo Weather API - ฟรี 100% ไม่ต้องใช้ API key
const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast';

// Weather code mapping for Open-Meteo
const getWeatherDescription = (code: number): { main: string; description: string; icon: string } => {
  const weatherMap: Record<number, { main: string; description: string; icon: string }> = {
    0: { main: 'Clear', description: 'ท้องฟ้าแจ่มใส', icon: '01d' },
    1: { main: 'Clear', description: 'ท้องฟ้าแจ่มใสเป็นส่วนใหญ่', icon: '01d' },
    2: { main: 'Clouds', description: 'มีเมฆบางส่วน', icon: '02d' },
    3: { main: 'Clouds', description: 'มีเมฆมาก', icon: '03d' },
    45: { main: 'Fog', description: 'มีหมอก', icon: '50d' },
    48: { main: 'Fog', description: 'มีหมอกแข็ง', icon: '50d' },
    51: { main: 'Drizzle', description: 'ฝนละอองเบา', icon: '09d' },
    53: { main: 'Drizzle', description: 'ฝนละอองปานกลาง', icon: '09d' },
    55: { main: 'Drizzle', description: 'ฝนละอองหนัก', icon: '09d' },
    61: { main: 'Rain', description: 'ฝนเบา', icon: '10d' },
    63: { main: 'Rain', description: 'ฝนปานกลาง', icon: '10d' },
    65: { main: 'Rain', description: 'ฝนหนัก', icon: '10d' },
    71: { main: 'Snow', description: 'หิมะตกเบา', icon: '13d' },
    73: { main: 'Snow', description: 'หิมะตกปานกลาง', icon: '13d' },
    75: { main: 'Snow', description: 'หิมะตกหนัก', icon: '13d' },
    77: { main: 'Snow', description: 'ลูกเห็บ', icon: '13d' },
    80: { main: 'Rain', description: 'ฝนตกเป็นห่า เบา', icon: '09d' },
    81: { main: 'Rain', description: 'ฝนตกเป็นห่า ปานกลาง', icon: '09d' },
    82: { main: 'Rain', description: 'ฝนตกเป็นห่า หนัก', icon: '09d' },
    85: { main: 'Snow', description: 'หิมะตกเป็นห่า เบา', icon: '13d' },
    86: { main: 'Snow', description: 'หิมะตกเป็นห่า หนัก', icon: '13d' },
    95: { main: 'Thunderstorm', description: 'พายุฝนฟ้าคะนอง', icon: '11d' },
    96: { main: 'Thunderstorm', description: 'พายุฝนฟ้าคะนองพร้อมลูกเห็บเบา', icon: '11d' },
    99: { main: 'Thunderstorm', description: 'พายุฝนฟ้าคะนองพร้อมลูกเห็บหนัก', icon: '11d' },
  };
  return weatherMap[code] || { main: 'Unknown', description: 'ไม่ทราบสภาพอากาศ', icon: '01d' };
};

export const searchLocations = async (query: string): Promise<SearchResult[]> => {
  try {
    const response = await axios.get(NOMINATIM_URL, {
      params: {
        q: query,
        format: 'json',
        addressdetails: 1,
        limit: 5,
      },
    });

    if (!response.data || response.data.length === 0) return [];

    return response.data.map((result: any) => ({
      name: result.name || result.display_name.split(',')[0],
      country: result.address?.country || '',
      lat: parseFloat(result.lat),
      lon: parseFloat(result.lon),
      state: result.address?.state || result.address?.province || '',
    }));
  } catch (error) {
    console.error('Error searching locations:', error);
    return [];
  }
};

export const getWeatherByCoords = async (lat: number, lon: number): Promise<WeatherData | null> => {
  try {
    const response = await axios.get(WEATHER_URL, {
      params: {
        latitude: lat,
        longitude: lon,
        current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,surface_pressure',
        timezone: 'auto',
      },
    });

    const current = response.data.current;
    const weatherInfo = getWeatherDescription(current.weather_code);

    // Transform to match WeatherData interface
    return {
      name: '', // Will be filled from search result
      sys: {
        country: '',
      },
      main: {
        temp: current.temperature_2m,
        feels_like: current.apparent_temperature,
        humidity: current.relative_humidity_2m,
        pressure: current.surface_pressure,
      },
      weather: [weatherInfo],
      wind: {
        speed: current.wind_speed_10m,
      },
      coord: {
        lat,
        lon,
      },
    };
  } catch (error) {
    console.error('Error fetching weather:', error);
    return null;
  }
};
