const fs = require('fs');
const data = JSON.parse(fs.readFileSync('e:/flutter/App festival/backend/data/events_2026.json', 'utf-8'));
fs.writeFileSync('slugs.txt', data.map(e => e.slug).join('\n'));
