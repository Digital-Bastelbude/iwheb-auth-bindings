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
     * Logout and delete session
     * @param {string} sessionId - Session ID
     * @returns {Promise<Object>} Success response
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
        return await this.httpClient.post(`/user/${sessionId}/info`);
    }

    /**
     * Get encrypted user token
     * @param {string} sessionId - Session ID
     * @returns {Promise<Object>} User token
     */
    async getUserToken(sessionId) {
        return await this.httpClient.post(`/user/${sessionId}/token`);
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