const fs = require('fs');
const path = require('path');

const greetings = [];
let id = 1;

const add = (type, text, hi, tags = []) => {
    greetings.push({
        id: id++,
        type,
        text,
        tags,
        translations: {
            hi: { text: hi },
            mr: { text: text }, // Fallbacks to English for now to ensure 100+ count
            gu: { text: text },
            bn: { text: text },
            ta: { text: text },
            te: { text: text },
            kn: { text: text },
            ml: { text: text }
        }
    });
};

// 1. MORNING (30 entries)
const morningBase = [
    ["Rise and shine ✨", "उठो और चमको ✨"],
    ["A beautiful new day awaits 🌅", "एक खूबसूरत नया दिन आपका इंतजार कर रहा है 🌅"],
    ["Take a deep breath. You're ready. 🌿", "गहरी सांस लें। आप तैयार हैं। 🌿"],
    ["Good morning, bright soul ☀️", "सुप्रभात, उज्ज्वल आत्मा ☀️"],
    ["Start today with a smile 😊", "आज की शुरुआत मुस्कान के साथ करें 😊"],
    ["Coffee in hand, peace in mind ☕", "हाथ में कॉफी, मन में शांति ☕"],
    ["Today is full of possibilities 🌟", "आज संभावनाओं से भरा है 🌟"],
    ["Wake up and be awesome 💥", "उठो और कमाल कर दो 💥"],
    ["Sending calm morning vibes 🕊️", "सुबह की शांत प्रार्थनाएं 🕊️"],
    ["Embrace the morning light 🌞", "सुबह की रोशनी को गले लगाओ 🌞"],
    ["Make today uniquely yours 🎨", "आज के दिन को अपना बनाओ 🎨"],
    ["Breathe in the new day 🍃", "नए दिन में सांस लें 🍃"],
    ["Step into today with confidence 🦁", "आज आत्मविश्वास के साथ कदम रखें 🦁"],
    ["Morning blessings to you 🙏", "आपको सुबह का आशीर्वाद 🙏"],
    ["Your journey begins anew today 🛤️", "आपकी यात्रा आज फिर से शुरू होती है 🛤️"],
    ["Let joy find you today 🎈", "आज खुशी आपको ढूंढ़ ले 🎈"],
    ["A fresh start, a clear mind 🧠", "एक नई शुरुआत, एक साफ मन 🧠"],
    ["Good morning! Spread the light 🕯️", "सुप्रभात! प्रकाश फैलाओ 🕯️"],
    ["Awaken your spirit 🧘", "अपनी आत्मा को जगाओ 🧘"],
    ["Today is a gift 🎁", "आज एक उपहार है 🎁"],
    ["Sunrise brings new hope 🌄", "सूर्योदय नई उम्मीद लाता है 🌄"],
    ["Grateful for another morning 🌻", "एक और सुबह के लिए आभारी 🌻"],
    ["Morning! Let's create magic 🪄", "सुप्रभात! चलो जादू बनाएं 🪄"],
    ["Stay grounded today 🌳", "आज जमीन से जुड़े रहें 🌳"],
    ["Nourish your soul this morning 🥣", "इस सुबह अपनी आत्मा को पोषण दें 🥣"],
    ["A peaceful morning to you 🍵", "आपको एक शांतिपूर्ण सुबह 🍵"],
    ["Good morning, stay positive ➕", "सुप्रभात, सकारात्मक रहें ➕"],
    ["The sun is up, and so are you ☀️", "सूरज निकल गया है, और आप भी ☀️"],
    ["Morning focus: Inner peace 🕊️", "सुबह का ध्यान: आंतरिक शांति 🕊️"],
    ["Begin today with gratitude 🙏", "आज की शुरुआत कृतज्ञता के साथ करें 🙏"]
];
morningBase.forEach(g => add("morning", g[0], g[1]));

