/**
 * iWheb Auth Client - Standalone Version
 * All-in-one JavaScript client for iWheb Authentication Service
 * 
 * Usage:
 *   const client = new IWebAuthClient({
 *     baseUrl: 'https://api.example.com',
 *     apiKey: 'your-api-key',
 *     useSSL: true  // optional, default: true
 *   });
 */

// === HTTP Client and Utilities ===
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
// === Main Auth Client ===
/**
 * iWheb Authentication Service Client
 * Simple standalone JavaScript client for iWheb Auth API
 */
class IWebAuthClient {
    constructor(config) {
        if (!config.baseUrl || !config.apiKey) {
            throw new Error('baseUrl and apiKey are required');
        }
        
        this.httpClient = new HttpClient(config.baseUrl, config.apiKey, config.useSSL !== false);
    }

    /**
     * Initiate login by email
     * @param {string} email - User email address
     * @returns {Promise<Object>} Login response with session_id
     */
    async login(email) {
        const encodedEmail = Base64Utils.encode(email);
        return await this.httpClient.post('/login', { email: encodedEmail });
    }

    /**
     * Validate authentication code
     * @param {string} sessionId - Session ID from login
     * @param {string} code - 6-digit authentication code
     * @returns {Promise<Object>} Validation response with new session_id
     */
    async validate(sessionId, code) {
        return await this.httpClient.post(`/validate/${sessionId}`, { code });
    }

    /**
     * Check session status
     * @param {string} sessionId - Session ID
     * @returns {Promise<Object>} Session status information
     */
    async checkSession(sessionId) {
        return await this.httpClient.get(`/session/check/${sessionId}`);
    }

    /**
     * Refresh session (extend expiry)
     * @param {string} sessionId - Session ID
     * @returns {Promise<Object>} New session information
     */
    async touchSession(sessionId) {
        return await this.httpClient.post(`/session/touch/${sessionId}`);
    }

    /**
     * Create delegated session for another API key
     * @param {string} sessionId - Parent session ID
     * @param {string} targetApiKey - API key for delegated session
     * @returns {Promise<Object>} Delegated session information
     */
    async createDelegatedSession(sessionId, targetApiKey) {
        return await this.httpClient.post(`/session/delegate/${sessionId}`, { 
            target_api_key: targetApiKey 
        });
    }

    /**
     * End session (logout)
     * @param {string} sessionId - Session ID
     * @returns {Promise<Object>} Logout response
     */
    async logout(sessionId) {
        return await this.httpClient.post(`/session/logout/${sessionId}`);
    }

    /**
     * Get user information from Webling
     * @param {string} sessionId - Session ID
     * @returns {Promise<Object>} User information
     */
    async getUserInfo(sessionId) {
        return await this.httpClient.get(`/user/${sessionId}/info`);
    }

    /**
     * Get encrypted user token
     * @param {string} sessionId - Session ID
     * @returns {Promise<Object>} User token
     */
    async getUserToken(sessionId) {
        return await this.httpClient.get(`/user/${sessionId}/token`);
    }

    /**
     * Helper: Check if session is active (simplified)
     * @param {string} sessionId - Session ID
     * @returns {Promise<boolean>} True if session is active
     */
    async isSessionActive(sessionId) {
        try {
            const response = await this.checkSession(sessionId);
            return response.data && response.data.active === true;
        } catch {
            return false;
        }
    }
}