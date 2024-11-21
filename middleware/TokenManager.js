const jwt = require('jsonwebtoken');

class TokenManager {
    constructor(secret, expiresIn = '1h') {
        this.secret = secret; // JWT secret
        this.expiresIn = expiresIn; // Default expiration time
    }

    /**
     * Generate a JWT token
     * @param {Object} payload - Data to include in the token
     * @returns {string} - The generated JWT token
     */
    generateToken(payload) {
        return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn });
    }

    /**
     * Verify a JWT token
     * @param {string} token - The token to verify
     * @returns {Object} - The decoded token payload
     * @throws {Error} - If token verification fails
     */
    verifyToken(token) {
        return jwt.verify(token, this.secret);
    }

    /**
     * Decode a JWT token without verifying
     * @param {string} token - The token to decode
     * @returns {Object} - The decoded token payload
     */
    decodeToken(token) {
        return jwt.decode(token);
    }

    /**
     * Renew a JWT token with a new expiration time
     * @param {string} token - The existing token to renew
     * @returns {string} - The new JWT token with a refreshed expiration
     * @throws {Error} - If token verification fails
     */
    renewToken(token) {
        try {
            const payload = this.verifyToken(token);
            
            const { iat, exp, ...rest } = payload;

            return this.generateToken(rest);
        } catch (error) {
            throw new Error('Invalid token, unable to renew.');
        }
    }
}

module.exports = TokenManager;
