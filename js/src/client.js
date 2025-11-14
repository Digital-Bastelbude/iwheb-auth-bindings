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
     * Initiate login with validation code
     * @param {string} identifier - Email address or phone number
     * @param {string} provider - Validation provider: 'email' (default) or 'sms'
     * @returns {Promise<Object>} Login response with session_id
     */
    async login(identifier, provider = 'email') {
        const encodedIdentifier = Base64Utils.encode(identifier);
        const payload = { provider };
        
        if (provider === 'sms') {
            payload.phone = encodedIdentifier;
        } else {
            payload.email = encodedIdentifier;
        }
        
        return await this.httpClient.post('/login', payload);
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
     * Get decrypted Webling user ID
     * @param {string} sessionId - Session ID
     * @returns {Promise<Object>} User ID with new session
     */
    async getUserId(sessionId) {
        return await this.httpClient.get(`/user/${sessionId}/id`);
    }

    /**
     * Get selective user properties from Webling
     * @param {string} sessionId - Session ID
     * @param {string[]} properties - Array of property names to retrieve
     * @returns {Promise<Object>} User properties with new session
     */
    async getUserProperties(sessionId, properties) {
        const propertiesParam = Array.isArray(properties) ? properties.join(',') : properties;
        return await this.httpClient.get(`/user/${sessionId}/properties?properties=${encodeURIComponent(propertiesParam)}`);
    }

    /**
     * Get membergroup information from Webling
     * @param {string} sessionId - Session ID
     * @param {number} membergroupId - Membergroup ID
     * @returns {Promise<Object>} Membergroup data with new session
     */
    async getMembergroup(sessionId, membergroupId) {
        return await this.httpClient.get(`/membergroup/${sessionId}/${membergroupId}`);
    }

    /**
     * Check if authenticated user is member of a membergroup
     * @param {string} sessionId - Session ID
     * @param {string} membergroupName - Membergroup name
     * @returns {Promise<Object>} Membership check result with new session
     */
    async checkMembership(sessionId, membergroupName) {
        return await this.httpClient.get(`/membergroup/${sessionId}/${encodeURIComponent(membergroupName)}/member`);
    }

    /**
     * Helper: Check if session is active (simplified)
     * @param {string} sessionId - Session ID
     * @returns {Promise<boolean>} True if session is active
     */
    async isSessionActive(sessionId) {
        try {
            const response = await this.checkSession(sessionId);
            return response && response.active === true;
        } catch {
            return false;
        }
    }
}