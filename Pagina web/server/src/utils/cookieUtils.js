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
 * Clears a cookie in the response
 * @param {Object} reply - Fastify reply object
 * @param {string} name - Cookie name
 * @param {Object} options - Cookie options
 */
export function clearCookie(reply, name, options = {}) {
  setCookie(reply, name, '', { ...options, maxAge: 0 });
}

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