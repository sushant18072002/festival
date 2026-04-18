/**
 * seed_unified.js — Master database seeder for Utsav Pro
 * 
 * Replaces older single-purpose seeders.
 * Modernized to use AWS SDK v3.
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });
const mongoose = require('mongoose');
const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');

// Models
const Category = require('../../models/Category');
const Tag = require('../../models/Tag');
const Vibe = require('../../models/Vibe');
const Event = require('../../models/Event');
const Quote = require('../../models/Quote');
const Greeting = require('../../models/Greeting');
const Mantra = require('../../models/Mantra');
const Image = require('../../models/Image');
const LottieOverlay = require('../../models/LottieOverlay');
const GamificationConfig = require('../../models/GamificationConfig');
const Trivia = require('../../models/Trivia');
const AmbientAudio = require('../../models/AmbientAudio');

// Data sources
const eventData = require('../../../data/events_2026.json');
const quoteData = require('../../../data/quotes.json');
const greetingData = require('../../../data/greetings.json');
const mantraData = require('../../../data/mantras_seed.json');
const ambientAudioData = require('../../../data/ambient_audio_seed.json');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/utsav_share';

// S3 config
const BUCKET_NAME = process.env.AWS_BUCKET_NAME;
const env = process.env.DEPLOY_ENV || 'stage';
const base = process.env.S3_BASE_PATH || 'Utsav';

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const STATIC_CATEGORIES = [
    { code: 'festival', translations: { en: { name: 'Festival' }, hi: { name: 'त्यौहार' }, mr: { name: 'सण' }, gu: { name: 'તહેવાર' }, bn: { name: 'উৎসব' }, ta: { name: 'திருவிழா' }, te: { name: 'పండుగ' }, kn: { name: 'ಹಬ್ಬ' }, ml: { name: 'ഉത്സവം' } }, icon: 'Sparkles', color: 'purple' },
    { code: 'national', translations: { en: { name: 'National' }, hi: { name: 'राष्ट्रीय' }, mr: { name: 'राष्ट्रीय' }, gu: { name: 'રાષ્ટ્રીય' }, bn: { name: 'জাতীয়' }, ta: { name: 'தேசிய' }, te: { name: 'జాతీయ' }, kn: { name: 'ರಾಷ್ಟ್ರೀಯ' }, ml: { name: 'ദേശീയ' } }, icon: 'Flag', color: 'orange' },
    { code: 'religious', translations: { en: { name: 'Religious' }, hi: { name: 'धार्मिक' }, mr: { name: 'धार्मिक' }, gu: { name: 'ધાર્મિક' }, bn: { name: 'ধর্মীয়' }, ta: { name: 'மத' }, te: { name: 'మతపరమైన' }, kn: { name: 'ಧಾರ್ಮಿಕ' }, ml: { name: 'മതപരമായ' } }, icon: 'Om', color: 'red' },
    { code: 'regional', translations: { en: { name: 'Regional' }, hi: { name: 'क्षेत्रीय' }, mr: { name: 'प्रादेशिक' }, gu: { name: 'પ્રાદેશિક' }, bn: { name: 'আঞ্চলিক' }, ta: { name: 'பிராந்திய' }, te: { name: 'ప్రాంతీయ' }, kn: { name: 'ಪ್ರಾದೇಶಿಕ' }, ml: { name: 'പ്രാദേശിക' } }, icon: 'MapPin', color: 'teal' },
    { code: 'international', translations: { en: { name: 'International' }, hi: { name: 'अंतर्राष्ट्रीय' }, mr: { name: 'आंतरराष्ट्रीय' }, gu: { name: 'આંતરરાષ્ટ્રીય' }, bn: { name: 'আন্তর্জাতিক' }, ta: { name: 'சர்வதேச' }, te: { name: 'அந்தర్జాతీయ' }, kn: { name: 'ಅಂತರರಾಷ್ಟ್ರೀಯ' }, ml: { name: 'അന്താരാഷ്ട്ര' } }, icon: 'Globe', color: 'blue' }
];

const STATIC_TAGS = [
    { code: 'ahimsa', translations: { en: { name: 'Ahimsa' }, hi: { name: 'अहिंसा' }, mr: { name: 'अहिंसा' }, gu: { name: 'અહિંસા' } } },
    { code: 'assam', translations: { en: { name: 'Assam' }, hi: { name: 'असम' }, mr: { name: 'आसाम' }, gu: { name: 'આસામ' } } },
    { code: 'auspicious', translations: { en: { name: 'Auspicious' }, hi: { name: 'शुभ' }, mr: { name: 'शुभ' }, gu: { name: 'શુભ' } } },
    { code: 'ayodhya', translations: { en: { name: 'Ayodhya' }, hi: { name: 'अयोध्या' }, mr: { name: 'अयोध्या' }, gu: { name: 'અયોધ્યા' } } },
    { code: 'bajrangbali', translations: { en: { name: 'Bajrangbali' }, hi: { name: 'बजरंगबली' }, mr: { name: 'बजरंगबली' }, gu: { name: 'બજરંગબલી' } } },
    { code: 'banyan', translations: { en: { name: 'Banyan' }, hi: { name: 'बरगद' }, mr: { name: 'वड' }, gu: { name: 'વડ' } } },
    { code: 'bappa', translations: { en: { name: 'Bappa' }, hi: { name: 'बप्पा' }, mr: { name: 'बाप्पा' }, gu: { name: 'બાપ્પા' } } },
    { code: 'bapu', translations: { en: { name: 'Bapu' }, hi: { name: 'बापू' }, mr: { name: 'बापू' }, gu: { name: 'બાપુ' } } },
    { code: 'bhole', translations: { en: { name: 'Bhole' }, hi: { name: 'भोले' }, mr: { name: 'भोले' }, gu: { name: 'ભોલે' } } },
    { code: 'bihar', translations: { en: { name: 'Bihar' }, hi: { name: 'बिहार' }, mr: { name: 'बिहार' }, gu: { name: 'બિહાર' } } },
    { code: 'boat-race', translations: { en: { name: 'Boat Race' }, hi: { name: 'नौका दौड़' }, mr: { name: 'नौका शर्यत' }, gu: { name: 'બોટ રેસ' } } },
    { code: 'bonfire', translations: { en: { name: 'Bonfire' }, hi: { name: 'अलाव' }, mr: { name: 'होळी' }, gu: { name: 'બોનફાયર' } } },
    { code: 'bravery', translations: { en: { name: 'Bravery' }, hi: { name: 'वीरता' }, mr: { name: 'शौर्य' }, gu: { name: 'બહાદુરી' } } },
    { code: 'brother', translations: { en: { name: 'Brother' }, hi: { name: 'भाई' }, mr: { name: 'भाऊ' }, gu: { name: 'ભાઈ' } } },
    { code: 'buddha', translations: { en: { name: 'Buddha' }, hi: { name: 'बुद्ध' }, mr: { name: 'बुद्ध' }, gu: { name: 'બુદ્ધ' } } },
    { code: 'buddhism', translations: { en: { name: 'Buddhism' }, hi: { name: 'बौद्ध धर्म' }, mr: { name: 'बौद्ध धर्म' }, gu: { name: 'બૌદ્ધ ધર્મ' } } },
    { code: 'celebration', translations: { en: { name: 'Celebration' }, hi: { name: 'उत्सव' }, mr: { name: 'उत्सव' }, gu: { name: 'ઉજવણી' } } },
    { code: 'christian', translations: { en: { name: 'Christian' }, hi: { name: 'ईसाई' }, mr: { name: 'ख्रिश्चन' }, gu: { name: 'ખ્રિસ્તી' } } },
    { code: 'colors', translations: { en: { name: 'Colors' }, hi: { name: 'रंग' }, mr: { name: 'रंग' }, gu: { name: 'રંગ' } } },
    { code: 'constitution', translations: { en: { name: 'Constitution' }, hi: { name: 'संविधान' }, mr: { name: 'संविधान' }, gu: { name: 'બંધારણ' } } },
    { code: 'couple', translations: { en: { name: 'Couple' }, hi: { name: 'जोड़ा' }, mr: { name: 'जोडपे' }, gu: { name: 'જોડું' } } },
    { code: 'crackers', translations: { en: { name: 'Crackers' }, hi: { name: 'पटाखे' }, mr: { name: 'फटाके' }, gu: { name: 'ફટાકડા' } } },
    { code: 'dahi-handi', translations: { en: { name: 'Dahi Handi' }, hi: { name: 'दही हांडी' }, mr: { name: 'दहीहंडी' }, gu: { name: 'દહી હાંડી' } } },
    { code: 'dalit', translations: { en: { name: 'Dalit' }, hi: { name: 'दलित' }, mr: { name: 'दलित' }, gu: { name: 'દલિત' } } },
    { code: 'dance', translations: { en: { name: 'Dance' }, hi: { name: 'नृत्य' }, mr: { name: 'नृत्य' }, gu: { name: 'નૃત્ય' } } },
    { code: 'dandiya', translations: { en: { name: 'Dandiya' }, hi: { name: 'डांडिया' }, mr: { name: 'दांडिया' }, gu: { name: 'ડાંડિયા' } } },
    { code: 'devi', translations: { en: { name: 'Devi' }, hi: { name: 'देवी' }, mr: { name: 'देवी' }, gu: { name: 'દેવી' } } },
    { code: 'diya', translations: { en: { name: 'Diya' }, hi: { name: 'दीया' }, mr: { name: 'दिवा' }, gu: { name: 'દીવો' } } },
    { code: 'durga', translations: { en: { name: 'Durga' }, hi: { name: 'दुर्गा' }, mr: { name: 'दुर्गा' }, gu: { name: 'દુર્ગા' } } },
    { code: 'eid', translations: { en: { name: 'Eid' }, hi: { name: 'ईद' }, mr: { name: 'ईद' }, gu: { name: 'ઈદ' } } },
    { code: 'enlightenment', translations: { en: { name: 'Enlightenment' }, hi: { name: 'ज्ञान' }, mr: { name: 'ज्ञान' }, gu: { name: 'જ્ઞાન' } } },
    { code: 'equality', translations: { en: { name: 'Equality' }, hi: { name: 'समानता' }, mr: { name: 'समानता' }, gu: { name: 'સમાનતા' } } },
    { code: 'family', translations: { en: { name: 'Family' }, hi: { name: 'परिवार' }, mr: { name: 'कुटुंब' }, gu: { name: 'કુટુંબ' } } },
    { code: 'fasting', translations: { en: { name: 'Fasting' }, hi: { name: 'उपवास' }, mr: { name: 'उपवास' }, gu: { name: 'ઉપવાસ' } } },
    { code: 'feast', translations: { en: { name: 'Feast' }, hi: { name: 'भोज' }, mr: { name: 'मेजवानी' }, gu: { name: 'ભોજ' } } },
    { code: 'festival', translations: { en: { name: 'Festival' }, hi: { name: 'त्यौहार' }, mr: { name: 'सण' }, gu: { name: 'તહેવાર' } } },
    { code: 'flag', translations: { en: { name: 'Flag' }, hi: { name: 'तिरंगा' }, mr: { name: 'तिरंगा' }, gu: { name: 'ધ્વજ' } } },
    { code: 'forgiveness', translations: { en: { name: 'Forgiveness' }, hi: { name: 'क्षमा' }, mr: { name: 'क्षमा' }, gu: { name: 'ક્ષમા' } } },
    { code: 'freedom', translations: { en: { name: 'Freedom' }, hi: { name: 'आज़ादी' }, mr: { name: 'स्वातंत्र्य' }, gu: { name: 'સ્વતંત્રતા' } } },
    { code: 'fun', translations: { en: { name: 'Fun' }, hi: { name: 'मौज-मस्ती' }, mr: { name: 'मजा' }, gu: { name: 'મજા' } } },
    { code: 'gandhi', translations: { en: { name: 'Gandhi' }, hi: { name: 'गांधी' }, mr: { name: 'गांधी' }, gu: { name: 'ગાંધી' } } },
    { code: 'ganesha', translations: { en: { name: 'Ganesha' }, hi: { name: 'गणेश' }, mr: { name: 'गणेश' }, gu: { name: 'ગણેશ' } } },
    { code: 'garba', translations: { en: { name: 'Garba' }, hi: { name: 'गरबा' }, mr: { name: 'गरबा' }, gu: { name: 'ગરબા' } } },
    { code: 'gurpurab', translations: { en: { name: 'Gurpurab' }, hi: { name: 'गुरुपर्व' }, mr: { name: 'गुरुपूरब' }, gu: { name: 'ગુરુપુરબ' } } },
    { code: 'guru', translations: { en: { name: 'Guru' }, hi: { name: 'गुरु' }, mr: { name: 'गुरू' }, gu: { name: 'ગુરુ' } } },
    { code: 'guru-nanak', translations: { en: { name: 'Guru Nanak' }, hi: { name: 'गुरु नानक' }, mr: { name: 'गुरु नानक' }, gu: { name: 'ગુરુ નાનક' } } },
    { code: 'hajj', translations: { en: { name: 'Hajj' }, hi: { name: 'हज' }, mr: { name: 'हज' }, gu: { name: 'હજ' } } },
    { code: 'hanuman', translations: { en: { name: 'Hanuman' }, hi: { name: 'हनुमान' }, mr: { name: 'हनुमान' }, gu: { name: 'હનુમાન' } } },
    { code: 'har-har-mahadev', translations: { en: { name: 'Har Har Mahadev' }, hi: { name: 'हर हर महादेव' }, mr: { name: 'हर हर महादेव' }, gu: { name: 'હર હર મહાદેવ' } } },
    { code: 'harvest', translations: { en: { name: 'Harvest' }, hi: { name: 'फसल' }, mr: { name: 'पीक' }, gu: { name: 'લણણી' } } },
    { code: 'health', translations: { en: { name: 'Health' }, hi: { name: 'स्वास्थ्य' }, mr: { name: 'आरोग्य' }, gu: { name: 'સ્વાસ્થ્ય' } } },
    { code: 'heart', translations: { en: { name: 'Heart' }, hi: { name: 'दिल' }, mr: { name: 'हृदय' }, gu: { name: 'हृदय' } } },
    { code: 'hindu', translations: { en: { name: 'Hindu' }, hi: { name: 'हिंदू' }, mr: { name: 'हिंदू' }, gu: { name: 'હિન્દુ' } } },
    { code: 'holidays', translations: { en: { name: 'Holidays' }, hi: { name: 'छुट्टियां' }, mr: { name: 'सुट्ट्या' }, gu: { name: 'રજાઓ' } } },
    { code: 'india', translations: { en: { name: 'India' }, hi: { name: 'भारत' }, mr: { name: 'भारत' }, gu: { name: 'ભારત' } } },
    { code: 'islam', translations: { en: { name: 'Islam' }, hi: { name: 'इस्लाम' }, mr: { name: 'इस्लाम' }, gu: { name: 'ઇસ્લામ' } } },
    { code: 'jai-hind', translations: { en: { name: 'Jai Hind' }, hi: { name: 'जय हिंद' }, mr: { name: 'जय हिंद' }, gu: { name: 'જય હિન્દ' } } },
    { code: 'jain', translations: { en: { name: 'Jain' }, hi: { name: 'जैन' }, mr: { name: 'जैन' }, gu: { name: 'જૈન' } } },
    { code: 'jesus', translations: { en: { name: 'Jesus' }, hi: { name: 'यीशु' }, mr: { name: 'येशू' }, gu: { name: 'ઈસુ' } } },
    { code: 'kanha', translations: { en: { name: 'Kanha' }, hi: { name: 'कान्हा' }, mr: { name: 'कान्हा' }, gu: { name: 'કાન્હા' } } },
    { code: 'kannada', translations: { en: { name: 'Kannada' }, hi: { name: 'कन्नड़' }, mr: { name: 'कन्नड' }, gu: { name: 'કન્નડ' } } },
    { code: 'kerala', translations: { en: { name: 'Kerala' }, hi: { name: 'केरल' }, mr: { name: 'केरळ' }, gu: { name: 'કેરળ' } } },
    { code: 'khalsa', translations: { en: { name: 'Khalsa' }, hi: { name: 'खालसा' }, mr: { name: 'खालसा' }, gu: { name: 'ખાલસા' } } },
    { code: 'kite', translations: { en: { name: 'Kite' }, hi: { name: 'पतंग' }, mr: { name: 'पतंग' }, gu: { name: 'પતંગ' } } },
    { code: 'krishna', translations: { en: { name: 'Krishna' }, hi: { name: 'कृष्ण' }, mr: { name: 'कृष्ण' }, gu: { name: 'કૃષ્ણ' } } },
    { code: 'lakshmi', translations: { en: { name: 'Lakshmi' }, hi: { name: 'लक्ष्मी' }, mr: { name: 'लक्ष्मी' }, gu: { name: 'લક્ષ્મી' } } },
    { code: 'lights', translations: { en: { name: 'Lights' }, hi: { name: 'रोशनी' }, mr: { name: 'प्रकाशाचा' }, gu: { name: 'પ્રકાશ' } } },
    { code: 'love', translations: { en: { name: 'Love' }, hi: { name: 'प्रेम' }, mr: { name: 'प्रेम' }, gu: { name: 'પ્રેમ' } } },
    { code: 'mahabali', translations: { en: { name: 'Mahabali' }, hi: { name: 'महाबली' }, mr: { name: 'महाबली' }, gu: { name: 'મહાબલી' } } },
    { code: 'maharashtra', translations: { en: { name: 'Maharashtra' }, hi: { name: 'महाराष्ट्र' }, mr: { name: 'महाराष्ट्र' }, gu: { name: 'મહારાષ્ટ્ર' } } },
    { code: 'mahavir', translations: { en: { name: 'Mahavir' }, hi: { name: 'महावीर' }, mr: { name: 'महावीर' }, gu: { name: 'મહાવીર' } } },
    { code: 'maratha', translations: { en: { name: 'Maratha' }, hi: { name: 'मराठा' }, mr: { name: 'मराठा' }, gu: { name: 'મરાઠા' } } },
    { code: 'martial-arts', translations: { en: { name: 'Martial Arts' }, hi: { name: 'मार्शल आर्ट' }, mr: { name: 'मार्शल आर्ट्स' }, gu: { name: 'માર્શલ આર્ટ્સ' } } },
    { code: 'meditation', translations: { en: { name: 'Meditation' }, hi: { name: 'ध्यान' }, mr: { name: 'ध्यान' }, gu: { name: 'ધ્યાન' } } },
    { code: 'modak', translations: { en: { name: 'Modak' }, hi: { name: 'मोदक' }, mr: { name: 'मोदक' }, gu: { name: 'મોદક' } } },
    { code: 'moon', translations: { en: { name: 'Moon' }, hi: { name: 'चांद' }, mr: { name: 'चंद्र' }, gu: { name: 'ચંદ્ર' } } },
    { code: 'mourning', translations: { en: { name: 'Mourning' }, hi: { name: 'शोक' }, mr: { name: 'शोक' }, gu: { name: 'શોક' } } },
    { code: 'new-year', translations: { en: { name: 'New Year' }, hi: { name: 'नव वर्ष' }, mr: { name: 'नवीन वर्ष' }, gu: { name: 'નવું વર્ષ' } } },
    { code: 'non-violence', translations: { en: { name: 'Non-Violence' }, hi: { name: 'अहिंसा' }, mr: { name: 'अहिंसा' }, gu: { name: 'અહિંસા' } } },
    { code: 'parade', translations: { en: { name: 'Parade' }, hi: { name: 'परेड' }, mr: { name: 'परेड' }, gu: { name: 'પરેડ' } } },
    { code: 'party', translations: { en: { name: 'Party' }, hi: { name: 'पार्टी' }, mr: { name: 'पार्टी' }, gu: { name: 'પાર્ટી' } } },
    { code: 'patriotic', translations: { en: { name: 'Patriotic' }, hi: { name: 'देशभक्त' }, mr: { name: 'देशभक्त' }, gu: { name: 'દેશભક્ત' } } },
    { code: 'peace', translations: { en: { name: 'Peace' }, hi: { name: 'शांति' }, mr: { name: 'शांती' }, gu: { name: 'શાંતિ' } } },
    { code: 'peaceful', translations: { en: { name: 'Peaceful' }, hi: { name: 'शांतिपूर्ण' }, mr: { name: 'शांततापूर्ण' }, gu: { name: 'શાંતિપૂર્ણ' } } },
    { code: 'pookalam', translations: { en: { name: 'Pookalam' }, hi: { name: 'पूकलम' }, mr: { name: 'पुकलम' }, gu: { name: 'પૂકલમ' } } },
    { code: 'punjab', translations: { en: { name: 'Punjab' }, hi: { name: 'पंजाब' }, mr: { name: 'पंजाब' }, gu: { name: 'પંજાબ' } } },
    { code: 'quran', translations: { en: { name: 'Quran' }, hi: { name: 'क़ुरान' }, mr: { name: 'कुराण' }, gu: { name: 'કુરાન' } } },
    { code: 'radha-krishna', translations: { en: { name: 'Radha Krishna' }, hi: { name: 'राधा कृष्ण' }, mr: { name: 'राधा कृष्ण' }, gu: { name: 'રાધા કૃષ્ણ' } } },
    { code: 'rakhi', translations: { en: { name: 'Rakhi' }, hi: { name: 'राखी' }, mr: { name: 'राखी' }, gu: { name: 'રાખી' } } },
    { code: 'rama', translations: { en: { name: 'Rama' }, hi: { name: 'राम' }, mr: { name: 'राम' }, gu: { name: 'રામ' } } },
    { code: 'ravana', translations: { en: { name: 'Ravana' }, hi: { name: 'रावण' }, mr: { name: 'रावण' }, gu: { name: 'રાવણ' } } },
    { code: 'resurrection', translations: { en: { name: 'Resurrection' }, hi: { name: 'पुनरुत्थान' }, mr: { name: 'पुनरुत्थान' }, gu: { name: 'પુનરુત્થાન' } } },
    { code: 'river', translations: { en: { name: 'River' }, hi: { name: 'नदी' }, mr: { name: 'नदी' }, gu: { name: 'નદી' } } },
    { code: 'sacrifice', translations: { en: { name: 'Sacrifice' }, hi: { name: 'बलिदान' }, mr: { name: 'बलिदान' }, gu: { name: 'બલિદાન' } } },
    { code: 'sadhu', translations: { en: { name: 'Sadhu' }, hi: { name: 'साधु' }, mr: { name: 'साधू' }, gu: { name: 'સાધુ' } } },
    { code: 'saraswati', translations: { en: { name: 'Saraswati' }, hi: { name: 'सरस्वती' }, mr: { name: 'सरस्वती' }, gu: { name: 'સરસ્વતી' } } },
    { code: 'seva', translations: { en: { name: 'Seva' }, hi: { name: 'सेवा' }, mr: { name: 'सेवा' }, gu: { name: 'સેવા' } } },
    { code: 'shiva', translations: { en: { name: 'Shiva' }, hi: { name: 'शिव' }, mr: { name: 'शिव' }, gu: { name: 'શિવ' } } },
    { code: 'sikhism', translations: { en: { name: 'Sikhism' }, hi: { name: 'सिख धर्म' }, mr: { name: 'शीख धर्म' }, gu: { name: 'શીખ ધર્મ' } } },
    { code: 'sister', translations: { en: { name: 'Sister' }, hi: { name: 'बहन' }, mr: { name: 'बहीण' }, gu: { name: 'ಬಹೆನ್' } } },
    { code: 'snake', translations: { en: { name: 'Snake' }, hi: { name: 'सांप' }, mr: { name: 'साप' }, gu: { name: 'સાપ' } } },
    { code: 'sun', translations: { en: { name: 'Sun' }, hi: { name: 'सूर्य' }, mr: { name: 'सूर्य' }, gu: { name: 'સૂર્ય' } } },
    { code: 'sweets', translations: { en: { name: 'Sweets' }, hi: { name: 'मिठाई' }, mr: { name: 'मिठाई' }, gu: { name: 'મીઠાઈ' } } },
    { code: 'tagore', translations: { en: { name: 'Tagore' }, hi: { name: 'टैगोर' }, mr: { name: 'टागोर' }, gu: { name: 'ટાગોર' } } },
    { code: 'tamilnadu', translations: { en: { name: 'Tamil Nadu' }, hi: { name: 'तमिलनाडु' }, mr: { name: 'तमिळनाडू' }, gu: { name: 'તમિલનાડુ' } } },
    { code: 'tradition', translations: { en: { name: 'Tradition' }, hi: { name: 'परंपरा' }, mr: { name: 'परंपरा' }, gu: { name: 'પરંપરા' } } },
    { code: 'unity', translations: { en: { name: 'Unity' }, hi: { name: 'एकता' }, mr: { name: 'एकता' }, gu: { name: 'એકતા' } } },
    { code: 'vishnu', translations: { en: { name: 'Vishnu' }, hi: { name: 'विष्णु' }, mr: { name: 'विष्णू' }, gu: { name: 'વિષ્ણુ' } } },
    { code: 'wealth', translations: { en: { name: 'Wealth' }, hi: { name: 'धन' }, mr: { name: 'संपत्ती' }, gu: { name: 'સંપત્તિ' } } },
    { code: 'winter', translations: { en: { name: 'Winter' }, hi: { name: 'सर्दी' }, mr: { name: 'हिवाळा' }, gu: { name: 'શિયાળો' } } },
    { code: 'women', translations: { en: { name: 'Women' }, hi: { name: 'महिलाएं' }, mr: { name: 'महिला' }, gu: { name: 'મહિલા' } } },
    { code: 'worship', translations: { en: { name: 'Worship' }, hi: { name: 'पूजा' }, mr: { name: 'पूजा' }, gu: { name: 'પૂજા' } } },
    { code: 'yellow', translations: { en: { name: 'Yellow' }, hi: { name: 'पीला' }, mr: { name: 'पिवळा' }, gu: { name: 'પીળો' } } },
    { code: 'yoga', translations: { en: { name: 'Yoga' }, hi: { name: 'योग' }, mr: { name: 'योग' }, gu: { name: 'યોગ' } } }
];

const STATIC_VIBES = [
    { code: 'spiritual', icon: 'Sparkles', color: '#8b5cf6', translations: { en: { name: 'Spiritual' }, hi: { name: 'आध्यात्मिक' }, mr: { name: 'आध्यात्मिक' }, gu: { name: 'આધ્યાત્મિક' }, bn: { name: 'আধ্যাত্মিক' }, ta: { name: 'ஆன்மீகம்' }, te: { name: 'ఆధ్యాత్మిక' }, kn: { name: 'ಆಧ್ಯಾತ್ಮಿಕ' }, ml: { name: 'ആത്മീയ' } } },
    { code: 'joyful', icon: 'PartyPopper', color: '#f59e0b', translations: { en: { name: 'Joyful' }, hi: { name: 'हर्षित' }, mr: { name: 'आनंदी' }, gu: { name: 'આનંદી' }, bn: { name: 'আনন্দময়' }, ta: { name: 'மகிழ்ச்சியான' }, te: { name: 'సంతోషకరమైన' }, kn: { name: 'ಸಂತೋಷದಾಯಕ' }, ml: { name: 'സന്തോഷകരമായ' } } },
    { code: 'patriotic', icon: 'Flag', color: '#10b981', translations: { en: { name: 'Patriotic' }, hi: { name: 'देशभक्ति' }, mr: { name: 'देशभक्तीपर' }, gu: { name: 'દેશભક્તિ' }, bn: { name: 'দেশপ্রেমিক' }, ta: { name: 'தேசபக்தி' }, te: { name: 'దేశభక్తి' }, kn: { name: 'ದೇಶಭಕ್ತಿ' }, ml: { name: 'ദേശസ്നേഹം' } } },
    { code: 'cultural', icon: 'Music', color: '#ec4899', translations: { en: { name: 'Cultural' }, hi: { name: 'सांस्कृतिक' }, mr: { name: 'सांस्कृतिक' }, gu: { name: 'સાંસ્કૃતિક' }, bn: { name: 'সাংস্কৃতিক' }, ta: { name: 'கலாச்சார' }, te: { name: 'సాంస్కృతిక' }, kn: { name: 'ಸಾಂಸ್ಕೃತಿಕ' }, ml: { name: 'സാംസ്കാരിക' } } },
    { code: 'solemn', icon: 'Moon', color: '#64748b', translations: { en: { name: 'Solemn' }, hi: { name: 'गंभीर' }, mr: { name: 'गंभीर' }, gu: { name: 'ગંભીર' }, bn: { name: 'গ গম্ভীর' }, ta: { name: 'கம்பீரமான' }, te: { name: 'గంభీరమైన' }, kn: { name: 'ಗಂಭೀರ' }, ml: { name: 'ഗൗരവമുള്ള' } } },
    { code: 'romantic', icon: 'Heart', color: '#ec4899', translations: { en: { name: 'Love' }, hi: { name: 'प्रेम' }, mr: { name: 'प्रेम' }, gu: { name: 'પ્રેમ' }, bn: { name: 'ভালবাসা' }, ta: { name: 'காதல்' }, te: { name: 'ప్రేమ' }, kn: { name: 'ಪ್ರೀತಿ' }, ml: { name: 'സ്നേഹം' } } },
    { code: 'morning', icon: 'Sunrise', color: '#0ea5e9', translations: { en: { name: 'Morning' }, hi: { name: 'सुबह' }, mr: { name: 'सकाळ' }, gu: { name: 'સવાર' }, bn: { name: 'সকাল' }, ta: { name: 'காலை' }, te: { name: 'ఉదయం' }, kn: { name: 'ಬೆಳಿಗ್ಗೆ' }, ml: { name: 'പ്രഭാതം' } } },
    { code: 'meditative', icon: 'Circle', color: '#6366f1', translations: { en: { name: 'Meditative' }, hi: { name: 'ध्यानपूर्ण' }, mr: { name: 'ध्यानपूर्ण' }, gu: { name: 'ધ્યાનપૂર્ણ' }, bn: { name: 'ধ্যানমগ্ন' }, ta: { name: 'தியானம்' }, te: { name: 'ధ్యాனம்' }, kn: { name: 'ಧ್ಯಾನ' }, ml: { name: 'ധ്യാനാത്മകമായ' } } },
    { code: 'festive', icon: 'Sparkles', color: '#f97316', translations: { en: { name: 'Festive' }, hi: { name: 'उत्सवी' }, mr: { name: 'उत्सवाचा' }, gu: { name: 'ઉત્સવ' }, bn: { name: 'উৎসবমুখর' }, ta: { name: 'பண்டிகை' }, te: { name: 'పండుగ' }, kn: { name: 'ಉತ್ಸವದ' }, ml: { name: 'ഉത്സവ' } } },
    { code: 'devotional', icon: 'Heart', color: '#dc2626', translations: { en: { name: 'Devotional' }, hi: { name: 'भक्तिमय' }, mr: { name: 'भक्तिमय' }, gu: { name: 'ભક્તિમય' }, bn: { name: 'ভক্তিমূলক' }, ta: { name: 'பக்தி' }, te: { name: 'భక్తి' }, kn: { name: 'ಭಕ್ತಿ' }, ml: { name: 'ഭക്തിസാന്ദ്രമായ' } } },
    { code: 'reflective', icon: 'Moon', color: '#475569', translations: { en: { name: 'Reflective' }, hi: { name: 'चिंतनशील' }, mr: { name: 'चिंतनशील' }, gu: { name: 'ચિંતનશીલ' }, bn: { name: 'প্রতিফলিত' }, ta: { name: 'பிரதிபலிப்பு' }, te: { name: 'ప్రతిబింబం' }, kn: { name: 'ಪ್ರತಿಬಿಂಬಿಸುವ' }, ml: { name: 'ചിന്തനീയമായ' } } }
];

const fetchS3Files = async () => {
    const prefix = `${base}/${env}/image/original/`;
    let files = [];
    let token;
    do {
        const data = await s3Client.send(new ListObjectsV2Command({
            Bucket: BUCKET_NAME,
            Prefix: prefix,
            ContinuationToken: token
        }));
        files = files.concat(data.Contents || []);
        token = data.NextContinuationToken;
    } while (token);
    return files.map(obj => obj.Key.replace(prefix, '')).filter(f => f.match(/\.(webp|gif|png|jpg|jpeg)$/i));
};

const slugAliases = {
    'navratri-2026': ['durga-puja-2026', 'dussehra-2026'],
    'diwali-2026': ['deepavali-2026'],
    'lohri-makar-sankranti-2026': ['lohri-sankranti-pongal-2026'],
    'easter-2026': ['easter-good-friday-2026'],
    'republic-day-2026': ['republic-independence-day-2026'],
    'independence-day-2026': ['republic-independence-day-2026'],
    'valentines-day-2026': ['valentine-day-2026'],
    'world-environment-day-2026': ['earth-day-environment-day-2026'],
    'womens-day-2026': ['international-womens-day-2026'],
    'mothers-day-2026': ['mothers-fathers-day-2026'],
    'fathers-day-2026': ['mothers-fathers-day-2026'],
    'muharram-ashura-2026': ['muharram-2026'],
    'ramadan-start-2026': ['ramadan-2026'],
    'world-cancer-day-2026': ['world-cancer-day-2026']
};

const matchEvent = (filename, activeEvents) => {
    let core = filename.split('_')[0];
    if (filename.startsWith('seed_')) {
        const parts = filename.split('_');
        if (parts.length > 2) {
            core = parts[2].replace(/\.[^/.]+$/, "");
        }
    } else {
        core = core.replace(/\.[^/.]+$/, "");
    }

    let match = activeEvents.find(e => e.slug === core);
    if (!match) match = activeEvents.find(e => e.slug && slugAliases[e.slug]?.includes(core));

    if (!match) {
        const strippedCore = core.replace(/-2026$/, '');
        match = activeEvents.find(e => {
            if (!e.slug) return false;
            const strippedSlug = e.slug.replace(/-2026$/, '');
            return strippedSlug === strippedCore;
        });
    }

    return match || null;
};

async function seedAll() {
    let stats = { cats: 0, tags: 0, vibes: 0, events: 0, quotes: 0, greetings: 0, mantras: 0, images: 0, audio: 0 };

    try {
        await mongoose.connect(MONGO_URI);
        console.log('🔌 MongoDB Connected');
        console.log('🚀 Starting Unified Seeding Pipeline...\n');

        // --- PHASE 1: Taxonomy ---
        console.log('1️⃣  Deploying Taxonomy...');
        for (const cat of STATIC_CATEGORIES) { await Category.findOneAndUpdate({ code: cat.code }, cat, { upsert: true }); stats.cats++; }
        for (const tag of STATIC_TAGS) { await Tag.findOneAndUpdate({ code: tag.code }, tag, { upsert: true }); stats.tags++; }
        for (const vibe of STATIC_VIBES) { await Vibe.findOneAndUpdate({ code: vibe.code }, vibe, { upsert: true }); stats.vibes++; }

        const catMap = Object.fromEntries((await Category.find()).map(i => [i.code, i._id]));
        const tagMap = Object.fromEntries((await Tag.find()).map(i => [i.code, i._id]));
        const vibeMap = Object.fromEntries((await Vibe.find()).map(i => [i.code, i._id]));

        // --- PHASE 2: Ambient Audio ---
        console.log('\n2️⃣  Deploying Ambient Audio...');
        for (const audio of ambientAudioData) {
            await AmbientAudio.findOneAndUpdate({ slug: audio.slug }, { $set: audio }, { upsert: true });
            stats.audio++;
        }
        const audioMap = Object.fromEntries((await AmbientAudio.find()).map(i => [i.slug, i._id]));

        // --- PHASE 3: Events ---
        console.log('\n3️⃣  Deploying Events...');
        await Event.updateMany({}, { $set: { quotes: [], greetings: [], mantras: [], images: [], ambient_audio: null } });

        for (const ev of eventData) {
            const rawCat = (ev.category || 'festival').toLowerCase();
            const catResolve = rawCat.includes('religious') ? 'religious' : (rawCat.includes('national') ? 'national' : 'festival');

            const eventPayload = {
                ...ev,
                category: catMap[catResolve],
                date: (ev.dates && ev.dates.length > 0) ? new Date(ev.dates[0].date) : new Date(),
                tags: (ev.tags || []).map(t => tagMap[t.toLowerCase()]).filter(Boolean),
                vibes: (ev.vibes || []).map(v => vibeMap[v]).filter(Boolean),
                ambient_audio: ev.ambient_audio_slug ? audioMap[ev.ambient_audio_slug] : null
            };

            if (eventPayload.lottie_overlay && typeof eventPayload.lottie_overlay === 'object') {
                const overlayData = eventPayload.lottie_overlay;
                // Map 'title' from JSON to 'name' in Model
                const finalData = {
                  ...overlayData,
                  name: overlayData.name || overlayData.title || overlayData.filename.replace('.json', '').replace(/_/g, ' ')
                };
                
                const overlayDoc = await LottieOverlay.findOneAndUpdate(
                    { filename: overlayData.filename },
                    { $set: finalData },
                    { upsert: true, new: true }
                );
                eventPayload.lottie_overlay = overlayDoc._id;
            }

            await Event.findOneAndUpdate({ slug: ev.slug }, { $set: eventPayload }, { upsert: true });
            stats.events++;
        }
        const eventMap = Object.fromEntries((await Event.find()).map(i => [i.slug, i._id]));

        // --- PHASE 4: Wisdom ---
        console.log('\n4️⃣  Deploying Wisdom & Wishes...');
        for (const q of quoteData) {
            const doc = await Quote.findOneAndUpdate({ slug: q.slug }, { $set: { ...q, category: catMap[q.category], tags: (q.tags || []).map(t => tagMap[t]).filter(Boolean), vibes: (q.vibes || []).map(v => vibeMap[v]).filter(Boolean) } }, { upsert: true, new: true });
            stats.quotes++;
            if (q.event_slug && eventMap[q.event_slug]) await Event.findByIdAndUpdate(eventMap[q.event_slug], { $addToSet: { quotes: doc._id } });
        }
        for (const m of mantraData) {
            const doc = await Mantra.findOneAndUpdate({ slug: m.slug }, { $set: { ...m, category: catMap[m.category], tags: (m.tags || []).map(t => tagMap[t]).filter(Boolean), vibes: (m.vibes || []).map(v => vibeMap[v]).filter(Boolean) } }, { upsert: true, new: true });
            stats.mantras++;
            if (m.event_slug && eventMap[m.event_slug]) await Event.findByIdAndUpdate(eventMap[m.event_slug], { $addToSet: { mantras: doc._id } });
        }
        for (const g of greetingData) {
            const doc = await Greeting.findOneAndUpdate({ slug: g.slug }, { $set: { ...g, category: catMap[g.category], tags: (g.tags || []).map(t => tagMap[t]).filter(Boolean), vibes: (g.vibes || []).map(v => vibeMap[v]).filter(Boolean) } }, { upsert: true, new: true });
            stats.greetings++;
            if (g.event_slug && eventMap[g.event_slug]) await Event.findByIdAndUpdate(eventMap[g.event_slug], { $addToSet: { greetings: doc._id } });
        }

        // --- PHASE 5: S3 Images ---
        console.log('\n5️⃣  Syncing Images from S3...');
        const s3Files = await fetchS3Files();
        const activeEvents = await Event.find({}).lean();
        const captions = ['Beautiful', 'Amazing', 'Stunning', 'Vibrant', 'Peaceful', 'Happy', 'Divine', 'Auspicious'];

        for (let i = 0; i < s3Files.length; i++) {
            const file = s3Files[i];
            const matchedEvent = matchEvent(file, activeEvents);
            const adj = captions[i % captions.length];
            const s3Key = `${base}/${env}/image/original/${file}`;

            const imgPayload = {
                filename: file,
                s3_key: s3Key,
                caption: `${adj} ${matchedEvent ? matchedEvent.title : 'Festival'} Image`,
                is_s3_uploaded: true,
                categories: matchedEvent?.category ? [matchedEvent.category] : [],
                tags: matchedEvent?.tags || [],
                vibes: matchedEvent?.vibes || []
            };

            const doc = await Image.findOneAndUpdate({ s3_key: s3Key }, { $set: imgPayload }, { upsert: true, new: true });
            stats.images++;
            if (matchedEvent) await Event.findByIdAndUpdate(matchedEvent._id, { $addToSet: { images: doc._id } });
        }

        console.log('\n✅ SEEDING COMPLETE!');
        console.table(stats);
        process.exit(0);
    } catch (err) {
        console.error('❌ SEEDING FAILED:', err);
        process.exit(1);
    }
}

seedAll();
