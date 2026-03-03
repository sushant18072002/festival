/**
 * import_images.js — Bulk image import pipeline.
 * Copies images from a source directory → raw → optimize → deploy → seed in one command.
 *
 * Usage:
 *   node src/scripts/import_images.js --src /path/to/images
 *   node src/scripts/import_images.js --src /path/to/images --dry-run
 *
 * npm script: npm run import:images -- --src /path/to/dir
 *
 * Pipeline:
 *   1. Copy files from --src to backend/assets/raw/
 *   2. Run optimize (Sharp: WebP + thumbnails)
 *   3. Run deploy  (S3 upload)
 *   4. Run seed:images (MongoDB upsert)
 */
const path = require('path');
const fs = require('fs-extra');
const { execSync } = require('child_process');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const args = process.argv.slice(2);
const srcIndex = args.indexOf('--src');
const isDryRun = args.includes('--dry-run');

if (srcIndex === -1 || !args[srcIndex + 1]) {
    console.error('❌ Usage: node src/scripts/import_images.js --src /path/to/images [--dry-run]');
    process.exit(1);
}

const SRC_DIR = path.resolve(args[srcIndex + 1]);
const RAW_DIR = path.join(__dirname, '../../assets/raw');
const BACKEND_ROOT = path.join(__dirname, '../../');

const SUPPORTED_EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

const run = async () => {
    if (!await fs.pathExists(SRC_DIR)) {
        console.error(`❌ Source directory does not exist: ${SRC_DIR}`);
        process.exit(1);
    }

    // ── Step 1: Copy to raw/ ─────────────────────────────────────────────────
    const files = await fs.readdir(SRC_DIR);
    const imageFiles = files.filter(f => SUPPORTED_EXTS.includes(path.extname(f).toLowerCase()));

    if (imageFiles.length === 0) {
        console.warn(`⚠️  No supported image files found in ${SRC_DIR}`);
        console.warn(`   Supported: ${SUPPORTED_EXTS.join(', ')}`);
        process.exit(0);
    }

    console.log(`\n🗂  Found ${imageFiles.length} images in ${SRC_DIR}`);
    if (isDryRun) console.log('   (DRY RUN — no changes will be made)\n');

    await fs.ensureDir(RAW_DIR);

    let copied = 0, skipped = 0;
    for (const file of imageFiles) {
        const destPath = path.join(RAW_DIR, file);
        if (await fs.pathExists(destPath)) {
            console.log(`  ⏭️  Skip (already in raw/): ${file}`);
            skipped++;
        } else {
            console.log(`  📋 Copy → raw/${file}`);
            if (!isDryRun) await fs.copy(path.join(SRC_DIR, file), destPath);
            copied++;
        }
    }

    console.log(`\n  ✅ Copied: ${copied}, Skipped (duplicate): ${skipped}`);

    if (isDryRun) {
        console.log('\n🔍 DRY RUN complete. Re-run without --dry-run to execute.');
        process.exit(0);
    }

    if (copied === 0) {
        console.log('\n✅ All images already in raw/. Nothing to process.');
        process.exit(0);
    }

    // ── Step 2: Optimize ─────────────────────────────────────────────────────
    console.log('\n⚙️  Step 2: Optimizing (Sharp → WebP + thumbnails)...');
    execSync('npm run optimize', { stdio: 'inherit', cwd: BACKEND_ROOT });

    // ── Step 3: Deploy to S3 ─────────────────────────────────────────────────
    console.log('\n☁️  Step 3: Uploading to S3...');
    execSync('npm run deploy', { stdio: 'inherit', cwd: BACKEND_ROOT });

    // ── Step 4: Seed into MongoDB ────────────────────────────────────────────
    console.log('\n🌱 Step 4: Seeding MongoDB from S3...');
    execSync('npm run seed:images', { stdio: 'inherit', cwd: BACKEND_ROOT });

    console.log('\n🎉 Import complete! Images are now in S3 and MongoDB.');
    console.log('   Refresh the admin dashboard to see your new images.');
};

run().catch(err => {
    console.error('\n❌ Import failed:', err.message);
    process.exit(1);
});
