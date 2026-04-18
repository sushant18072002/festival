const fs = require('fs');
const path = require('path');

const taxonomyFile = path.join(__dirname, '../../../data/json/home/taxonomy_hi.json');
const seedFile = path.join(__dirname, 'seed_unified.js');

const taxonomyRaw = fs.readFileSync(taxonomyFile, 'utf8');
const taxonomyJson = JSON.parse(taxonomyRaw);

const translationMap = {};
for (const c of taxonomyJson.categories) translationMap[c.code] = c.name;
for (const t of taxonomyJson.tags) translationMap[t.code] = t.name;
for (const v of taxonomyJson.vibes) translationMap[v.code] = v.name;

let seedContent = fs.readFileSync(seedFile, 'utf8');
let count = 0;

// Since we know the codes are single words and followed by translations, we can just split the file by lines
// and replace the Hindi name if the line contains code: 'xxx'
const lines = seedContent.split('\n');
for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const matchCode = line.match(/code:\s*'([^']+)'/);
    if (matchCode && translationMap[matchCode[1]]) {
        const code = matchCode[1];
        const correctHindi = translationMap[code];
        
        // Find hi: { name: '...' } on the same line
        if (line.includes('hi: { name:')) {
            lines[i] = line.replace(/hi:\s*\{\s*name:\s*'[^']+'\s*\}/, `hi: { name: '${correctHindi}' }`);
            if (lines[i] !== line) count++;
        }
    }
}

fs.writeFileSync(seedFile, lines.join('\n'), 'utf8');
console.log('Fixed using dictionary map! Replaced lines: ' + count);
