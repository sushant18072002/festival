require('dotenv').config({ path: __dirname + '/../../../.env' });
const mongoose = require('mongoose');
const Trivia = require('../../models/Trivia');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/utsav_share';

const seedTrivias = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB.');

        // Clear existing trivias for a clean slate
        await Trivia.deleteMany({});
        console.log('Cleared existing Trivia collection.');

        const trivias = [
            {
                question: "Which festival is known as the 'Festival of Colors'?",
                options: ["Diwali", "Holi", "Navratri", "Pongal"],
                correctAnswerIndex: 1,
                karmaReward: 10,
                tags: ["holi", "colors", "spring"],
                isActive: true,
                translations: {
                    hi: {
                        question: "किस त्योहार को 'रंगों का त्योहार' कहा जाता है?",
                        options: ["दीवाली", "होली", "नवरात्रि", "पोंगल"]
                    }
                }
            },
            {
                question: "What is the primary spiritual significance of Diwali?",
                options: ["End of Winter", "Birth of Krishna", "Victory of Light over Darkness", "Harvest Season"],
                correctAnswerIndex: 2,
                karmaReward: 15,
                tags: ["diwali", "light", "victory"],
                isActive: true,
                translations: {
                    hi: {
                        question: "दिवाली का मुख्य आध्यात्मिक महत्व क्या है?",
                        options: ["सर्दियों का अंत", "कृष्ण का जन्म", "अंधकार पर प्रकाश की विजय", "फसल का मौसम"]
                    }
                }
            },
            {
                question: "How many days does the festival of Navratri last?",
                options: ["5 Days", "7 Days", "9 Days", "12 Days"],
                correctAnswerIndex: 2,
                karmaReward: 10,
                tags: ["navratri", "goddess", "durga"],
                isActive: true,
                translations: {
                    hi: {
                        question: "नवरात्रि का त्योहार कितने दिनों तक चलता है?",
                        options: ["5 दिन", "7 दिन", "9 दिन", "12 दिन"]
                    }
                }
            },
            {
                question: "Which deity is worshipped first before starting any new venture?",
                options: ["Shiva", "Vishnu", "Ganesha", "Brahma"],
                correctAnswerIndex: 2,
                karmaReward: 10,
                tags: ["ganesh", "beginnings", "wisdom"],
                isActive: true,
                translations: {
                    hi: {
                        question: "कोई भी नया काम शुरू करने से पहले सबसे पहले किस देवता की पूजा की जाती है?",
                        options: ["शिव", "विष्णु", "गणेश", "ब्रह्मा"]
                    }
                }
            },
            {
                question: "Makar Sankranti is primarily dedicated to which deity?",
                options: ["Surya (Sun God)", "Indra (Rain God)", "Vayu (Wind God)", "Agni (Fire God)"],
                correctAnswerIndex: 0,
                karmaReward: 20,
                tags: ["sankranti", "sun", "harvest"],
                isActive: true,
                translations: {
                    hi: {
                        question: "मकर संक्रांति मुख्य रूप से किस देवता को समर्पित है?",
                        options: ["सूर्य (सूर्य देव)", "इंद्र (वर्षा देव)", "वायु (पवन देव)", "अग्नि (अग्नि देव)"]
                    }
                }
            }
        ];

        await Trivia.insertMany(trivias);
        console.log(`Successfully seeded ${trivias.length} Trivia questions with Translations.`);

    } catch (error) {
        console.error('Error seeding trivias:', error);
    } finally {
        mongoose.connection.close();
        process.exit(0);
    }
};

seedTrivias();
