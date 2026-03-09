require('dotenv').config({ path: __dirname + '/../../../.env' });
const mongoose = require('mongoose');
const GamificationConfig = require('../../models/GamificationConfig');
const Trivia = require('../../models/Trivia');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/utsav_share';

const seedGamificationAndTrivia = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB.');

        // --- 1. Seed Trivia ---
        const initialTrivia = {
            question: "Which festival is known as the 'Festival of Colors'?",
            options: ["Diwali", "Holi", "Navratri", "Pongal"],
            correctAnswerIndex: 1,
            karmaReward: 10,
            tags: ["holi", "colors", "spring"]
        };

        // Check if it already exists by question
        const triviaExists = await Trivia.findOne({ question: initialTrivia.question });
        if (!triviaExists) {
            await Trivia.create(initialTrivia);
            console.log('Successfully seeded initial Trivia question.');
        } else {
            console.log('Trivia question already seeded.');
        }


        // --- 2. Seed Gamification Config ---
        const configData = {
            version: 1,
            isActive: true,
            avatarTiers: [
                {
                    name: '🌱 Seedling (Starter)',
                    baseKarma: 0,
                    paths: [
                        'assets/icon/avatar_tier1_1.png',
                        'assets/icon/avatar_tier1_2.png',
                        'assets/icon/avatar_tier1_3.png',
                        'assets/icon/avatar_tier1_4.png',
                        'assets/icon/avatar_tier1_5.png',
                    ]
                },
                {
                    name: '🕯️ Diya Lighter',
                    baseKarma: 30,
                    paths: [
                        'assets/icon/avatar_tier2_1.png',
                        'assets/icon/avatar_tier2_2.png',
                        'assets/icon/avatar_tier2_3.png',
                        'assets/icon/avatar_tier2_4.png',
                        'assets/icon/avatar_tier2_5.png',
                    ]
                },
                {
                    name: '🌸 Festive Guide',
                    baseKarma: 100,
                    paths: [
                        'assets/icon/avatar_tier3_1.png',
                        'assets/icon/avatar_tier3_2.png',
                        'assets/icon/avatar_tier3_3.png',
                        'assets/icon/avatar_tier3_4.png',
                        'assets/icon/avatar_tier3_5.png',
                    ]
                },
                {
                    name: '🌳 Vibe Seeker',
                    baseKarma: 250,
                    paths: [
                        'assets/icon/avatar_tier4_1.png',
                        'assets/icon/avatar_tier4_2.png',
                        'assets/icon/avatar_tier4_3.png',
                        'assets/icon/avatar_tier4_4.png',
                        'assets/icon/avatar_tier4_5.png',
                    ]
                },
                {
                    name: '✨ Utsav Master',
                    baseKarma: 500,
                    paths: [
                        'assets/icon/avatar_tier5_1.png',
                        'assets/icon/avatar_tier5_2.png',
                        'assets/icon/avatar_tier5_3.png',
                        'assets/icon/avatar_tier5_4.png',
                        'assets/icon/avatar_tier5_5.png',
                    ]
                }
            ],
            trophies: [
                { name: 'Beginner Seeker', icon: '🌱', description: 'Joined Utsav', unlockRuleType: 'signup', unlockThreshold: 0 },
                { name: 'Festival Explorer', icon: '🗺️', description: 'Explore 5 festivals', unlockRuleType: 'explore', unlockThreshold: 5 },
                { name: 'Vibe Master', icon: '✨', description: 'Discover 10 vibes', unlockRuleType: 'explore', unlockThreshold: 10 },
                { name: 'Cultural Guru', icon: '📚', description: 'Reach 500 Karma', unlockRuleType: 'karma', unlockThreshold: 500 },
                { name: 'Social Butterfly', icon: '🦋', description: 'Share 10 images', unlockRuleType: 'share', unlockThreshold: 10 },
                { name: 'Unbreakable', icon: '🔥', description: '30-day streak', unlockRuleType: 'streak', unlockThreshold: 30 },
                // The time ones are handled uniquely by flutter currently, so we use a huge threshold to avoid standard logic overriding
                { name: 'Night Owl', icon: '🦉', description: 'Explore at midnight', unlockRuleType: 'time', unlockThreshold: 2300 },
                { name: 'Early Bird', icon: '🌅', description: 'Explore at dawn', unlockRuleType: 'time', unlockThreshold: 400 },
            ]
        };

        const configExists = await GamificationConfig.findOne({ version: 1 });
        if (!configExists) {
            await GamificationConfig.create(configData);
            console.log('Successfully seeded v1 Gamification Config.');
        } else {
            await GamificationConfig.updateOne({ version: 1 }, configData);
            console.log('Successfully updated v1 Gamification Config.');
        }

    } catch (error) {
        console.error('Error seeding data:', error);
    } finally {
        mongoose.connection.close();
    }
};

seedGamificationAndTrivia();
