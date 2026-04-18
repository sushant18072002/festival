const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' }); // Admin dashboard .env
const Event = require('./lib/models/Event').Event || require('./lib/models/Event').default; // Using Next.js models

async function checkFields() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const evts = await mongoose.connection.collection('events').find({}).limit(5).toArray();
        console.log("Raw MongoDB Docs from 'events' collection:");

        for (const e of evts) {
            console.log(`\nEvent: ${e.slug}`);
            console.log(`Ambient Audio ID:`, e.ambient_audio);
            console.log(`Notification Templates:`, JSON.stringify(e.notification_templates, null, 2));
        }

    } catch (err) {
        console.error(err);
    } finally {
        mongoose.connection.close();
    }
}
checkFields();
