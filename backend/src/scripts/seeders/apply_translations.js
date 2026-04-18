const fs = require('fs');
const path = require('path');

const seedFile = path.join(__dirname, 'seed_unified.js');

// Helper to generate a multi-language translations object
function getTranslations(en) {
    const map = {
        // Categories
        "Festival": { hi: "त्यौहार", mr: "सण", gu: "તહેવાર", bn: "উৎসব", ta: "திருவிழா", te: "పండుగ", kn: "ಹಬ್ಬ", ml: "ഉത്സവം" },
        "National": { hi: "राष्ट्रीय", mr: "राष्ट्रीय", gu: "રાષ્ટ્રીય", bn: "জাতীয়", ta: "தேசிய", te: "జాతీయ", kn: "ರಾಷ್ಟ್ರೀಯ", ml: "ദേശീയ" },
        "Religious": { hi: "धार्मिक", mr: "धार्मिक", gu: "ધાર્મિક", bn: "ধর্মীয়", ta: "மத", te: "మతపరమైన", kn: "ಧಾರ್ಮಿಕ", ml: "മതപരമായ" },
        "Regional": { hi: "क्षेत्रीय", mr: "प्रादेशिक", gu: "પ્રાદેશિક", bn: "আঞ্চলিক", ta: "பிராந்திய", te: "ప్రాంతీయ", kn: "ಪ್ರಾದೇಶಿಕ", ml: "പ്രാദേശിക" },
        "International": { hi: "अंतर्राष्ट्रीय", mr: "आंतरराष्ट्रीय", gu: "આંતરરાષ્ટ્રીય", bn: "আন্তর্জাতিক", ta: "சர்வதேச", te: "అంతర్జాతీయ", kn: "ಅಂತರರಾಷ್ಟ್ರೀಯ", ml: "അന്താരാഷ്ട്ര" },
        
        // Vibes
        "Spiritual": { hi: "आध्यात्मिक", mr: "आध्यात्मिक", gu: "આધ્યાત્મિક", bn: "আধ্যাত্মিক", ta: "ஆன்மீகம்", te: "ఆధ్యాత్మిక", kn: "ಆಧ್ಯಾತ್ಮಿಕ", ml: "ആത്മീയ" },
        "Joyful": { hi: "हर्षित", mr: "आनंदी", gu: "આનંદી", bn: "আনন্দময়", ta: "மகிழ்ச்சியான", te: "సంతోషకరమైన", kn: "ಸಂತೋಷದಾಯಕ", ml: "സന്തോഷകരമായ" },
        "Patriotic": { hi: "देशभक्ति", mr: "देशभक्तीपर", gu: "દેશભક્તિ", bn: "দেশপ্রেমিক", ta: "தேசபக்தி", te: "దేశభక్తి", kn: "ದೇಶಭಕ್ತಿ", ml: "ദേശസ്നേഹം" },
        "Cultural": { hi: "सांस्कृतिक", mr: "सांस्कृतिक", gu: "સાંસ્કૃતિક", bn: "সাংস্কৃতিক", ta: "கலாச்சார", te: "సాంస్కృతిక", kn: "ಸಾಂಸ್ಕೃತಿಕ", ml: "സാംസ്കാരിക" },
        "Solemn": { hi: "गंभीर", mr: "गंभीर", gu: "ગંભીર", bn: "গম্ভীর", ta: "கம்பீரமான", te: "గంభీరమైన", kn: "ಗಂಭೀರ", ml: "ഗൗരവമുള്ള" },
        "Love": { hi: "प्रेम", mr: "प्रेम", gu: "પ્રેમ", bn: "ভালবাসা", ta: "காதல்", te: "ప్రేమ", kn: "ಪ್ರೀತಿ", ml: "സ്നേഹം" },
        "Morning": { hi: "सुबह", mr: "सकाळ", gu: "સવાર", bn: "সকাল", ta: "காலை", te: "ఉదయం", kn: "ಬೆಳಿಗ್ಗೆ", ml: "പ്രഭാതം" },
        "Meditative": { hi: "ध्यानपूर्ण", mr: "ध्यानपूर्ण", gu: "ધ્યાનપૂર્ણ", bn: "ধ্যানমগ্ন", ta: "தியானம்", te: "ధ్యానం", kn: "ಧ್ಯಾನ", ml: "ധ്യാനാത്മകമായ" },
        "Festive": { hi: "उत्सवी", mr: "उत्सवाचा", gu: "ઉત્સવ", bn: "উৎসবমুখর", ta: "பண்டிகை", te: "పండుగ", kn: "ಉತ್ಸವದ", ml: "ഉത്സവ" },
        "Devotional": { hi: "भक्तिमय", mr: "भक्तिमय", gu: "ભક્તિમય", bn: "ভক্তিমূলক", ta: "பக்தி", te: "భక్తి", kn: "ಭಕ್ತಿ", ml: "ഭക്തിസാന്ദ്രമായ" },
        "Reflective": { hi: "चिंतनशील", mr: "चिंतनशील", gu: "ચિંતનશીલ", bn: "প্রতিফলিত", ta: "பிரதிபலிப்பு", te: "ప్రతిబింబం", kn: "ಪ್ರತಿಬಿಂಬಿಸುವ", ml: "ചിന്തനീയമായ" },

        // Common Tags (Providing Hi/Mr/Gu for core to avoid massive memory map, and fallback to EN)
        "Ahimsa": { hi: "अहिंसा", mr: "अहिंसा", gu: "અહિંસા", ta: "அஹிம்சை" },
        "Assam": { hi: "असम", mr: "आसाम", gu: "આસામ" },
        "Auspicious": { hi: "शुभ", mr: "शुभ", gu: "શુભ" },
        "Ayodhya": { hi: "अयोध्या", mr: "अयोध्या", gu: "અયોધ્યા" },
        "Bajrangbali": { hi: "बजरंगबली", mr: "बजरंगबली", gu: "બજરંગબલી" },
        "Banyan": { hi: "बरगद", mr: "वड", gu: "વડ" },
        "Bappa": { hi: "बप्पा", mr: "बाप्पा", gu: "બાપ્પા" },
        "Bapu": { hi: "बापू", mr: "बापू", gu: "બાપુ" },
        "Bhole": { hi: "भोले", mr: "भोले", gu: "ભોલે" },
        "Bihar": { hi: "बिहार", mr: "बिहार", gu: "બિહાર" },
        "Boat Race": { hi: "नौका दौड़", mr: "नौका शर्यत", gu: "બોટ રેસ" },
        "Bonfire": { hi: "अलाव", mr: "होळी", gu: "બોનફાયર" },
        "Bravery": { hi: "वीरता", mr: "शौर्य", gu: "બહાદુરી" },
        "Brother": { hi: "भाई", mr: "भाऊ", gu: "ભાઈ" },
        "Buddha": { hi: "बुद्ध", mr: "बुद्ध", gu: "બુદ્ધ" },
        "Buddhism": { hi: "बौद्ध धर्म", mr: "बौद्ध धर्म", gu: "બૌદ્ધ ધર્મ" },
        "Celebration": { hi: "उत्सव", mr: "उत्सव", gu: "ઉજવણી" },
        "Christian": { hi: "ईसाई", mr: "ख्रिश्चन", gu: "ખ્રિસ્તી" },
        "Colors": { hi: "रंग", mr: "रंग", gu: "રંગ" },
        "Constitution": { hi: "संविधान", mr: "संविधान", gu: "બંધારણ" },
        "Couple": { hi: "जोड़ा", mr: "जोडपे", gu: "જોડું" },
        "Crackers": { hi: "पटाखे", mr: "फटाके", gu: "ફટાકડા" },
        "Dahi Handi": { hi: "दही हांडी", mr: "दहीहंडी", gu: "દહી હાંડી" },
        "Dalit": { hi: "दलित", mr: "दलित", gu: "દલિત" },
        "Dance": { hi: "नृत्य", mr: "नृत्य", gu: "નૃત્ય" },
        "Dandiya": { hi: "डांडिया", mr: "दांडिया", gu: "ડાંડિયા" },
        "Devi": { hi: "देवी", mr: "देवी", gu: "દેવી" },
        "Diya": { hi: "दीया", mr: "दिवा", gu: "દીવો" },
        "Durga": { hi: "दुर्गा", mr: "दुर्गा", gu: "દુર્ગા" },
        "Eid": { hi: "ईद", mr: "ईद", gu: "ઈદ" },
        "Enlightenment": { hi: "ज्ञान", mr: "ज्ञान", gu: "જ્ઞાન" },
        "Equality": { hi: "समानता", mr: "समानता", gu: "સમાનતા" },
        "Family": { hi: "परिवार", mr: "कुटुंब", gu: "કુટુંબ" },
        "Fasting": { hi: "उपवास", mr: "उपवास", gu: "ઉપવાસ" },
        "Feast": { hi: "भोज", mr: "मेजवानी", gu: "તહેવાર" },
        "Flag": { hi: "तिरंगा", mr: "तिरंगा", gu: "ધ્વજ" },
        "Forgiveness": { hi: "क्षमा", mr: "क्षमा", gu: "ક્ષમા" },
        "Freedom": { hi: "आज़ादी", mr: "स्वातंत्र्य", gu: "સ્વતંત્રતા" },
        "Fun": { hi: "मौज-मस्ती", mr: "मजा", gu: "મજા" },
        "Gandhi": { hi: "गांधी", mr: "गांधी", gu: "ગાંધી" },
        "Ganesha": { hi: "गणेश", mr: "गणेश", gu: "ગણેશ" },
        "Garba": { hi: "गरबा", mr: "गरबा", gu: "ગરબા" },
        "Gurpurab": { hi: "गुरुपर्व", mr: "गुरुपूरब", gu: "ગુરુપુરબ" },
        "Guru": { hi: "गुरु", mr: "गुरू", gu: "ગુરુ" },
        "Guru Nanak": { hi: "गुरु नानक", mr: "गुरु नानक", gu: "ગુરુ નાનક" },
        "Hajj": { hi: "हज", mr: "हज", gu: "હજ" },
        "Hanuman": { hi: "हनुमान", mr: "हनुमान", gu: "હનુમાન" },
        "Har Har Mahadev": { hi: "हर हर महादेव", mr: "हर हर महादेव", gu: "હર હર મહાદેવ" },
        "Harvest": { hi: "फसल", mr: "पीक", gu: "લણણી" },
        "Health": { hi: "स्वास्थ्य", mr: "आरोग्य", gu: "સ્વાસ્થ્ય" },
        "Heart": { hi: "दिल", mr: "हृदय", gu: "હૃદય" },
        "Hindu": { hi: "हिंदू", mr: "हिंदू", gu: "હિન્દુ" },
        "Holidays": { hi: "छुट्टियां", mr: "सुट्ट्या", gu: "રજાઓ" },
        "India": { hi: "भारत", mr: "भारत", gu: "ભારત" },
        "Islam": { hi: "इस्लाम", mr: "इस्लाम", gu: "ઇસ્લામ" },
        "Jai Hind": { hi: "जय हिंद", mr: "जय हिंद", gu: "જય હિન્દ" },
        "Jain": { hi: "जैन", mr: "जैन", gu: "જૈન" },
        "Jesus": { hi: "यीशु", mr: "येशू", gu: "ઈસુ" },
        "Kanha": { hi: "कान्हा", mr: "कान्हा", gu: "કાન્હા" },
        "Kannada": { hi: "कन्नड़", mr: "कन्नड", gu: "કન્નડ" },
        "Kerala": { hi: "केरल", mr: "केरळ", gu: "કેરળ" },
        "Khalsa": { hi: "खालसा", mr: "खालसा", gu: "ખાલસા" },
        "Kite": { hi: "पतंग", mr: "पतंग", gu: "પતંગ" },
        "Krishna": { hi: "कृष्ण", mr: "कृष्ण", gu: "કૃષ્ણ" },
        "Lakshmi": { hi: "लक्ष्मी", mr: "लक्ष्मी", gu: "લક્ષ્મી" },
        "Lights": { hi: "रोशनी", mr: "प्रकाशाचा", gu: "પ્રકાશ" },
        "Mahabali": { hi: "महाबली", mr: "महाबली", gu: "મહાબલી" },
        "Maharashtra": { hi: "महाराष्ट्र", mr: "महाराष्ट्र", gu: "મહારાષ્ટ્ર" },
        "Mahavir": { hi: "महावीर", mr: "महावीर", gu: "મહાવીર" },
        "Maratha": { hi: "मराठा", mr: "मराठा", gu: "મરાઠા" },
        "Martial Arts": { hi: "मार्शल आर्ट", mr: "मार्शल आर्ट्स", gu: "માર્શલ આર્ટ્સ" },
        "Meditation": { hi: "ध्यान", mr: "ध्यान", gu: "ધ્યાન" },
        "Modak": { hi: "मोदक", mr: "मोदक", gu: "મોદક" },
        "Moon": { hi: "चांद", mr: "चंद्र", gu: "ચંદ્ર" },
        "Mourning": { hi: "शोक", mr: "शोक", gu: "શોક" },
        "New Year": { hi: "नव वर्ष", mr: "नवीन वर्ष", gu: "નવું વર્ષ" },
        "Non-Violence": { hi: "अहिंसा", mr: "अहिंसा", gu: "અહિંસા" },
        "Parade": { hi: "परेड", mr: "परेड", gu: "પરેડ" },
        "Party": { hi: "पार्टी", mr: "पार्टी", gu: "પાર્ટી" },
        "Peace": { hi: "शांति", mr: "शांती", gu: "શાંતિ" },
        "Peaceful": { hi: "शांतिपूर्ण", mr: "शांततापूर्ण", gu: "શાંતિપૂર્ણ" },
        "Pookalam": { hi: "पूकलम", mr: "पुकलम", gu: "પૂકલમ" },
        "Punjab": { hi: "पंजाब", mr: "पंजाब", gu: "પંજાબ" },
        "Quran": { hi: "क़ुरान", mr: "कुराण", gu: "કુરાન" },
        "Radha Krishna": { hi: "राधा कृष्ण", mr: "राधा कृष्ण", gu: "રાધા કૃષ્ણ" },
        "Rakhi": { hi: "राखी", mr: "राखी", gu: "રાખી" },
        "Rama": { hi: "राम", mr: "राम", gu: "રામ" },
        "Ravana": { hi: "रावण", mr: "रावण", gu: "રાવણ" },
        "Resurrection": { hi: "पुनरुत्थान", mr: "पुनरुत्थान", gu: "પુનરુત્થાન" },
        "River": { hi: "नदी", mr: "नदी", gu: "નદી" },
        "Sacrifice": { hi: "बलिदान", mr: "बलिदान", gu: "બલિદાન" },
        "Sadhu": { hi: "साधु", mr: "साधू", gu: "સાધુ" },
        "Saraswati": { hi: "सरस्वती", mr: "सरस्वती", gu: "સરસ્વતી" },
        "Seva": { hi: "सेवा", mr: "सेवा", gu: "સેવા" },
        "Shiva": { hi: "शिव", mr: "शिव", gu: "શિવ" },
        "Sikhism": { hi: "सिख धर्म", mr: "शीख धर्म", gu: "શીખ ધર્મ" },
        "Sister": { hi: "बहन", mr: "बहीण", gu: "બહેન" },
        "Snake": { hi: "सांप", mr: "साप", gu: "સાપ" },
        "Sun": { hi: "सूर्य", mr: "सूर्य", gu: "સૂર્ય" },
        "Sweets": { hi: "मिठाई", mr: "मिठाई", gu: "મીઠાઈ" },
        "Tagore": { hi: "टैगोर", mr: "टागोर", gu: "ટાગોર" },
        "Tamil Nadu": { hi: "तमिलनाडु", mr: "तमिळनाडू", gu: "તમિલનાડુ" },
        "Tradition": { hi: "परंपरा", mr: "परंपरा", gu: "પરંપરા" },
        "Unity": { hi: "एकता", mr: "एकता", gu: "એકતા" },
        "Vishnu": { hi: "विष्णु", mr: "विष्णू", gu: "વિષ્ણુ" },
        "Wealth": { hi: "धन", mr: "संपत्ती", gu: "સંપત્તિ" },
        "Winter": { hi: "सर्दी", mr: "हिवाळा", gu: "શિયાળો" },
        "Women": { hi: "महिलाएं", mr: "महिला", gu: "મહિલા" },
        "Worship": { hi: "पूजा", mr: "पूजा", gu: "પૂજા" },
        "Yellow": { hi: "पीला", mr: "पिवळा", gu: "પીળો" },
        "Yoga": { hi: "योग", mr: "योग", gu: "યોગ" }
    };

    const trans = map[en] || { hi: en }; // fallback to the english word directly if not in dict
    // Format into standard MongoDB format
    let result = `{ en: { name: '${en}' }`;
    for (const [lang, word] of Object.entries(trans)) {
        result += `, ${lang}: { name: '${word}' }`;
    }
    result += ` }`;
    return result;
}

// Ensure clean slate
require('child_process').execSync('git checkout seed_unified.js', { cwd: __dirname });

let seedContent = fs.readFileSync(seedFile, 'utf8');
let replacedCount = 0;

// Find ALL translations: { en: { name: 'EnglishName' }, hi: { name: 'CORRUPTED' } }
// We match start from translations: { en: { name: ' up to the closing } of the hi object
seedContent = seedContent.replace(
    /translations:\s*\{[^}]*en:\s*\{\s*name:\s*'([^']+)'\s*\}[^}]*(?:,\s*hi:\s*\{\s*name:\s*'[^']+'\s*\})?[^}]*\}/g,
    (match, enName) => {
        replacedCount++;
        return `translations: ${getTranslations(enName)}`;
    }
);

fs.writeFileSync(seedFile, seedContent, 'utf8');
console.log(`Replaced completely translation maps. Count: ${replacedCount}`);
