import jwt from 'jsonwebtoken';

/**
 * Verifies a JWT token using the given secret.
 * @param {string} token - The JWT token to verify
 * @param {string} secret - The secret key used to sign the token
 * @returns {object|null} - Returns the decoded payload or null if invalid
 */
export function verifyJWT(token, secret) {
    try {
        if (!token) return null;
        const decoded = jwt.verify(token, secret);
        return decoded;
    } catch (err) {
        console.error('JWT verification failed:', err.message);
        return null;
    }
}
