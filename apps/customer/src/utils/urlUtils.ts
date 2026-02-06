/**
 * Utility to handle Ngrok URL rewriting for local proxying.
 * This helps bypass the Ngrok browser warning for images.
 */

// The specific ngrok domain we are using
const NGROK_DOMAIN = 'vanessa-unabsolved-buck.ngrok-free.dev';

/**
 * Transforms a potential Ngrok URL into a local proxy URL if needed.
 * @param url The original image URL
 * @returns The proxied URL if it matches the Ngrok domain, otherwise the original URL
 */
export const getProxiedImageUrl = (url?: string): string | undefined => {
    if (!url) return undefined;

    // Check if the URL contains our Ngrok domain
    if (url.includes(NGROK_DOMAIN)) {
        // Replace the protocol and domain with the local proxy prefix
        // We assume the proxy is set up to handle paths starting from the root of the ngrok server
        // E.g. https://...ngrok-free.dev/merchant-images/foo.jpg -> /merchant-images/foo.jpg

        // Use URL object to parse safely
        try {
            const urlObj = new URL(url);
            return urlObj.pathname + urlObj.search;
        } catch (e) {
            console.error("Invalid URL for proxying:", url);
            return url;
        }
    }

    return url;
};
