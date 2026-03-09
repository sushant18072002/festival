const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const HomeGreeting = require('../../models/HomeGreeting');

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/utsav_share';
const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error('Error connecting to MongoDB:', err.message);
        process.exit(1);
    }
};

const seedHomeGreetings = async () => {
    await connectDB();

    try {
        const dataPath = path.join(__dirname, '../../../data/json/home_greetings.json');
        const greetingsData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

        console.log(`Clearing old HomeGreetings collection...`);
        await HomeGreeting.deleteMany({});

        console.log(`Seeding ${greetingsData.length} new HomeGreetings...`);

        // Format and insert
        const toInsert = greetingsData.map(g => ({
            type: g.type,
            text: g.text,
            tags: g.tags || [],
            translations: g.translations,
            is_active: true
        }));

        await HomeGreeting.insertMany(toInsert);
        console.log('Successfully seeded HomeGreetings!');

    } catch (error) {
        console.error('Error seeding HomeGreetings:', error);
    } finally {
        mongoose.connection.close();
    }
};

seedHomeGreetings();
