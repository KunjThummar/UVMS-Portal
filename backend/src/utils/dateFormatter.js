/**
 * Formats a date string or Date object into DD/MM/YYYY format.
 * @param {string|Date} dateValue
 * @param {string} fallback
 * @returns {string}
 */
function formatDate(dateValue, fallback = '') {
  if (!dateValue) return fallback;
  const d = new Date(dateValue);
  if (isNaN(d.getTime())) return fallback;

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
}

/**
 * Formats a date with time into DD/MM/YYYY, hh:mm A.
 * @param {string|Date} dateValue
 * @param {string} fallback
 * @returns {string}
 */
function formatDateTime(dateValue, fallback = '') {
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

module.exports = {
  formatDate,
  formatDateTime,
};
