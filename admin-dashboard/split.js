const fs = require('fs');
const path = require('path');

const modelsFile = path.join(__dirname, 'lib/models.ts');
const outDir = path.join(__dirname, 'lib/models');

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const content = fs.readFileSync(modelsFile, 'utf8');

// Extract trackChanges block specifically
const trackChangesRegex = /\/\/ ─── trackChanges.*?\n([\s\S]*?)(?=\n\/\/ ───)/;
const trackMatch = content.match(trackChangesRegex);

if (trackMatch) {
    fs.writeFileSync(path.join(outDir, 'trackChanges.ts'),
        `import mongoose from 'mongoose';\n\n${trackMatch[1]}\nexport { trackChanges };`
    );
}

// Extract each model
const blocks = content.split(/\/\/ ─── ([a-zA-Z0-9_]+) ─+/g);

const exportsList = [];

for (let i = 1; i < blocks.length; i += 2) {
    const modelName = blocks[i].trim();
    if (modelName === 'trackChanges') continue;

    let blockContent = blocks[i + 1].trim();

    let fileContent = `import mongoose, { Schema } from 'mongoose';\n`;
    if (blockContent.includes('trackChanges')) {
        fileContent += `import { trackChanges } from './trackChanges';\n`;
    }

    fileContent += `\n${blockContent}\n`;

    fs.writeFileSync(path.join(outDir, `${modelName}.ts`), fileContent);
    exportsList.push(`export * from './${modelName}';`);
}

// Write index.ts
fs.writeFileSync(path.join(outDir, 'index.ts'), exportsList.join('\n') + '\n');
console.log('Successfully split models into ' + outDir);
