const fs = require('fs');
const path = require('path');

const greetingsPath = path.join('e:/flutter/App festival/backend/data/greetings.json');
const quotesPath = path.join('e:/flutter/App festival/backend/data/quotes.json');

const greetings = JSON.parse(fs.readFileSync(greetingsPath, 'utf8'));
const quotes = JSON.parse(fs.readFileSync(quotesPath, 'utf8'));

// Buddha Greetings
const buddhaGreetings = [
    { text: "Good morning! May the teachings of Buddha guide you to peace and joy today.", slug: "buddha-morning-1", hi: "सुप्रभात! बुद्ध की शिक्षाएं आज आपको शांति और आनंद की ओर ले जाएं।" },
    { text: "Wishing you a serene and mindful day ahead. Stay blessed!", slug: "buddha-morning-2", hi: "आपको एक शांत और सचेत दिन की शुभकामनाएं। आशीर्वाद बना रहे!" },
    { text: "Start your day with a calm mind and a pure heart. Good Morning.", slug: "buddha-morning-3", hi: "अपने दिन की शुरुआत शांत मन और पवित्र हृदय से करें। सुप्रभात।" },
    { text: "May the divine light of Buddha bring clarity and peace to your life.", slug: "buddha-blessing-1", hi: "बुद्ध का दिव्य प्रकाश आपके जीवन में स्पष्टता और शांति लाए।" },
    { text: "Sending you positive vibes and spiritual energy for a beautiful day.", slug: "buddha-morning-4", hi: "एक सुंदर दिन के लिए आपको सकारात्मक और आध्यात्मिक ऊर्जा भेज रहा हूँ।" }
];

buddhaGreetings.forEach(g => {
    greetings.push({
        slug: g.slug,
        text: g.text,
        category: "religious",
        tags: ["peace"],
        vibes: ["spiritual", "solemn"],
        translations: {
            hi: { text: g.hi }
        }
    });
});

// Buddha Quotes
const buddhaQuotes = [
    { text: "Peace comes from within. Do not seek it without.", slug: "buddha-quote-1", hi: "शांति भीतर से आती है। इसे बाहर मत खोजो।" },
    { text: "Health is the greatest gift, contentment the greatest wealth, faithfulness the best relationship.", slug: "buddha-quote-2", hi: "स्वास्थ्य सबसे बड़ा उपहार है, संतोष सबसे बड़ा धन है, वफादारी सबसे अच्छा रिश्ता है।" },
    { text: "What we think, we become.", slug: "buddha-quote-3", hi: "हम जो सोचते हैं, वही बन जाते हैं।" },
    { text: "Radiate boundless love towards the entire world.", slug: "buddha-quote-4", hi: "पूरी दुनिया के प्रति असीम प्रेम बिखेरें।" },
    { text: "Three things cannot be long hidden: the sun, the moon, and the truth.", slug: "buddha-quote-5", hi: "तीन चीजें लंबे समय तक नहीं छिप सकतीं: सूरज, चंद्रमा और सत्य।" }
];

buddhaQuotes.forEach(q => {
    quotes.push({
        slug: q.slug,
        text: q.text,
        author: "Gautama Buddha",
        source: "Dhammapada",
        category: "religious",
        tags: ["wisdom"],
        vibes: ["spiritual"],
        is_featured: true,
        translations: {
            hi: { text: q.hi, author: "गौतम बुद्ध" }
        }
    });
});

fs.writeFileSync(greetingsPath, JSON.stringify(greetings, null, 4));
fs.writeFileSync(quotesPath, JSON.stringify(quotes, null, 4));

console.log('Successfully appended Buddha greetings and quotes.');
