/**
 * add_buddha_content.js
 * Seeds Buddha greetings + quotes INTO MongoDB (not local JSON files).
 * Use: npm run seed:buddha:content
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Greeting = require('../models/Greeting');
const Quote = require('../models/Quote');
const Category = require('../models/Category');
const Tag = require('../models/Tag');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/utsav_share';

const buddhaGreetings = [
    { text: "Good morning! May the teachings of Buddha guide you to peace and joy today.", slug: "buddha-morning-1", hi: "सुप्रभात! बुद्ध की शिक्षाएं आज आपको शांति और आनंद की ओर ले जाएं।" },
    { text: "Wishing you a serene and mindful day ahead. Stay blessed!", slug: "buddha-morning-2", hi: "आपको एक शांत और सचेत दिन की शुभकामनाएं। आशीर्वाद बना रहे!" },
    { text: "Start your day with a calm mind and a pure heart. Good Morning.", slug: "buddha-morning-3", hi: "अपने दिन की शुरुआत शांत मन और पवित्र हृदय से करें। सुप्रभात।" },
    { text: "May the divine light of Buddha bring clarity and peace to your life.", slug: "buddha-blessing-1", hi: "बुद्ध का दिव्य प्रकाश आपके जीवन में स्पष्टता और शांति लाए।" },
    { text: "Sending you positive vibes and spiritual energy for a beautiful day.", slug: "buddha-morning-4", hi: "एक सुंदर दिन के लिए आपको सकारात्मक और आध्यात्मिक ऊर्जा भेज रहा हूँ।" }
];

const buddhaQuotes = [
    { text: "Peace comes from within. Do not seek it without.", slug: "buddha-quote-1", hi: "शांति भीतर से आती है। इसे बाहर मत खोजो।" },
    { text: "Health is the greatest gift, contentment the greatest wealth, faithfulness the best relationship.", slug: "buddha-quote-2", hi: "स्वास्थ्य सबसे बड़ा उपहार है, संतोष सबसे बड़ा धन है।" },
    { text: "What we think, we become.", slug: "buddha-quote-3", hi: "हम जो सोचते हैं, वही बन जाते हैं।" },
    { text: "Radiate boundless love towards the entire world.", slug: "buddha-quote-4", hi: "पूरी दुनिया के प्रति असीम प्रेम बिखेरें।" },
    { text: "Three things cannot be long hidden: the sun, the moon, and the truth.", slug: "buddha-quote-5", hi: "तीन चीजें लंबे समय तक नहीं छिप सकतीं: सूरज, चंद्रमा और सत्य।" }
];

async function seed() {
    await mongoose.connect(MONGO_URI);
    console.log('🔌 MongoDB Connected');

    // Ensure 'religious' category exists
    let cat = await Category.findOne({ code: 'religious' });
    if (!cat) {
        cat = await Category.create({ code: 'religious', translations: { en: { name: 'Religious' } } });
    }

    let seeded = 0;
    for (const g of buddhaGreetings) {
        await Greeting.findOneAndUpdate(
            { slug: g.slug },
            { text: g.text, slug: g.slug, category: cat._id, translations: { hi: { text: g.hi } } },
            { upsert: true, new: true }
        );
        seeded++;
        console.log(`  ✅ Greeting: ${g.slug}`);
    }

    for (const q of buddhaQuotes) {
        await Quote.findOneAndUpdate(
            { slug: q.slug },
            {
                text: q.text, slug: q.slug, author: 'Gautama Buddha', source: 'Dhammapada',
                category: cat._id, is_featured: true,
                translations: { hi: { text: q.hi, author: 'गौतम बुद्ध' } }
            },
            { upsert: true, new: true }
        );
        seeded++;
        console.log(`  ✅ Quote: ${q.slug}`);
    }

    console.log(`\n✅ Seeded ${seeded} Buddha records into MongoDB.`);
    process.exit(0);
}

seed().catch(err => { console.error('❌ Failed:', err.message); process.exit(1); });
