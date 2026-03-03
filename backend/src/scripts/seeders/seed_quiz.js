require('dotenv').config({ path: __dirname + '/../../.env' });
const mongoose = require('mongoose');
const Quiz = require('../../models/Quiz');

const MONGODB_URI = process.env.MONGODB_URI;

const seedQuiz = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB.');

        const festivalPersonalityQuiz = {
            title: "Festival Personality Quiz",
            slug: "festival-personality",
            description: "Discover which Indian festival matches your true personality!",
            karmaReward: 25,
            questions: [
                {
                    question: 'How do you love to celebrate?',
                    emoji: '🎉',
                    options: [
                        { label: 'With loud music & dancing', scores: { holi: 3, navratri: 2, ganesh: 1 } },
                        { label: 'With prayer & spiritual rituals', scores: { diwali: 3, dussehra: 2, eid: 1 } },
                        { label: 'Feasting with loved ones', scores: { onam: 3, christmas: 2, baisakhi: 2 } },
                        { label: 'Giving & exchanging gifts', scores: { raksha_bandhan: 3, christmas: 2, eid: 1 } }
                    ]
                },
                {
                    question: 'Which color speaks to your soul?',
                    emoji: '🎨',
                    options: [
                        { label: 'Brilliant Rainbow', scores: { holi: 4, navratri: 1 } },
                        { label: 'Warm Golden & Amber', scores: { diwali: 4, onam: 1 } },
                        { label: 'Vibrant Red & Green', scores: { christmas: 3, baisakhi: 2 } },
                        { label: 'Sacred Saffron & White', scores: { dussehra: 3, ganesh: 2, eid: 1 } }
                    ]
                },
                {
                    question: 'Your ideal wedding/celebration venue?',
                    emoji: '🏛️',
                    options: [
                        { label: 'Open fields & beaches', scores: { holi: 2, baisakhi: 3, onam: 2 } },
                        { label: 'A beautifully lit temple', scores: { diwali: 3, ganesh: 3, dussehra: 1 } },
                        { label: 'A grand decorated hall', scores: { navratri: 3, christmas: 2, eid: 2 } },
                        { label: 'A cosy intimate home', scores: { raksha_bandhan: 4, onam: 2 } }
                    ]
                },
                {
                    question: 'Pick the festive food you crave most:',
                    emoji: '🍛',
                    options: [
                        { label: 'Gujia & thandai (sweets)', scores: { holi: 4 } },
                        { label: 'Modak & laddoos', scores: { ganesh: 4, diwali: 1 } },
                        { label: 'Sadya (Kerala feast)', scores: { onam: 4, baisakhi: 1 } },
                        { label: 'Seviyan & sheer korma', scores: { eid: 4, raksha_bandhan: 1 } }
                    ]
                },
                {
                    question: 'What type of music moves you?',
                    emoji: '🎵',
                    options: [
                        { label: 'High-energy dhol & bhangra', scores: { baisakhi: 4, holi: 2 } },
                        { label: 'Devotional aarti & bhajans', scores: { diwali: 3, ganesh: 3, dussehra: 1 } },
                        { label: 'Folk & garba rhythms', scores: { navratri: 4, holi: 1 } },
                        { label: 'Carols & melodic hymns', scores: { christmas: 4, eid: 1 } }
                    ]
                },
                {
                    question: 'What matters most to you?',
                    emoji: '💎',
                    options: [
                        { label: 'Freedom & joy — live life loudly!', scores: { holi: 3, baisakhi: 2 } },
                        { label: 'Faith & divine connection', scores: { diwali: 2, ganesh: 2, eid: 2, dussehra: 2 } },
                        { label: 'Family bonds & togetherness', scores: { onam: 3, raksha_bandhan: 3, christmas: 1 } },
                        { label: 'Good over evil, hope over despair', scores: { dussehra: 4, diwali: 2 } }
                    ]
                },
                {
                    question: 'Your spirit animal during a festival?',
                    emoji: '🦚',
                    options: [
                        { label: 'Peacock — colourful & free', scores: { holi: 3, navratri: 2 } },
                        { label: 'Elephant — powerful & wise', scores: { ganesh: 4, dussehra: 1 } },
                        { label: 'Deer — gentle & peaceful', scores: { onam: 3, christmas: 2, eid: 2 } },
                        { label: 'Lion — brave & victorious', scores: { dussehra: 3, baisakhi: 2 } }
                    ]
                },
                {
                    question: 'Which ritual are you most drawn to?',
                    emoji: '🪔',
                    options: [
                        { label: 'Lighting diyas & rangoli', scores: { diwali: 4, onam: 2 } },
                        { label: 'Playing colors with strangers', scores: { holi: 4 } },
                        { label: 'Dandiya & garba dance', scores: { navratri: 4 } },
                        { label: 'Tying a rakhi thread', scores: { raksha_bandhan: 4 } }
                    ]
                },
                {
                    question: 'Best way to spend a festive evening?',
                    emoji: '🌙',
                    options: [
                        { label: 'Massive outdoor procession', scores: { ganesh: 3, dussehra: 3 } },
                        { label: 'Star-lit home feast & stories', scores: { eid: 3, christmas: 3, onam: 2 } },
                        { label: 'All-night dance & garba', scores: { navratri: 4 } },
                        { label: 'Watching fireworks on a rooftop', scores: { diwali: 3, holi: 2, baisakhi: 2 } }
                    ]
                },
                {
                    question: 'One word that describes your energy:',
                    emoji: '⚡',
                    options: [
                        { label: 'Explosive & unstoppable', scores: { holi: 3, baisakhi: 2, navratri: 2 } },
                        { label: 'Radiant & luminous', scores: { diwali: 4, onam: 1 } },
                        { label: 'Compassionate & generous', scores: { eid: 3, christmas: 3, raksha_bandhan: 1 } },
                        { label: 'Triumphant & fearless', scores: { dussehra: 4, ganesh: 1 } }
                    ]
                }
            ],
            results: [
                {
                    code: 'diwali', name: 'Diwali', emoji: '🪔',
                    description: 'You radiate warmth, wisdom, and inner light. Like a thousand diyas, you illuminate every room you enter and bring hope wherever you go.',
                    primaryColor: '0xFFFFB347', secondaryColor: '0xFFFF8C00', personality: 'The Illuminator'
                },
                {
                    code: 'holi', name: 'Holi', emoji: '🌈',
                    description: 'You\'re an explosion of colour, energy, and pure joy! Boundaries dissolve around you — you bring people together and make every moment vibrant.',
                    primaryColor: '0xFFEC4899', secondaryColor: '0xFF8B5CF6', personality: 'The Free Spirit'
                },
                {
                    code: 'ganesh', name: 'Ganesh Chaturthi', emoji: '🐘',
                    description: 'Wise, strong, and deeply loved by all. You remove obstacles for others, lead with grace, and your presence commands both respect and affection.',
                    primaryColor: '0xFFF59E0B', secondaryColor: '0xFF10B981', personality: 'The Wise Leader'
                },
                {
                    code: 'navratri', name: 'Navratri', emoji: '💃',
                    description: 'Passionate, devoted, and full of electric energy. You pour your whole soul into every experience — and your enthusiasm is absolutely infectious.',
                    primaryColor: '0xFFEF4444', secondaryColor: '0xFFF59E0B', personality: 'The Devoted Dancer'
                },
                {
                    code: 'eid', name: 'Eid', emoji: '🌙',
                    description: 'Generous, compassionate, and community-driven. Your heart is vast enough to embrace everyone. Giving is your greatest joy.',
                    primaryColor: '0xFF10B981', secondaryColor: '0xFF059669', personality: 'The Generous Soul'
                },
                {
                    code: 'onam', name: 'Onam', emoji: '🌸',
                    description: 'Rooted in nature, family, and tradition. You appreciate life\'s simple joys and create beautiful harmony wherever you go.',
                    primaryColor: '0xFF059669', secondaryColor: '0xFFFFB347', personality: 'The Harmoniser'
                },
                {
                    code: 'christmas', name: 'Christmas', emoji: '⭐',
                    description: 'Warm, giving, and full of wonder. You believe in magic, in miracles, and in the power of love to make everything better.',
                    primaryColor: '0xFFEF4444', secondaryColor: '0xFF10B981', personality: 'The Eternal Giver'
                },
                {
                    code: 'baisakhi', name: 'Baisakhi', emoji: '🌾',
                    description: 'Bold, hardworking, and full of harvest-day energy. You celebrate life\'s abundance and never shy away from hard work or a good dance!',
                    primaryColor: '0xFF10B981', secondaryColor: '0xFFF59E0B', personality: 'The Joyful Achiever'
                },
                {
                    code: 'dussehra', name: 'Dussehra', emoji: '🏹',
                    description: 'Brave, righteous, and unwavering. You stand up for what is right, fight against injustice, and never stop until good wins.',
                    primaryColor: '0xFFEF4444', secondaryColor: '0xFFF97316', personality: 'The Righteous Warrior'
                },
                {
                    code: 'raksha_bandhan', name: 'Raksha Bandhan', emoji: '🧵',
                    description: 'Your strength is in your bonds. Family, loyalty, and unconditional love define you. You protect and cherish the people who matter most.',
                    primaryColor: '0xFF8B5CF6', secondaryColor: '0xFFEC4899', personality: 'The Loyal Guardian'
                }
            ],
            isActive: true
        };

        // Upsert the quiz based on slug 'festival-personality'
        const result = await Quiz.findOneAndUpdate(
            { slug: 'festival-personality' },
            festivalPersonalityQuiz,
            { upsert: true, new: true }
        );

        console.log(`Successfully seeded Quiz: ${result.title} (${result.slug})`);

    } catch (error) {
        console.error('Error seeding data:', error);
    } finally {
        mongoose.connection.close();
    }
};

seedQuiz();
