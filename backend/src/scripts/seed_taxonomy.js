const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Category = require('../models/Category');
const Tag = require('../models/Tag');
const Vibe = require('../models/Vibe');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/utsav_share';

const categories = [
    {
        code: 'festival',
        translations: {
            en: { name: 'Festival' },
            hi: { name: 'त्योहार' },
            mr: { name: 'सण' },
            gu: { name: 'તહેવાર' },
            bn: { name: 'উৎসব' },
            ta: { name: 'திருவிழா' },
            te: { name: 'పండుగ' },
            kn: { name: 'ಹಬ್ಬ' },
            ml: { name: 'ഉത്സവം' }
        },
        icon: 'Sparkles',
        color: 'purple'
    },
    {
        code: 'national',
        translations: {
            en: { name: 'National' },
            hi: { name: 'राष्ट्रीय' },
            mr: { name: 'राष्ट्रीय' },
            gu: { name: 'રાષ્ટ્રીય' },
            bn: { name: 'জাতীয়' },
            ta: { name: 'தேசிய' },
            te: { name: 'జాతీయ' },
            kn: { name: 'ರಾಷ್ಟ್ರೀಯ' },
            ml: { name: 'ദേശീയ' }
        },
        icon: 'Flag',
        color: 'orange'
    },
    {
        code: 'religious',
        translations: {
            en: { name: 'Religious' },
            hi: { name: 'धार्मिक' },
            mr: { name: 'धार्मिक' },
            gu: { name: 'ધાર્મિક' },
            bn: { name: 'ধর্মীয়' },
            ta: { name: 'மத' },
            te: { name: 'మతపరమైన' },
            kn: { name: 'ಧಾರ್ಮಿಕ' },
            ml: { name: 'മതപരമായ' }
        },
        icon: 'Om',
        color: 'red'
    },
    {
        code: 'regional',
        translations: {
            en: { name: 'Regional' },
            hi: { name: 'क्षेत्रीय' },
            mr: { name: 'प्रादेशिक' }
        },
        icon: 'MapPin',
        color: 'teal'
    },
    {
        code: 'international',
        translations: {
            en: { name: 'International' },
            hi: { name: 'अंतरराष्ट्रीय' },
            mr: { name: 'आंतरराष्ट्रीय' }
        },
        icon: 'Globe',
        color: 'blue'
    }
];

const tags = [
    {
        code: 'lights',
        translations: {
            en: { name: 'Lights' },
            hi: { name: 'रोशनी' },
            mr: { name: 'दिवे' },
            gu: { name: 'રોશની' },
            bn: { name: 'আলো' },
            ta: { name: 'விளக்குகள்' },
            te: { name: 'దీపాలు' },
            kn: { name: 'ದೀಪಗಳು' },
            ml: { name: 'വിളക്കുകൾ' }
        }
    },
    {
        code: 'colors',
        translations: {
            en: { name: 'Colors' },
            hi: { name: 'रंग' },
            mr: { name: 'रंग' },
            gu: { name: 'રંગો' },
            bn: { name: 'রং' },
            ta: { name: 'வண்ணங்கள்' },
            te: { name: 'రంగులు' },
            kn: { name: 'ಬಣ್ಣಗಳು' },
            ml: { name: 'നിറങ്ങൾ' }
        }
    },
    {
        code: 'freedom',
        translations: {
            en: { name: 'Freedom' },
            hi: { name: 'आजादी' },
            mr: { name: 'स्वातंत्र्य' },
            gu: { name: 'સ્વતંત્રતા' },
            bn: { name: 'স্বাধীনতা' },
            ta: { name: 'சுதந்திரம்' },
            te: { name: 'స్వేచ్ఛ' },
            kn: { name: 'ಸ್ವಾತಂತ್ರ್ಯ' },
            ml: { name: 'സ്വാതന്ത്ര്യം' }
        }
    }
];

const vibes = [
    {
        code: 'spiritual',
        icon: 'Sparkles',
        color: '#8b5cf6',
        translations: {
            en: { name: 'Spiritual' },
            hi: { name: 'आध्यात्मिक' },
            mr: { name: 'आध्यात्मिक' }
        }
    },
    {
        code: 'joyful',
        icon: 'PartyPopper',
        color: '#f59e0b',
        translations: {
            en: { name: 'Joyful' },
            hi: { name: 'हर्षित' },
            mr: { name: 'आनंदी' }
        }
    },
    {
        code: 'patriotic',
        icon: 'Flag',
        color: '#10b981',
        translations: {
            en: { name: 'Patriotic' },
            hi: { name: 'देशभक्ति' },
            mr: { name: 'देशभक्ती' }
        }
    },
    {
        code: 'cultural',
        icon: 'Music',
        color: '#ec4899',
        translations: {
            en: { name: 'Cultural' },
            hi: { name: 'सांस्कृतिक' },
            mr: { name: 'सांस्कृतिक' }
        }
    },
    {
        code: 'solemn',
        icon: 'Moon',
        color: '#64748b',
        translations: {
            en: { name: 'Solemn' },
            hi: { name: 'गंभीर' },
            mr: { name: 'गंभीर' }
        }
    },
    {
        code: 'romantic',
        icon: 'Heart',
        color: '#ec4899',
        translations: {
            en: { name: 'Love' },
            hi: { name: 'प्रेम' },
            mr: { name: 'प्रेम' }
        }
    },
    {
        code: 'morning',
        icon: 'Sunrise',
        color: '#0ea5e9',
        translations: {
            en: { name: 'Morning' },
            hi: { name: 'सुबह' },
            mr: { name: 'सकाळ' }
        }
    }
];

const seedTaxonomy = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB Connected');

        // Removed destructive deleteMany calls to preserve existing data
        console.log('Connecting and starting safe upsert seeding...');

        // Seed Categories
        for (const cat of categories) {
            await Category.findOneAndUpdate({ code: cat.code }, cat, { upsert: true, setDefaultsOnInsert: true });
            console.log(`Seeded Category: ${cat.code}`);
        }

        // Seed Tags
        for (const tag of tags) {
            await Tag.findOneAndUpdate({ code: tag.code }, tag, { upsert: true, setDefaultsOnInsert: true });
            console.log(`Seeded Tag: ${tag.code}`);
        }

        // Seed Vibes
        for (const vibe of vibes) {
            await Vibe.findOneAndUpdate({ code: vibe.code }, vibe, { upsert: true, setDefaultsOnInsert: true });
            console.log(`Seeded Vibe: ${vibe.code}`);
        }

        console.log('Taxonomy Seeding Complete!');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedTaxonomy();
