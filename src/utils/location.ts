// src/utils/location.ts
import Geolocation from 'react-native-geolocation-service';
import { PermissionsAndroid, Platform } from 'react-native';

export async function requestLocationPermission(): Promise<boolean> {
  if (Platform.OS === 'ios') return true; // iOS prompts via Info.plist automatically
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Доступ к геолокации',
        message: 'Нужно, чтобы показать смены рядом с вами',
        buttonPositive: 'OK',
      },
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (e) {
    console.error('requestLocationPermission error', e);
    return false;
  }
}

export function getCurrentPosition(timeout = 15000): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    try {
      Geolocation.getCurrentPosition(
        (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        (err) => reject(err),
        { enableHighAccuracy: true, timeout, maximumAge: 10000 },
      );
    } catch (e) {
      reject(e);
    }
  });
}
