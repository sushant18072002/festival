const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Event = require('../models/Event');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const LANGUAGES = ['hi', 'mr', 'gu', 'bn', 'ta', 'te', 'kn', 'ml'];

async function run() {
  await mongoose.connect(process.env.MONGO_URI, { dbName: process.env.DB_NAME });
  console.log('Connected to DB for cleanup');

  const events = await Event.find({});
  let updatedCount = 0;

  for (const evt of events) {
    if (!evt.translations) continue;
    let modified = false;

    for (const lang of LANGUAGES) {
      if (!evt.translations[lang]) continue;
      
      const prefix = `[${lang.toUpperCase()}]`;

      if (evt.translations[lang].title && evt.translations[lang].title.startsWith(prefix)) {
        evt.translations[lang].title = ''; // Clear it so getStr falls back to English
        modified = true;
      }
      
      if (evt.translations[lang].description && evt.translations[lang].description.startsWith(prefix)) {
        evt.translations[lang].description = ''; 
        modified = true;
      }
    }

    if (modified) {
      await Event.updateOne({ _id: evt._id }, { $set: { translations: evt.translations } });
      updatedCount++;
    }
  }

  console.log(`Cleaned up translations for ${updatedCount} events in MongoDB.`);
  process.exit(0);
}

run().catch(console.error);
