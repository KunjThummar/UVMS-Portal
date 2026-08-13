const Event = require('../models/event.model');
const {checkAndCloseIfDeadlinePassed} = require('../events/event.service');

async function runDeadlineSweep() {
  const now = new Date();

  const staleOpenEvents = await Event.find({
    status: 'Open',
    applicationDeadline: { $lt: now }
  });

  let successCount = 0;
  let failureCount = 0;

  for (const event of staleOpenEvents) {
    try {
      await checkAndCloseIfDeadlinePassed(event._id);
      successCount++;
    } catch (err) {
      failureCount++;
      console.error(`Deadline sweep: failed to close event ${event._id}: ${err.message}`);
    }
  }

  return {
    totalFound: staleOpenEvents.length,
    successCount,
    failureCount
  };
}

module.exports = {runDeadlineSweep};