// Custom Mapping for mismatched JSON slugs vs File names
const slugMap = {
    'navratri-2026': ['durga-puja-2026', 'dussehra-2026'],
    'diwali-2026': ['deepavali-2026'],
    'lohri-makar-sankranti-2026': ['lohri-sankranti-pongal-2026'],
    'easter-2026': ['easter-good-friday-2026'],
    'republic-day-2026': ['republic-independence-day-2026'],
    'independence-day-2026': ['republic-independence-day-2026'],
    'valentines-day-2026': ['valentine-day-2026']
};

const path = require('path');
const fs = require('fs');

const dataPath = path.join(__dirname, 'data/events_2026.json');
const seedData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const rawDir = path.join(__dirname, 'assets/raw');
const files = fs.readdirSync(rawDir);

// Extract base names from files
const fileBases = files.map(f => {
    const lastUnder = f.lastIndexOf('_');
    return lastUnder !== -1 ? f.substring(0, lastUnder) : f.split('.')[0];
});

console.log(`Total Events in JSON: ${seedData.length}`);
console.log(`Total Image Groups: ${new Set(fileBases).size}`);

const matchedEvents = [];
const unmatchedEvents = [];

for (const event of seedData) {
    let matched = fileBases.find(fb => fb === event.slug);

    // Check custom map 
    if (!matched && slugMap[event.slug]) {
        matched = fileBases.find(fb => slugMap[event.slug].includes(fb));
    }

    if (!matched) {
        matched = fileBases.find(fb => event.slug.includes(fb.replace('-2026', '')));
    }

    if (matched) {
        matchedEvents.push(event.slug);
    } else {
        unmatchedEvents.push(event.slug);
    }
}

console.log(`Matched Events: ${matchedEvents.length}`);
console.log(`Unmatched Events: ${unmatchedEvents.length}`);
if (unmatchedEvents.length > 0) {
    console.log('\nUnmatched Event Slugs:');
    unmatchedEvents.forEach(e => console.log(`- ${e}`));
}
