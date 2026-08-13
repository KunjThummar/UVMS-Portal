const Event = require('../models/event.model');
const VolunteerApplication = require('../models/volunteerapplication.model');

async function deleteExpiredEvents(){
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear()-1);

    const expiredEvents = await Event.find({
        status : 'Completed',
        isArchived : false,
        eventDate : {$lt : oneYearAgo}
    });

    let deletedEventCount = 0;
    let deletedApplicationCount = 0;

    for(const event of expiredEvents){
        try {
            const appResult = await VolunteerApplication.deleteMany({eventId : event._id});
            deletedApplicationCount += appResult.deletedCount;
            await Event.deleteOne({_id : event._id});
            deletedEventCount += 1;

        } catch (error) {
            console.error(`Failed to delete expired event ${event._id}: ${error.message}`);
        }
    }

    return {
    eventsDeleted: deletedEventCount,
    applicationsDeleted: deletedApplicationCount
  };

}

module.exports = {deleteExpiredEvents};