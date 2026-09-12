import { Linking } from "react-native";

/**
 * Opens Google Maps (web fallback, works on iOS/Android/web without needing
 * a native maps deep-link scheme) with the given search query.
 *
 * Centralized here because this exact pattern was previously duplicated
 * across HomeUtilities and the celebrations list with slightly different
 * fallback logic in each place.
 */
export async function openInMaps(query: string): Promise<void> {
  const trimmed = query.trim();
  if (!trimmed) return;

  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    trimmed
  )}`;

  const canOpen = await Linking.canOpenURL(url);
  if (!canOpen) {
    console.warn(`[maps] Unable to open URL: ${url}`);
    return;
  }
  await Linking.openURL(url);
}
