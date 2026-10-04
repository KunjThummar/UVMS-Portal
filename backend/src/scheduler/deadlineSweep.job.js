const Event = require('../models/event.model');
const {checkAndCloseIfDeadlinePassed , markEventCompletedIfEventDatePassed} = require('../events/event.service');

async function runDeadlineSweep() {
  const now = new Date();

  const staleOpenEvents = await Event.find({
    status: 'Open',
    applicationDeadline: { $lt: now }
  });

  const staleApplicationClosedEvents = await Event.find({
    status : 'ApplicationClosed',
    eventEndDate : { $lt: now }
  })

  let successCountStaleOpen = 0;
  let failureCountStaleOpen = 0;
  let successCountStaleApplicationClosed = 0;
  let failureCountStaleApplicationClosed = 0;

  for (const event of staleOpenEvents) {
    try {
      await checkAndCloseIfDeadlinePassed(event._id);
      successCountStaleOpen++;
    } catch (err) {
      failureCountStaleOpen++;
      console.error(`Deadline sweep: failed to close event ${event._id}: ${err.message}`);
    }
  }

  for(const event of staleApplicationClosedEvents){
    try {
      await markEventCompletedIfEventDatePassed(event._id);
      successCountStaleApplicationClosed++;
    } catch (err) {
      failureCountStaleApplicationClosed++;
      console.error(`Deadline sweep : failed to mark event to completed ${event._id}: ${err.message}`);
    }
  }

  return {
    totalFoundStaleOpen: staleOpenEvents.length,
    totalFoundStaleApplicationClosed : staleApplicationClosedEvents.length,
    successCountStaleOpen,
    successCountStaleApplicationClosed,
    failureCountStaleOpen,
    failureCountStaleApplicationClosed
  };
}

module.exports = {runDeadlineSweep};