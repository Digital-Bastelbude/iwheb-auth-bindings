/**
 * Base64 URL-safe encoding/decoding utilities
 */
class Base64Utils {
    static encode(str) {
        return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    }

    static decode(str) {
        // Add padding back
        str += '='.repeat((4 - str.length % 4) % 4);
        // Replace URL-safe chars
        str = str.replace(/-/g, '+').replace(/_/g, '/');
        return atob(str);
    }
}

/**
 * Simple HTTP client
 */
class HttpClient {
    constructor(baseUrl, apiKey, useSSL = true) {
        this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
        this.apiKey = apiKey;
        this.useSSL = useSSL;
        
        // Force protocol based on SSL setting
        if (this.useSSL && this.baseUrl.startsWith('http://')) {
            this.baseUrl = this.baseUrl.replace('http://', 'https://');
        } else if (!this.useSSL && this.baseUrl.startsWith('https://')) {
            this.baseUrl = this.baseUrl.replace('https://', 'http://');
        }
    }

    async request(method, endpoint, data = null) {
        const url = `${this.baseUrl}${endpoint}`;
        
        const options = {
            method: method,
            headers: {
                'X-API-Key': this.apiKey,
                'Content-Type': 'application/json'
            }
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url, options);
            const responseData = await response.json();
            
            if (!response.ok) {
                throw new Error(`${response.status}: ${responseData.message || 'Unknown error'}`);
            }
            
            return responseData;
        } catch (error) {
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Network error: Could not connect to server');
            }
            throw error;
        }
    }

    get(endpoint) {
        return this.request('GET', endpoint);
    }

    post(endpoint, data) {
        return this.request('POST', endpoint, data);
    }
}