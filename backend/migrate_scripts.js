const fs = require('fs-extra');
const path = require('path');

const SCRIPTS_DIR = path.join(__dirname, 'src/scripts');

const GENERATORS_DIR = path.join(SCRIPTS_DIR, 'generators');
const SEEDERS_DIR = path.join(SCRIPTS_DIR, 'seeders');
const UTILS_DIR = path.join(SCRIPTS_DIR, 'utils');

fs.ensureDirSync(GENERATORS_DIR);
fs.ensureDirSync(SEEDERS_DIR);
fs.ensureDirSync(UTILS_DIR);

const files = fs.readdirSync(SCRIPTS_DIR).filter(f => f.endsWith('.js'));

files.forEach(file => {
    let targetDir = null;
    if (file.startsWith('generate_')) targetDir = GENERATORS_DIR;
    else if (file.startsWith('seed_') || file === 'add_buddha_content.js' || file === 'import_images.js') targetDir = SEEDERS_DIR;
    else if (['backup_db.js', 'restore_db.js', 'clean.js', 'health.js', 'check_config_debug.js'].includes(file)) targetDir = UTILS_DIR;

    if (targetDir) {
        const oldPath = path.join(SCRIPTS_DIR, file);
        const newPath = path.join(targetDir, file);

        let content = fs.readFileSync(oldPath, 'utf8');

        // Depth fixes
        content = content.replace(/require\(['"]\.\.\/models/g, "require('../../models");
        content = content.replace(/require\(['"]\.\.\/config/g, "require('../../config");
        content = content.replace(/require\(['"]\.\.\/middleware/g, "require('../../middleware");

        // Dotenv and Assets fixes (__dirname, '../../.env') => ('__dirname', '../../../.env')
        content = content.replace(/path\.join\(__dirname, ['"]\.\.\/\.\.\//g, "path.join(__dirname, '../../../");

        // Local sibling requires fix: if a generator required another generator, it's still in the same dir
        // e.g. require('./generate_feed') remains require('./generate_feed')

        fs.writeFileSync(newPath, content);
        fs.unlinkSync(oldPath);
        console.log(`Moved and patched ${file} -> ${path.basename(targetDir)}/${file}`);
    }
});
