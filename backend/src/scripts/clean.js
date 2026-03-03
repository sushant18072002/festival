const fs = require('fs-extra');
const path = require('path');

const clean = async () => {
    try {
        console.log('Cleaning generated files...');

        const optimizedDir = path.join(__dirname, '../../assets/optimized');
        const dataJsonDir = path.join(__dirname, '../../data/json');

        await fs.remove(optimizedDir);
        console.log(`Removed: ${optimizedDir}`);

        await fs.remove(dataJsonDir);
        console.log(`Removed: ${dataJsonDir}`);

        console.log('Clean complete!');
    } catch (err) {
        console.error('Error cleaning files:', err);
    }
};

clean();
