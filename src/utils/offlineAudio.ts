const CACHE_NAME = 'ruqyah-audio-cache-v1';

/**
 * Check if a given track URL is cached in CacheStorage
 */
export async function isTrackCached(url: string): Promise<boolean> {
  if (!('caches' in window)) return false;
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = await cache.match(url);
    return !!response;
  } catch (error) {
    console.error('Error checking cache:', error);
    return false;
  }
}

/**
 * Save an audio track to CacheStorage for offline playback
 */
export async function cacheTrack(url: string): Promise<boolean> {
  if (!('caches' in window)) return false;
  try {
    const cache = await caches.open(CACHE_NAME);
    // Fetch with cors mode
    const response = await fetch(url, { mode: 'cors' });
    if (response.ok) {
      await cache.put(url, response);
      return true;
    }
    await cache.add(url);
    return true;
  } catch (error) {
    console.error('Error caching track:', error);
    return false;
  }
}

/**
 * Retrieve a cached track response as a Blob Object URL for offline html <audio> playback
 */
export async function getCachedTrackBlobUrl(url: string): Promise<string | null> {
  if (!('caches' in window)) return null;
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = await cache.match(url);
    if (!response) return null;
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Error getting cached track blob URL:', error);
    return null;
  }
}


/**
 * Remove an audio track from CacheStorage
 */
export async function deleteCachedTrack(url: string): Promise<boolean> {
  if (!('caches' in window)) return false;
  try {
    const cache = await caches.open(CACHE_NAME);
    return await cache.delete(url);
  } catch (error) {
    console.error('Error removing cached track:', error);
    return false;
  }
}

/**
 * Helper to download an MP3 file directly to the device
 */
export async function triggerFileDownload(url: string, filename: string): Promise<boolean> {
  try {
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename.endsWith('.mp3') ? filename : `${filename}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(() => URL.revokeObjectURL(blobUrl), 15000);
    return true;
  } catch (error) {
    console.warn('Fetch blob download failed, falling back to direct anchor link:', error);
    // Fallback direct download link
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.endsWith('.mp3') ? filename : `${filename}.mp3`;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return true;
  }
}
