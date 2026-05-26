import fpPromise from '@fingerprintjs/fingerprintjs';

let cachedDeviceId: string | null = null;

export const getDeviceId = async (): Promise<string> => {
  if (cachedDeviceId) {
    return cachedDeviceId;
  }

  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('lumina_device_id');
    if (stored) {
      cachedDeviceId = stored;
      return stored;
    }
  }

  try {
    // Initialize the agent
    const fp = await fpPromise.load();
    // Get the visitor identifier
    const result = await fp.get();
    
    const visitorId = result.visitorId;
    cachedDeviceId = visitorId;
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('lumina_device_id', visitorId);
    }
    
    return visitorId;
  } catch (error) {
    console.error('Failed to generate device ID via FingerprintJS', error);
    
    // Fallback to random UUID if script is blocked (e.g. by strict adblockers)
    const fallbackId = typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID() 
      : 'fallback-' + Date.now().toString(36) + Math.random().toString(36).substring(2);
      
    cachedDeviceId = fallbackId;
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('lumina_device_id', fallbackId);
    }
    
    return fallbackId;
  }
};
