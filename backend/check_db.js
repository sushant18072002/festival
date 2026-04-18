const mongoose = require('mongoose');
require('dotenv').config();
const Event = require('./src/models/Event');
mongoose.connect('mongodb://localhost:27017/utsav_share').then(async () => {
    try {
        const events = await Event.find({}).lean();
        console.log('Total events:', events.length);
        for (const ev of events) {
            try {
                await Event.updateOne({ _id: ev._id }, { $set: { title: ev.title + ' ' } });
                await Event.updateOne({ _id: ev._id }, { $set: { title: ev.title } });
            } catch (e) {
                console.log('FAIL:', ev.slug, e.message);
            }
        }
        console.log('Checked all events in DB');
    } catch (e) {
        console.log('DB error:', e.message);
    }
    process.exit(0);
});