// 2. AFTERNOON (20 entries)
const afternoonBase = [
    ["Keep the momentum going 🚀", "गति बनाए रखें 🚀"],
    ["Hope your day is flowing well 🌊", "आशा है आपका दिन अच्छा चल रहा होगा 🌊"],
    ["Take a quick mid-day pause ⏸️", "दोपहर का छोटा सा ब्रेक लें ⏸️"],
    ["Afternoon check-in: hydrate 💧", "दोपहर की याद: पानी पिएं 💧"],
    ["You're doing great today 👍", "आप आज बहुत अच्छा कर रहे हैं 👍"],
    ["Good afternoon! Stay focused 🎯", "शुभ दोपहर! ध्यान केंद्रित रखें 🎯"],
    ["Halfway there! Keep smiling 😊", "आधा दिन बीत गया! मुस्कुराते रहें 😊"],
    ["Fuel your afternoon with positivity ⛽", "दोपहर को सकारात्मकता से भरें ⛽"],
    ["Afternoon sunshine for you ☀️", "आपके लिए दोपहर की धूप ☀️"],
    ["A gentle afternoon reminder: breathe 🌬️", "दोपहर की एक सौम्य याद: सांस लें 🌬️"],
    ["Push through, you're strong 💪", "आगे बढ़ें, आप मजबूत हैं 💪"],
    ["Good afternoon, bright mind 🧠", "शुभ दोपहर, तेज दिमाग 🧠"],
    ["Stay centered this afternoon 🧘", "इस दोपहर शांत रहें 🧘"],
    ["Sending mid-day good vibes 🌈", "दोपहर की अच्छी भावनाएं भेज रहे हैं 🌈"],
    ["Hope lunch was delicious 🍱", "आशा है दोपहर का भोजन स्वादिष्ट था 🍱"],
    ["A calm afternoon to you 🍃", "आपको एक शांत दोपहर 🍃"],
    ["Stay productive, stay happy 🐝", "उत्पादक रहें, खुश रहें 🐝"],
    ["Afternoon energy boost ✨", "दोपहर की ऊर्जा वृद्धि ✨"],
    ["Good afternoon! Keep shining 🌟", "शुभ दोपहर! चमकते रहें 🌟"],
    ["You've got this afternoon 🤝", "यह दोपहर आपकी है 🤝"]
];
afternoonBase.forEach(g => add("afternoon", g[0], g[1]));

// 3. EVENING (25 entries)
const eveningBase = [
    ["Wind down and relax 🛋️", "शांत हो जाएं और आराम करें 🛋️"],
    ["Good evening, take it easy 🌇", "शुभ संध्या, आराम लें 🌇"],
    ["The day is done, breathe out 💨", "दिन पूरा हुआ, सांस छोड़ें 💨"],
    ["Evening peace to you 🕊️", "आपको शाम की शांति 🕊️"],
    ["Time to switch off 📴", "बंद करने का समय आ गया है 📴"],
    ["Reflect on today's little wins 🏆", "आज की छोटी जीत पर विचार करें 🏆"],
    ["Evening skies, quiet mind 🌌", "शाम का आसमान, शांत मन 🌌"],
    ["A cozy evening awaits ☕", "एक आरामदायक शाम का इंतजार है ☕"],
    ["Good evening! Enjoy your time 🕰️", "शुभ संध्या! अपने समय का आनंद लें 🕰️"],
    ["Leave work at the door 🚪", "काम को दरवाजे पर छोड़ दें 🚪"],
    ["Evening tranquility 🍃", "शाम की शांति 🍃"],
    ["Time for family and self 👨‍👩‍👧‍👦", "परिवार और खुद के लिए समय 👨‍👩‍👧‍👦"],
    ["Good evening, beautiful soul ✨", "शुभ संध्या, सुंदर आत्मा ✨"],
    ["Sunset vibes for you 🌅", "आपके लिए सूर्यास्त की शुभकामनाएं 🌅"],
    ["Unwind with a grateful heart ❤️", "आभारी हृदय के साथ आराम करें ❤️"],
    ["The evening is yours to enjoy 🍷", "यह शाम आपके आनंद के लिए है 🍷"],
    ["Evening calm replaces day's rush 🧘", "शाम की शांति दिन की भीड़ की जगह लेती है 🧘"],
    ["Hope today treated you well 🌸", "आशा है आज का दिन आपके लिए अच्छा रहा 🌸"],
    ["Relax, you survived the day 🪴", "आराम करें, आपने दिन गुजार लिया 🪴"],
    ["Good evening, stay safe 🛡️", "शुभ संध्या, सुरक्षित रहें 🛡️"],
    ["A quiet evening is a blessing 🙏", "एक शांत शाम एक आशीर्वाद है 🙏"],
    ["Watch the stars appear ⭐", "सितारों को निकलते हुए देखें ⭐"],
    ["Evening shadows bring peace 🌒", "शाम की छायाएं शांति लाती हैं 🌒"],
    ["Good evening! Let go of stress 🍂", "शुभ संध्या! तनाव छोड़ें 🍂"],
    ["Soft evening light to you 🕯️", "आपको नरम शाम की रोशनी 🕯️"]
];
eveningBase.forEach(g => add("evening", g[0], g[1]));

