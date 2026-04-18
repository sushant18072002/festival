const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' }); // Adjust path if needed
const Event = require('./src/models/Event'); // Path to Event model

async function fixNotificationTemplates() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const events = await Event.find({});
        let fixedCount = 0;

        for (let evt of events) {
            let needsSave = false;
            let nt = evt.get('notification_templates');

            if (Array.isArray(nt)) {
                console.log(`Fixing array template for event: ${evt.slug}`);
                // Often it was saved as an empty array or array of objects/strings
                needsSave = true;
                // Reset to an empty object
                evt.set('notification_templates', {
                    discovery: '',
                    countdown: '',
                    eve: '',
                    day_of: ''
                });
            } else if (typeof nt === 'string') {
                // If it got cast as a literal string
                needsSave = true;
                evt.set('notification_templates', {
                    discovery: '',
                    countdown: '',
                    eve: '',
                    day_of: ''
                });
            }

            if (needsSave) {
                await evt.save();
                fixedCount++;
                console.log(`Fixed notification template for ${evt.slug}`);
            }
        }

        console.log(`\nSuccessfully fixed ${fixedCount} events with corrupted notification templates.`);
    } catch (err) {
        console.error('Error fixing events:', err);
    } finally {
        mongoose.connection.close();
    }
}

fixNotificationTemplates();
