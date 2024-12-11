import cookie from 'cookie';
import process from 'process';

/**
 * Sets a cookie in the response
 * @param {Object} reply - Fastify reply object
 * @param {string} name - Cookie name
 * @param {string} value - Cookie value
 * @param {Object} options - Cookie options
 */
export function setCookie(reply, name, value, options = {}) {
  const defaultOptions = {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  };
  reply.header('Set-Cookie', `${name}=${value}; ${serializeOptions({ ...defaultOptions, ...options })}`);
}

/**
 * Clears a cookie by setting its expiration to a past date
 * @param {Object} reply - Fastify reply object
 * @param {string} name - Name of the cookie to clear
 */
export const clearCookie = (reply, name) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieAttributes = {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    domain: process.env.COOKIE_DOMAIN || undefined,
    path: '/',
    expires: new Date(0) // Set expiration to a past date
  };

  const cookieString = cookie.serialize(name, '', cookieAttributes);
  reply.header('Set-Cookie', cookieString);
};

/**
 * Serializes cookie options into a string
 * @param {Object} options - Cookie options
 * @returns {string} Serialized options
 */
function serializeOptions(options) {
  return Object.entries(options)
    .map(([key, value]) => (value === true ? key : `${key}=${value}`))
    .join('; ');
} 