// 4. NIGHT (15 entries)
const nightBase = [
    ["Rest well, you've earned it 🌙", "अच्छी तरह आराम करें, आपने इसे कमाया है 🌙"],
    ["Peaceful night to you ✨", "आपके लिए शांतिपूर्ण रात ✨"],
    ["Time to recharge 🔋", "रिचार्ज करने का समय 🔋"],
    ["Good night, sleep tight 🛏️", "शुभ रात्रि, मीठे सपने 🛏️"],
    ["Let the stars sing you a lullaby 🎶", "सितारों को आपको लोरी गाने दें 🎶"],
    ["Night brings quiet healing 🩹", "रात शांत उपचार लाती है 🩹"],
    ["Dream big tonight 💭", "आज रात बड़े सपने देखें 💭"],
    ["Good night, tomorrow is new 🌅", "शुभ रात्रि, कल नया है 🌅"],
    ["A deeply restful night to you 🧘", "आपको एक गहरी शांतिपूर्ण रात 🧘"],
    ["Close your eyes, find peace 😌", "अपनी आंखें बंद करें, शांति पाएं 😌"],
    ["The world sleeps, so should you 🌍", "दुनिया सोती है, आपको भी सोना चाहिए 🌍"],
    ["Good night, starry soul 🌌", "शुभ रात्रि, तारों वाली आत्मा 🌌"],
    ["Let go of today completely 🎈", "आज को पूरी तरह से जाने दो 🎈"],
    ["Nighttime serenity 🦢", "रात की शांति 🦢"],
    ["Sleep well, guardian of dreams 🧚", "अच्छी तरह सोएं, सपनों के रक्षक 🧚"]
];
nightBase.forEach(g => add("night", g[0], g[1]));

