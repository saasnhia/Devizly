import { FPS } from "../constants";

/**
 * Audio durations in seconds (measured from generated MP3s).
 * Update these values if you regenerate the voiceovers.
 */
const AUDIO_DURATIONS: Record<string, number> = {
  ad1: 15.8,
  ad2: 13.9,
  ad3: 11.7,
  ad4: 11.3,
  ad5: 12.0,
  ad6: 14.7,
  ad7: 13.7,
};

/**
 * Get the duration of a voiceover in frames.
 * Adds a small buffer (3s) for the final CTA to breathe.
 */
export function getAudioDurationFrames(adId: string, bufferSeconds = 3): number {
  const seconds = AUDIO_DURATIONS[adId] ?? 30;
  return Math.ceil((seconds + bufferSeconds) * FPS);
}

/**
 * Static file path for a voiceover.
 */
export function voiceoverPath(adId: string): string {
  return `ads/voiceovers/${adId}.mp3`;
}
