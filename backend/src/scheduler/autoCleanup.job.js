const cleanupService = require('../cleanup/cleanup.service'); // adjust path if needed

async function runAutoCleanup() {
  try {
    const result = await cleanupService.deleteExpiredEvents();
    console.log(`[${new Date().toISOString()}] Auto cleanup completed:`, result);
    return result;
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Auto cleanup FAILED:`, err.message);
    throw err;
  }
}

module.exports = { runAutoCleanup };