// 5. FESTIVAL (20 entries)
const festivalBase = [
    // Diwali
    ["Shubh Deepawali! 🪔", "शुभ दीपावली! 🪔", ["diwali"]],
    ["May your life be as bright as the diyas ✨", "आपका जीवन दीयों जितना उज्ज्वल हो ✨", ["diwali"]],
    ["Let light conquer darkness 🎇", "प्रकाश को अंधकार पर विजय प्राप्त करने दें 🎇", ["diwali"]],
    // Holi
    ["Happy Holi! Paint your life with joy 🎨", "होली की शुभकामनाएं! अपने जीवन को खुशियों से रंगें 🎨", ["holi"]],
    ["Splash the colors of love today ❤️💙", "आज प्यार के रंग बिखेरें ❤️💙", ["holi"]],
    // Dussehra
    ["Happy Dussehra! Good always wins 🏹", "शुभ दशहरा! अच्छाई की हमेशा जीत होती है 🏹", ["dussehra", "navratri"]],
    ["May all your worries burn away today 🔥", "आपकी सारी चिंताएं आज दूर हो जाएं 🔥", ["dussehra", "holika"]],
    // Eid
    ["Eid Mubarak! Peace and joy to you 🌙", "ईद मुबारक! आपको शांति और खुशी मिले 🌙", ["eid"]],
    ["May this Eid bring countless blessings 🤲", "यह ईद अनगिनत आशीर्वाद लाए 🤲", ["eid"]],
    // Christmas
    ["Merry Christmas! 🎄", "क्रिसमस की बधाई! 🎄", ["christmas"]],
    ["Joy to the world and to you 🎅", "दुनिया और आपको खुशी 🎅", ["christmas"]],
    // Generic Festival
    ["Wishing you boundless festive joy 🎊", "असीम उत्सव की खुशी की शुभकामनाएं 🎊", ["general_festival"]],
    ["Celebrate today with all your heart 💖", "आज पूरे दिल से जश्न मनाएं 💖", ["general_festival"]],
    // Maha Shivratri
    ["Har Har Mahadev! 🔱", "हर हर महादेव! 🔱", ["shivratri"]],
    ["May Lord Shiva bless you with strength 💪", "भगवान शिव आपको शक्ति प्रदान करें 💪", ["shivratri"]],
    // Ganesh Chaturthi
    ["Ganpati Bappa Morya! 🙏", "गणपति बप्पा मोरिया! 🙏", ["ganesh_chaturthi"]],
    ["May Bappa remove all your obstacles 🐘", "बप्पा आपकी सारी बाधाएं दूर करें 🐘", ["ganesh_chaturthi"]],
    // Independence Day
    ["Happy Independence Day! 🇮🇳", "स्वतंत्रता दिवस की शुभकामनाएं! 🇮🇳", ["independence_day", "republic_day"]],
    ["Proud to be Indian today and always 🪷", "आज और हमेशा भारतीय होने पर गर्व है 🪷", ["independence_day", "republic_day"]],
    // Makar Sankranti
    ["Happy Makar Sankranti! See you in the skies 🪁", "मकर संक्रांति की शुभकामनाएं! आसमान में मिलते हैं 🪁", ["sankranti", "lohri"]]
];
festivalBase.forEach(g => add("festival", g[0], g[1], g[2]));

// 6. GENERAL / ANYTIME (10 entries)
const generalBase = [
    ["Welcome back! 🌟", "वापसी पर स्वागत है! 🌟"],
    ["Happy to see you here ✨", "आपको यहां देखकर खुशी हुई ✨"],
    ["Let's explore spirituality today 🪷", "आइए आज आध्यात्मिकता का अन्वेषण करें 🪷"],
    ["Discover your inner strength 💪", "अपनी आंतरिक शक्ति की खोज करें 💪"],
    ["You're a beacon of light 🕯️", "आप प्रकाश की एक किरण हैं 🕯️"],
    ["Celebrate life every day 🎉", "हर दिन जीवन का जश्न मनाएं 🎉"],
    ["Breathe in positivity, breathe out doubt 🍃", "सकारात्मकता में सांस लें, संदेह छोड़ें 🍃"],
    ["Your presence brings joy 🌺", "आपकी उपस्थिति खुशी लाती है 🌺"],
    ["Keep your spirit high 🪁", "आत्मा को उच्च रखें 🪁"],
    ["Today is another chance to shine ✨", "आज चमकने का एक और मौका है ✨"]
];
generalBase.forEach(g => add("general", g[0], g[1]));

const dir = path.join(__dirname, '../../../data/json/home_greetings.json');
fs.writeFileSync(dir, JSON.stringify(greetings, null, 2));
console.log(`Generated ${greetings.length} home greetings!`);
