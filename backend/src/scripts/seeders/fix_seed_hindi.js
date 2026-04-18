const fs = require('fs');
const path = require('path');

const seedFile = path.join(__dirname, 'seed_unified.js');

const hiTranslations = {
    // Categories
    "Festival": "त्यौहार",
    "National": "राष्ट्रीय",
    "Religious": "धार्मिक",
    "Regional": "क्षेत्रीय",
    "International": "अंतर्राष्ट्रीय",

    // Vibes
    "Spiritual": "आध्यात्मिक",
    "Joyful": "हर्षित",
    "Patriotic": "देशभक्ति",
    "Cultural": "सांस्कृतिक",
    "Solemn": "गंभीर",
    "Love": "प्रेम",
    "Morning": "सुबह",
    "Meditative": "ध्यानपूर्ण",
    "Festive": "उत्सवी",
    "Devotional": "भक्तिमय",
    "Reflective": "चिंतनशील",

    // Tags
    "Ahimsa": "अहिंसा",
    "Assam": "असम",
    "Auspicious": "शुभ",
    "Ayodhya": "अयोध्या",
    "Bajrangbali": "बजरंगबली",
    "Banyan": "बरगद",
    "Bappa": "बप्पा",
    "Bapu": "बापू",
    "Bhole": "भोले",
    "Bihar": "बिहार",
    "Boat Race": "नौका दौड़",
    "Bonfire": "अलाव",
    "Bravery": "वीरता",
    "Brother": "भाई",
    "Buddha": "बुद्ध",
    "Buddhism": "बौद्ध धर्म",
    "Celebration": "उत्सव",
    "Christian": "ईसाई",
    "Colors": "रंग",
    "Constitution": "संविधान",
    "Couple": "जोड़ा",
    "Crackers": "पटाखे",
    "Dahi Handi": "दही हांडी",
    "Dalit": "दलित",
    "Dance": "नृत्य",
    "Dandiya": "डांडिया",
    "Devi": "देवी",
    "Diya": "दीया",
    "Durga": "दुर्गा",
    "Eid": "ईद",
    "Enlightenment": "ज्ञान",
    "Equality": "समानता",
    "Family": "परिवार",
    "Fasting": "उपवास",
    "Feast": "भोज",
    "Flag": "तिरंगा",
    "Forgiveness": "क्षमा",
    "Freedom": "आज़ादी",
    "Fun": "मौज-मस्ती",
    "Gandhi": "गांधी",
    "Ganesha": "गणेश",
    "Garba": "गरबा",
    "Gurpurab": "गुरुपर्व",
    "Guru": "गुरु",
    "Guru Nanak": "गुरु नानक",
    "Hajj": "हज",
    "Hanuman": "हनुमान",
    "Har Har Mahadev": "हर हर महादेव",
    "Harvest": "फसल",
    "Health": "स्वास्थ्य",
    "Heart": "दिल",
    "Hindu": "हिंदू",
    "Holidays": "छुट्टियां",
    "India": "भारत",
    "Islam": "इस्लाम",
    "Jai Hind": "जय हिंद",
    "Jain": "जैन",
    "Jesus": "यीशु",
    "Kanha": "कान्हा",
    "Kannada": "कन्नड़",
    "Kerala": "केरल",
    "Khalsa": "खालसा",
    "Kite": "पतंग",
    "Krishna": "कृष्ण",
    "Lakshmi": "लक्ष्मी",
    "Lights": "रोशनी",
    "Mahabali": "महाबली",
    "Maharashtra": "महाराष्ट्र",
    "Mahavir": "महावीर",
    "Maratha": "मराठा",
    "Martial Arts": "मार्शल आर्ट",
    "Meditation": "ध्यान",
    "Modak": "मोदक",
    "Moon": "चांद",
    "Mourning": "शोक",
    "New Year": "नव वर्ष",
    "Non-Violence": "अहिंसा",
    "Parade": "परेड",
    "Party": "पार्टी",
    "Peace": "शांति",
    "Peaceful": "शांतिपूर्ण",
    "Pookalam": "पूकलम",
    "Punjab": "पंजाब",
    "Quran": "क़ुरान",
    "Radha Krishna": "राधा कृष्ण",
    "Rakhi": "राखी",
    "Rama": "राम",
    "Ravana": "रावण",
    "Resurrection": "पुनरुत्थान",
    "River": "नदी",
    "Sacrifice": "बलिदान",
    "Sadhu": "साधु",
    "Saraswati": "सरस्वती",
    "Seva": "सेवा",
    "Shiva": "शिव",
    "Sikhism": "सिख धर्म",
    "Sister": "बहन",
    "Snake": "सांप",
    "Sun": "सूर्य",
    "Sweets": "मिठाई",
    "Tagore": "टैगोर",
    "Tamil Nadu": "तमिलनाडु",
    "Tradition": "परंपरा",
    "Unity": "एकता",
    "Vishnu": "विष्णु",
    "Wealth": "धन",
    "Winter": "सर्दी",
    "Women": "महिलाएं",
    "Worship": "पूजा",
    "Yellow": "पीला",
    "Yoga": "योग"
};

let seedContent = fs.readFileSync(seedFile, 'utf8');

// The format is generally:
// { code: '...', translations: { en: { name: 'EnglishName' }, hi: { name: 'CORRUPTED' } } }
// I will replace the matching regex to cleanly overwrite the translation object

// For each word in the dictionary, replace its corrupted text contextually
let replacements = 0;
seedContent = seedContent.replace(
    /en:\s*\{\s*name:\s*'([^']+)'\s*\},\s*hi:\s*\{\s*name:\s*'([^']+)'\s*\}/g,
    (match, enLabel, hiLabel) => {
        if (hiTranslations[enLabel]) {
            replacements++;
            return `en: { name: '${enLabel}' }, hi: { name: '${hiTranslations[enLabel]}' }`;
        }
        // Also check if enLabel matches but with slightly different case?
        return match;
    }
);

fs.writeFileSync(seedFile, seedContent, 'utf8');
console.log(`Successfully replaced ${replacements} Hindi translations via direct mapping.`);
