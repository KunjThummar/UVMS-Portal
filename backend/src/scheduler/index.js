const cron = require('node-cron');
const { runDeadlineSweep } = require('./deadlineSweep.job'); // adjust path if needed
const { runAutoCleanup } = require('./autoCleanup.job');

function initScheduler() {
  // Deadline sweep: every 15 minutes
  cron.schedule('*/15 * * * *', async () => {
    try {
      const result = await runDeadlineSweep();
      console.log(`[${new Date().toISOString()}] Deadline sweep completed:`, result);
    } catch (err) {
      console.error(`[${new Date().toISOString()}] Deadline sweep FAILED:`, err.message);
    }
  });

  // Auto cleanup: once daily at midnight
  cron.schedule('0 0 * * *', async () => {
    try {
      await runAutoCleanup();
    } catch (err) {
      // runAutoCleanup already logs internally; caught here only to
      // prevent an unhandled rejection from crashing the process
    }
  });

  console.log('Scheduler initialized: deadline sweep every 15 min, cleanup daily at midnight.');
}

module.exports = { initScheduler };