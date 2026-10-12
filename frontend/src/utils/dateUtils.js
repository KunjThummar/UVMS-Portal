/**
 * Formats a date string or object to DD/MM/YYYY
 * @param {string|Date} dateValue
 * @param {string} fallback
 * @returns {string}
 */
export function formatDate(dateValue, fallback = 'N/A') {
  if (!dateValue) return fallback;
  const d = new Date(dateValue);
  if (isNaN(d.getTime())) return fallback;

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
}

/**
 * Formats a date with time to DD/MM/YYYY, hh:mm A
 * @param {string|Date} dateValue
 * @param {string} fallback
 * @returns {string}
 */
export function formatDateTime(dateValue, fallback = 'N/A') {
  if (!dateValue) return fallback;
  const d = new Date(dateValue);
  if (isNaN(d.getTime())) return fallback;

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const formattedHours = String(hours).padStart(2, '0');

  return `${day}/${month}/${year}, ${formattedHours}:${minutes} ${ampm}`;
}

/**
 * Formats date range concisely: DD/MM/YYYY or DD/MM/YYYY to DD/MM/YYYY
 * @param {string|Date} startDate
 * @param {string|Date} endDate
 * @param {string} fallback
 * @returns {string}
 */
export function formatDateRange(startDate, endDate, fallback = 'N/A') {
  const startStr = formatDate(startDate, fallback);
  if (!endDate) return startStr;
  const endStr = formatDate(endDate, fallback);
  if (startStr === endStr || endStr === fallback) return startStr;
  return `${startStr} to ${endStr}`;
}

export default {
  formatDate,
  formatDateTime,
  formatDateRange
};
