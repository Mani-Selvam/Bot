/**
 * Validates and sanitizes URLs to prevent XSS attacks
 * Only allows http and https protocols
 * @param {string} url - The URL to validate
 * @returns {string|null} - Safe URL or null if invalid
 */
export function safeUrl(url) {
    if (!url || typeof url !== 'string') {
        return null;
    }
    
    try {
        // If no protocol, add https://
        const urlString = url.startsWith('http://') || url.startsWith('https://') 
            ? url 
            : `https://${url}`;
            
        const parsedUrl = new URL(urlString);
        
        // Only allow http and https protocols
        if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
            return null;
        }
        
        return parsedUrl.toString();
    } catch {
        return null;
    }
}