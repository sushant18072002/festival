const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Event = require('../models/Event');
const { generateEventDetailMemory } = require('./generators/generate_event_detail');
const fs = require('fs-extra');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const LANGUAGES = ['hi', 'mr', 'gu', 'bn', 'ta', 'te', 'kn', 'ml'];

// Dictionary for actual translations of major events
const DICTIONARY = {
  'Republic Day': {
    hi: 'गणतंत्र दिवस', mr: 'प्रजासत्ताक दिन', gu: 'પ્રજાસત્તાક દિવસ', bn: 'প্রজাতন্ত্র দিবস',
    ta: 'குடியரசு தினம்', te: 'గణతంత్ర దినోత్సవం', kn: 'ಗಣರಾಜ್ಯೋತ್ಸವ', ml: 'റിപ്പബ്ലിക് ദിനം'
  },
  'Independence Day': {
    hi: 'स्वतंत्रता दिवस', mr: 'स्वातंत्र्य दिन', gu: 'સ્વતંત્રતા દિવસ', bn: 'স্বাধীনতা দিবস',
    ta: 'சுதந்திர தினம்', te: 'స్వాతంత్ర్య దినోత్సవం', kn: 'ಸ್ವಾತಂತ್ರ್ಯ ದಿನಾಚರಣೆ', ml: 'സ്വാതന്ത്ര്യ ദിനം'
  },
  'Diwali': {
    hi: 'दीपावली', mr: 'दिवाळी', gu: 'દિવાળી', bn: 'দীপাবলি',
    ta: 'தீபாவளி', te: 'దీపావళి', kn: 'ದೀಪಾವಳಿ', ml: 'ദീപാവലി'
  },
  'Holi': {
    hi: 'होली', mr: 'होळी', gu: 'હોળી', bn: 'হোলি',
    ta: 'ஹோலி', te: 'హోలీ', kn: 'ಹೋಳಿ', ml: 'ഹോളി'
  },
  'Navratri & Durga Puja': {
    hi: 'नवरात्रि', mr: 'नवरात्र', gu: 'નવરાત્રી', bn: 'নবরাত্রি এবং দুর্গাপূজা',
    ta: 'நவராத்திரி', te: 'నవరాత్రి', kn: 'ನವರಾತ್ರಿ', ml: 'നവരാത്രി'
  },
  'Ganesh Chaturthi': {
    hi: 'गणेश चतुर्थी', mr: 'गणेश चतुर्थी', gu: 'ગણેશ ચતુર્થી', bn: 'গণেশ চতুর্থী',
    ta: 'விநாயகர் சதுர்த்தி', te: 'వినాయక చవితి', kn: 'ಗಣೇಶ ಚತುರ್ಥಿ', ml: 'ഗണേശ ചതുർത്ഥി'
  },
  'Maha Shivratri': {
    hi: 'महाशिवरात्रि', mr: 'महाशिवरात्री', gu: 'મહાશિવરાત્રી', bn: 'মহা শিবরাত্রি',
    ta: 'மகா சிவராத்திரி', te: 'మహా శివరాత్రి', kn: 'ಮಹಾಶಿವರಾತ್ರಿ', ml: 'മഹാ ശിവരാത്രി'
  },
  'Raksha Bandhan': {
    hi: 'रक्षाबंधन', mr: 'रक्षाबंधन', gu: 'રક્ષાબંધન', bn: 'রক্ষাবন্ধন',
    ta: 'ரக்‌ஷா பந்தன்', te: 'రక్షా బంధన్', kn: 'ರಕ್ಷಾಬಂಧನ', ml: 'രക്ഷാബന്ധൻ'
  },
  'Krishna Janmashtami': {
    hi: 'কৃষ্ণ जन्माष्टमी', mr: 'कृष्ण जन्माष्टमी', gu: 'કૃષ્ણ જન્માષ્ટમી', bn: 'কৃষ্ণ জন্মাষ্টমী',
    ta: 'கிருஷ்ண ஜெயந்தி', te: 'కృష్ణాష్టమి', kn: 'ಕೃಷ್ಣ ಜನ್ಮಾಷ್ಟಮಿ', ml: 'കൃഷ്ണ ജന്മാഷ്ടമി'
  },
  'Dussehra': {
    hi: 'दशहरा', mr: 'दसरा', gu: 'દશેરા', bn: 'দশেরাহ',
    ta: 'தசரா', te: 'దసరా', kn: 'ದಸರಾ', ml: 'ദസറ'
  }
};

async function run() {
  await mongoose.connect(process.env.MONGO_URI, { dbName: process.env.DB_NAME });
  console.log('Connected to DB');

  const events = await Event.find({});
  let updatedCount = 0;

  for (const evt of events) {
    if (!evt.translations) evt.translations = {};

    for (const lang of LANGUAGES) {
      if (!evt.translations[lang]) evt.translations[lang] = {};

      const dictEntry = DICTIONARY[evt.title];
      if (dictEntry && dictEntry[lang]) {
        evt.translations[lang].title = dictEntry[lang];
      } else {
        evt.translations[lang].title = `[${lang.toUpperCase()}] ${evt.title}`;
      }
      
      // Auto-translate description with placeholder prefix
      if (evt.description && !evt.translations[lang].description) {
         evt.translations[lang].description = `[${lang.toUpperCase()}] ${evt.description}`;
      }
    }

    await Event.updateOne({ _id: evt._id }, { $set: { translations: evt.translations } });
    updatedCount++;
  }

  console.log(`Updated translations for ${updatedCount} events in MongoDB.`);

  // Now regenerate the JSON catalogs
  console.log('Regenerating JSON catalogs...');
  const outputs = await generateEventDetailMemory();
  for (const [relativePath, jsonString] of Object.entries(outputs)) {
      const fullDst = path.join(__dirname, '../../data/json', relativePath);
      await fs.ensureDir(path.dirname(fullDst));
      await fs.writeFile(fullDst, jsonString);
  }
  
  console.log('Finished generating JSON catalogs!');
  process.exit(0);
}

run().catch(console.error);
