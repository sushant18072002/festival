require('dotenv').config({ path: __dirname + '/../../../.env' });
const mongoose = require('mongoose');
const Quiz = require('../../models/Quiz');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/utsav_share';

const seedQuizzes = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB.');

        // Clear existing quizzes for a clean slate
        await Quiz.deleteMany({});
        console.log('Cleared existing Quiz collection.');

        const personalityQuiz = {
            title: "Which Festival Matches Your Vibe?",
            slug: "festival-personality-vibe",
            description: "Are you a loud celebration or a quiet spiritual moment? Take this 5-question quiz to find out which festival matches your exact energy frequency! Earn 25 Karma.",
            karmaReward: 25,
            isActive: true,
            translations: {
                hi: {
                    title: "कौन सा त्योहार आपकी वाइब से मेल खाता है?",
                    description: "क्या आप एक जोर-शोर से जश्न मनाते हैं या एक शांत आध्यात्मिक क्षण पसंद करते हैं? यह जानने के लिए इस 5-प्रश्नों की प्रश्नोत्तरी में भाग लें कि कौन सा त्योहार आपकी सटीक ऊर्जा आवृत्ति से मेल खाता है!"
                }
            },
            questions: [
                {
                    question: "How do you prefer to spend your ideal weekend?",
                    emoji: "📅",
                    options: [
                        { label: "Partying, dancing, and loud music with lots of friends", scores: { "holi": 3, "ganesh_chaturthi": 2 } },
                        { label: "Relaxing at home, lighting candles, and organizing", scores: { "diwali": 3, "raksha_bandhan": 1 } },
                        { label: "Attending a spiritual retreat or fasting", scores: { "navratri": 3, "maha_shivaratri": 2 } },
                        { label: "Cooking a massive feast for my extended family", scores: { "pongal": 3, "eid": 2, "onam": 2 } }
                    ]
                },
                {
                    question: "If you could only choose one festival activity, what would it be?",
                    emoji: "✨",
                    options: [
                        { label: "Throwing vibrant colors everywhere", scores: { "holi": 4 } },
                        { label: "Lighting hundreds of beautiful diyas and lamps", scores: { "diwali": 4 } },
                        { label: "Dancing the Garba in traditional attire all night", scores: { "navratri": 4 } },
                        { label: "Watching massive idols being immersed in the ocean", scores: { "ganesh_chaturthi": 4 } }
                    ]
                },
                {
                    question: "What is your relationship with sweets and festival food?",
                    emoji: "🍬",
                    options: [
                        { label: "Give me all the Modaks and Laddoos immediately!", scores: { "ganesh_chaturthi": 3, "diwali": 2 } },
                        { label: "I prefer drinking Thandai and eating savory snacks", scores: { "holi": 3 } },
                        { label: "I strictly follow fasting protocols before breaking my fast", scores: { "navratri": 3, "eid": 3 } },
                        { label: "A massive multi-course South Indian Sadya on a banana leaf", scores: { "onam": 4, "pongal": 2 } }
                    ]
                },
                {
                    question: "When picking an outfit for a celebration, you go for:",
                    emoji: "👗",
                    options: [
                        { label: "A brilliant silk saree or heavy traditional kurta", scores: { "diwali": 3, "pongal": 2 } },
                        { label: "A colorful Chaniya Choli or bright Kurta to spin in", scores: { "navratri": 4 } },
                        { label: "Old white clothes that I don't mind ruining", scores: { "holi": 4 } },
                        { label: "Something comfortable but festive for a procession", scores: { "ganesh_chaturthi": 3 } }
                    ]
                },
                {
                    question: "What is the core meaning of a festival to you?",
                    emoji: "🙏",
                    options: [
                        { label: "Absolute chaotic joy, forgiveness, and letting loose!", scores: { "holi": 3 } },
                        { label: "Wealth, prosperity, family, and welcoming the light.", scores: { "diwali": 3 } },
                        { label: "Community gathering, loud drumming, and grand farewells.", scores: { "ganesh_chaturthi": 3 } },
                        { label: "Devotion, divine feminine energy, and synchronized dancing.", scores: { "navratri": 3 } }
                    ]
                }
            ],
            results: [
                {
                    code: "holi",
                    name: "The Vibrant Soul",
                    personality: "You are Holi!",
                    description: "You are the absolute life of the party. You thrive in chaotic, colorful environments and believe that joy should be expressed loudly! You forgive easily and bring people together.",
                    emoji: "🎨",
                    primaryColor: "#FF007F",
                    secondaryColor: "#FFD700"
                },
                {
                    code: "diwali",
                    name: "The Radiant Organizer",
                    personality: "You are Diwali!",
                    description: "You are the warm, glowing light in your friend group. You value family, aesthetics, tradition, and prosperity. You love when everything is clean, bright, and beautiful.",
                    emoji: "🪔",
                    primaryColor: "#FFA500",
                    secondaryColor: "#FF4500"
                },
                {
                    code: "navratri",
                    name: "The Devoted Dancer",
                    personality: "You are Navratri!",
                    description: "You possess incredible stamina and boundless energy. You are deeply spiritual but express it through movement, community, and rhythm. You never miss a chance to dance!",
                    emoji: "💃",
                    primaryColor: "#800080",
                    secondaryColor: "#4B0082"
                },
                {
                    code: "ganesh_chaturthi",
                    name: "The Grand Welcomer",
                    personality: "You are Ganesh Chaturthi!",
                    description: "You love hosting, grand processions, and loud drums. You are optimistic and believe that every obstacle can be overcome with a bit of sweetness (and a lot of Modaks!).",
                    emoji: "🐘",
                    primaryColor: "#FF8C00",
                    secondaryColor: "#FFD700"
                },
                {
                    code: "onam",
                    name: "The Lavish Feaster",
                    personality: "You are Onam or Pongal!",
                    description: "For you, celebration is synonymous with abundance and harvest. You express love through cooking massive, intricate meals and gathering your entire extended family around the table.",
                    emoji: "🌾",
                    primaryColor: "#228B22",
                    secondaryColor: "#006400"
                }
            ]
        };

        const createdQuiz = await Quiz.create(personalityQuiz);
        console.log(`Successfully seeded Quiz with translations: ${createdQuiz.title}`);

    } catch (error) {
        console.error('Error seeding quiz:', error);
    } finally {
        mongoose.connection.close();
        process.exit(0);
    }
};

seedQuizzes();
