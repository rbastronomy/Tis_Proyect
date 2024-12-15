/**
 * Formats a number as CLP currency
 * @param {number} price - The price to format
 * @returns {string} Formatted price string
 */
export const formatPrice = (price) => {
  if (typeof price !== 'number') return 'Precio no disponible';
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

/**
 * Formats a date string into a localized date and time string
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted date and time string
 */
export const formatDateTime = (date) => {
  if (!date) return 'Fecha no disponible';
  
  try {
    return new Date(date).toLocaleString('es-CL', {
      dateStyle: 'medium',
      timeStyle: 'short',
      hour12: true
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Fecha inválida';
  }
};

/**
 * Formats a date string into a localized date string
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  if (!date) return 'Fecha no disponible';
  
  try {
    return new Date(date).toLocaleDateString('es-CL', {
      dateStyle: 'medium'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Fecha inválida';
  }
};

/**
 * Formats a date string into a localized time string
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted time string
 */
export const formatTime = (date) => {
  if (!date) return 'Hora no disponible';
  
  try {
    return new Date(date).toLocaleTimeString('es-CL', {
      timeStyle: 'short',
      hour12: true
    });
  } catch (error) {
    console.error('Error formatting time:', error);
    return 'Hora inválida';
  }
};