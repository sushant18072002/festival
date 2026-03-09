const fs = require('fs');

const BATCH_3_EVENTS = {
    "eid-al-fitr-2026": {
        muhurat: { puja_time: "Morning (Post-Sunrise)", type: "Salat al-Eid", description: "The special Eid prayer performed in congregation in an open field or large mosque." },
        ritual_steps: [
            { order: 1, title: "Zakat al-Fitr", description: "Give mandatory charity before the Eid prayer to purify those who fasted.", items_needed: ["Money/Food equivalent"] },
            { order: 2, title: "Ghusl", description: "Perform full ablution (Ghusl) before heading out for prayers.", items_needed: ["Water", "Attar (Perfume)"] },
            { order: 3, title: "Salat al-Eid", description: "Attend the congregational prayer consisting of two Rakat with extra Takbirs.", items_needed: ["Prayer Mat"] },
            { order: 4, title: "Feasting", description: "Enjoy sweet dishes, especially Sheer Khurma, and exchange Eid Mubarak greetings.", items_needed: ["Sheer Khurma", "Eidi (Gifts/Cash)"] }
        ],
        recipes: [
            { name: "Sheer Khurma", description: "A rich vermicelli pudding made with milk, dates, and nuts, traditional for Eid-ul-Fitr.", ingredients: ["1/2 cup Roasted fine vermicelli (Seviyan)", "1 liter Full-fat milk", "1/2 cup Sugar", "Dates (Khurma)", "Ghee", "Almonds, Pistachios, Cardamom"], steps: ["Fry vermicelli and chopped dry fruits in ghee until golden.", "Boil milk and add chopped dates; let it simmer until reduced slightly.", "Add the fried vermicelli and sugar.", "Cook for 5-7 minutes. Serve hot or chilled."] }
        ],
        dress_guide: { colors: ["White", "Green", "Pastels"], description: "New or clean traditional clothes. Men often wear Shalwar Kameez or Kurta with Attar (non-alcoholic perfume)." },
        notification_templates: {
            discovery: "Eid al-Fitr translates to the 'Festival of Breaking the Fast', marking the end of Ramadan.",
            countdown: "Only 7 days left of Ramadan! Let us multiply our good deeds as Eid approaches.",
            eve: "The new moon has been sighted! Tomorrow is Eid al-Fitr. Don't forget your Zakat.",
            day_of: "Eid Mubarak! 🌙✨ May Allah accept your fasting, prayers, and good deeds."
        }
    },
    "christmas-2026": {
        muhurat: { puja_time: "Midnight", type: "Midnight Mass", description: "The deeply spiritual Midnight Mass marking the exact moment of Christ's nativity." },
        ritual_steps: [
            { order: 1, title: "Advent Preparation", description: "Set up the Christmas Tree and the Nativity Scene (Crib) depicting the birth of Jesus.", items_needed: ["Christmas Tree", "Decorations", "Nativity Set"] },
            { order: 2, title: "Midnight Mass", description: "Attend the solemn Midnight Mass at the local church.", items_needed: ["Bible", "Rosary"] },
            { order: 3, title: "Caroling", description: "Sing joyful carols celebrating the Savior’s birth.", items_needed: ["Carol Booklets"] },
            { order: 4, title: "Feasting", description: "Share a grand Christmas dinner with plum cake and exchange gifts.", items_needed: ["Plum Cake", "Wine", "Gifts"] }
        ],
        recipes: [
            { name: "Traditional Plum Cake", description: "A dense, rich fruit cake synonymous with Christmas in India.", ingredients: ["1 cup Flour", "Mixed dry fruits and peels (soaked in rum/grape juice for weeks)", "Butter", "Brown Sugar", "Eggs", "Cinnamon, Nutmeg, Cloves"], steps: ["Cream butter and sugar.", "Add eggs one by one.", "Fold in flour, spices, and the soaked fruits.", "Bake at 160°C for 60-75 mins until a skewer comes out clean."] }
        ],
        dress_guide: { colors: ["Red", "Green", "White", "Gold"], description: "Festive elegant wear. Red dominates, symbolizing the blood of Christ, while Green represents eternal life." },
        notification_templates: {
            discovery: "The star on top of the Christmas tree represents the Star of Bethlehem that guided the Wise Men.",
            countdown: "Just one week until Christmas! Time to wrap gifts and finish decorating the tree.",
            eve: "Tonight is Christmas Eve! Prepare for the joyous Midnight Mass.",
            day_of: "Merry Christmas! 🎄✨ May the birth of Jesus bring eternal joy and peace to your family."
        }
    },
    "buddha-purnima-2026": {
        muhurat: { puja_time: "Morning", type: "Purnima", description: "The holiest day in Buddhism observing the birth, enlightenment, and death (Parinirvana) of Gautama Buddha." },
        ritual_steps: [
            { order: 1, title: "Bathing the Buddha", description: "Pour water over the shoulders of a small Buddha statue, symbolizing purification of the mind from greed, anger, and ignorance.", items_needed: ["Buddha Statue", "Clean Water", "Basin"] },
            { order: 2, title: "Sutra Chanting", description: "Visit a Vihara (temple) to listen to monks chant the Dharma.", items_needed: ["White Clothes"] },
            { order: 3, title: "Vegetarianism", description: "Abstain from meat entirely in honor of the Buddha’s teachings of compassion (Ahimsa).", items_needed: ["Vegetarian Food"] },
            { order: 4, title: "Dana (Giving)", description: "Offer food and basic necessities to monks and the underprivileged.", items_needed: ["Donations"] }
        ],
        recipes: [
            { name: "Kheer", description: "A simple sweet rice pudding. Legend says a woman named Sujata offered a bowl of milk-rice to Buddha right before his enlightenment.", ingredients: ["Basmati Rice", "Milk", "Sugar"], steps: ["Boil milk until thickened.", "Add washed rice and cook on slow heat.", "Stir in sugar. Serve simple without extravagant spices representing asceticism."] }
        ],
        dress_guide: { colors: ["White"], description: "Plain white clothing is highly encouraged to symbolize purity, simplicity, and the shedding of worldly desires." },
        notification_templates: {
            discovery: "Buddha Purnima powerfully commemorates three events: Buddha's birth, his enlightenment, and his final nirvana.",
            countdown: "Buddha Purnima is in 7 days. Reflect on the Four Noble Truths.",
            eve: "Tomorrow is Buddha Purnima. Prepare for a day of peace, giving, and simple vegetarian means.",
            day_of: "Happy Buddha Purnima! ☸️ May you find true inner peace and walk the Middle Path."
        }
    },
    "ramadan-start-2026": {
        muhurat: { puja_time: "Pre-Dawn to Sunset", type: "Sawm (Fasting)", description: "The daily period of absolute fasting during the holy month." },
        ritual_steps: [
            { order: 1, title: "Suhoor", description: "Wake up before the Fajr adhan for the pre-dawn meal.", items_needed: ["Dates", "Water", "Oats"] },
            { order: 2, title: "Fasting", description: "Abstain from food, water, and sinful behavior from dawn to dusk.", items_needed: [] },
            { order: 3, title: "Iftar", description: "Break the fast immediately at sunset, traditionally with dates and water.", items_needed: ["Dates", "Water", "Fruits"] },
            { order: 4, title: "Taraweeh", description: "Perform the special lengthy night prayers in congregation.", items_needed: ["Prayer Mat", "Quran"] }
        ],
        recipes: [
            { name: "Fruit Chaat", description: "A refreshing and hydrating mix of fruits eaten during Iftar.", ingredients: ["Bananas, Apples, Melons", "Chaat Masala", "Lemon Juice"], steps: ["Chop all fruits evenly.", "Sprinkle chaat masala and fresh lemon juice.", "Toss gently and serve chilled immediately at Maghrib."] }
        ],
        dress_guide: { colors: ["Modest Tones", "White"], description: "Modest and comfortable clothing suitable for long periods of prayer and fasting." },
        notification_templates: {
            discovery: "Ramadan is the month the Quran was first revealed to Prophet Muhammad via Angel Jibril.",
            countdown: "Only 7 days left until the blessed month of Ramadan begins. Prepare your heart and mind.",
            eve: "The crescent has been sighted! Ramadan Mubarak. Tomorrow begins our first fast.",
            day_of: "Ramadan Mubarak! 🌙 May this holy month bring you profound spiritual growth, patience, and peace."
        }
    },
    "eid-al-adha-2026": {
        muhurat: { puja_time: "Morning (Post-Sunrise)", type: "Salat al-Eid", description: "The special Eid prayer followed by the Qurbani (sacrifice)." },
        ritual_steps: [
            { order: 1, title: "Salat al-Eid", description: "Attend the congregational prayer.", items_needed: ["Prayer Mat"] },
            { order: 2, title: "Qurbani", description: "Sacrifice a livestock animal honoring Prophet Ibrahim's obedience to God.", items_needed: ["Livestock"] },
            { order: 3, title: "Meat Distribution", description: "Divide the meat into three equal parts: for family, relatives, and the poor.", items_needed: [] }
        ],
        recipes: [
            { name: "Mutton Biryani", description: "The quintessential, aromatic meat and rice dish prepared using the fresh Qurbani meat.", ingredients: ["Mutton", "Basmati Rice", "Yogurt", "Onions", "Whole Spices", "Saffron"], steps: ["Marinate mutton in yogurt and spices.", "Parboil rice with whole spices.", "Layer meat and rice in a heavy pot (Dum).", "Seal and cook on low heat until the meat is tender."] }
        ],
        dress_guide: { colors: ["Elegant traditional wear"], description: "Wear your best clothes for the prayer, honoring the spirit of sacrifice and celebration." },
        notification_templates: {
            discovery: "Eid al-Adha honors the willingness of Prophet Ibrahim to sacrifice his son as an act of obedience to God.",
            countdown: "Eid al-Adha is in 7 days. Time to complete the Qurbani preparations.",
            eve: "Tomorrow is Eid al-Adha! Prepare for the morning prayers and the spirit of charity.",
            day_of: "Eid Mubarak! 🌙 May the spirit of sacrifice bring unity, peace, and abundance to your home."
        }
    },
    "muharram-ashura-2026": {
        muhurat: { puja_time: "All Day", type: "Mourning/Fasting", description: "A day of profound grief marking the martyrdom of Imam Hussain at Karbala." },
        ritual_steps: [
            { order: 1, title: "Majlis", description: "Attend gatherings to recite elegies (Nohas) commemorating the tragedy of Karbala.", items_needed: ["Black clothes"] },
            { order: 2, title: "Ashura Procession", description: "Participate in or witness the solemn processions featuring Taziyas.", items_needed: ["Taziya"] },
            { order: 3, title: "Fasting", description: "Many Sunnis fast on the 9th and 10th of Muharram.", items_needed: [] }
        ],
        recipes: [
            { name: "Haleem / Khichda", description: "A slow-cooked, deeply nourishing meat and grain stew prepared in large cauldrons for community distribution.", ingredients: ["Wheat, Barley, Lentils", "Meat", "Spices", "Ghee"], steps: ["Soak grains overnight.", "Slow cook meat and grains together until they blend entirely.", "Garnish with fried onions, ginger, and lemon."] }
        ],
        dress_guide: { colors: ["Black"], description: "Strictly black clothing for Shia Muslims as a universal symbol of mourning and grief." },
        notification_templates: {
            discovery: "Ashura marks the 10th day of Muharram, solemnizing the supreme sacrifice of Imam Hussain for justice.",
            countdown: "The Day of Ashura is 7 days away. A time for deep reflection and mourning.",
            eve: "Tonight brings the gravity of Ashura. We remember Karbala.",
            day_of: "Observing Ashura. May the legacy of Imam Hussain inspire truth, justice, and courage. 🖤"
        }
    },
    "guru-gobind-singh-jayanti-2026": {
        muhurat: { puja_time: "Morning", type: "Prakash Utsav", description: "Celebrating the birth of the 10th Sikh Guru who founded the Khalsa." },
        ritual_steps: [
            { order: 1, title: "Akhand Path", description: "The conclusion of the 48-hour continuous reading of the Guru Granth Sahib.", items_needed: ["Guru Granth Sahib"] },
            { order: 2, title: "Nagar Kirtan", description: "A massive holy procession led by the Panj Pyare carrying the Sikh flag (Nishan Sahib).", items_needed: ["Nishan Sahib", "Traditional Attire"] },
            { order: 3, title: "Langar", description: "Volunteering to cook and serve free food to everyone, regardless of caste or religion.", items_needed: ["Langar ingredients"] }
        ],
        recipes: [
            { name: "Kada Prasad", description: "The sacred, incredibly rich sweet offered at the Gurdwara.", ingredients: ["1 cup Whole wheat flour (Atta)", "1 cup Ghee", "1 cup Sugar", "3 cups Water"], steps: ["Boil water and sugar to make a syrup.", "Roast the flour heavily in ghee until dark golden brown.", "Carefully pour the syrup into the roasted flour, stirring continuously.", "Serve hot with immense devotion."] }
        ],
        dress_guide: { colors: ["Saffron", "Blue", "White"], description: "Traditional Sikh attire. Men often wear Turbans in saffron or blue, representing the Khalsa colors." },
        notification_templates: {
            discovery: "Guru Gobind Singh Ji formulated the Five Ks (Panj Kakar) that define the Sikh identity today.",
            countdown: "Guru Gobind Singh Jayanti is in 7 days. Time to volunteer for the Langar preparations.",
            eve: "Tomorrow is the Prakash Utsav. The Akhand Path will conclude tomorrow morning.",
            day_of: "Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh! 🙏 Honoring the courage and teachings of the 10th Guru."
        }
    },
    // Adding aliases for minor mapping differences
    "mahavir-jayanti-2026": {
        muhurat: { puja_time: "Morning", type: "Pratah Kaal", description: "The celebration of the birth of the 24th and last Tirthankara, Lord Mahavira." },
        ritual_steps: [
            { order: 1, title: "Abhisheka", description: "Ceremonial bathing of Lord Mahavira's idol.", items_needed: ["Idol", "Water", "Milk"] },
            { order: 2, title: "Rath Yatra", description: "A peaceful procession carrying the idol on a chariot.", items_needed: ["Chariot"] },
            { order: 3, title: "Ahimsa", description: "Engage strictly in non-violent acts and donate money or food to the poor and animal shelters.", items_needed: ["Donation"] }
        ],
        recipes: [
            { name: "Pure Jain Thali", description: "Food prepared strictly without roots (no onion, garlic, or potatoes) adhering to supreme Ahimsa.", ingredients: ["Green gram", "Plantain", "Spices without roots"], steps: ["Prepare a simple, non-spicy meal that involves zero harm to microorganisms."] }
        ],
        dress_guide: { colors: ["White", "Yellow"], description: "Simple clothes. Ascetics wear pure white to signify renunciation of worldly ties." },
        notification_templates: {
            discovery: "Lord Mahavira's core message was 'Live and Let Live', establishing Ahimsa (Non-violence) as the supreme dharma.",
            countdown: "Mahavir Jayanti is 7 days away. Plan your donations for animal welfare.",
            eve: "Tomorrow is Mahavir Jayanti. Prepare for a day of absolute peace and compassion.",
            day_of: "Happy Mahavir Jayanti! 🌿 May the profound principles of Ahimsa and truth guide your life."
        }
    },
    "paryushan-parv-2026": {
        muhurat: { puja_time: "8 Days", type: "Fasting & Reflection", description: "The most important Jain festival of profound fasting, deep reflection, and seeking forgiveness." },
        ritual_steps: [
            { order: 1, title: "Fasting", description: "Observe intense fasting, drinking only boiled water.", items_needed: ["Boiled Water"] },
            { order: 2, title: "Pratikraman", description: "A daily ritual reflecting on spiritual transgressions and repenting.", items_needed: ["Pratikraman Book"] },
            { order: 3, title: "Samvatsari (Forgiveness)", description: "On the final day, seek forgiveness from all living beings saying 'Micchami Dukkadam'.", items_needed: [] }
        ],
        recipes: [
            { name: "Moong Dal Soup", description: "A very thin, plain lentil soup for breaking intense fasts.", ingredients: ["Moong dal", "Salt", "Cumin"], steps: ["Boil moong dal until completely soft.", "Add a pinch of salt and cumin.", "Consume warm to ease the stomach."] }
        ],
        dress_guide: { colors: ["White"], description: "Plain white attire to symbolize purity, detachment, and humility." },
        notification_templates: {
            discovery: "Paryushan ends with 'Micchami Dukkadam', deeply asking forgiveness from everyone we may have hurt, intentionally or unintentionally.",
            countdown: "Paryushan begins in 7 days. Time to mentally prepare for the spiritual fast.",
            eve: "Tomorrow Paryushan begins. May our journey inward be successful.",
            day_of: "Micchami Dukkadam! 🙏 Seeking forgiveness from all forms of life for any transgressions in thought, word, or deed."
        }
    },
    // Catchall for Guru Nanak Jayanti
    "guru-nanak-jayanti-2026": {
        muhurat: { puja_time: "Morning", type: "Gurpurab", description: "Celebrating the birth of the 1st Sikh Guru and the founder of Sikhism." },
        ritual_steps: [
            { order: 1, title: "Prabhat Pheri", description: "Early morning processions starting from the Gurdwara singing hymns.", items_needed: ["Musical Instruments"] },
            { order: 2, title: "Akhand Path", description: "48-hour continuous reading of the Guru Granth Sahib culminates today.", items_needed: ["Guru Granth Sahib"] },
            { order: 3, title: "Kada Prasad & Langar", description: "Distribute the holy Prasad and serve free meals to the community.", items_needed: ["Langar"] }
        ],
        recipes: [
            { name: "Kada Prasad", description: "Sacred wheat flour sweet.", ingredients: ["Atta", "Ghee", "Sugar"], steps: ["Roast atta in ghee.", "Add sugar syrup.", "Serve warm."] }
        ],
        dress_guide: { colors: ["Saffron", "White"], description: "Traditional elegant wear, heads must be covered respectfully." },
        notification_templates: {
            discovery: "Guru Nanak Dev Ji taught three pillars: Naam Japo (chant), Kirat Karo (work honestly), Vand Chhako (share with others).",
            countdown: "Gurpurab is 7 days away. Time to join the Prabhat Pheris early in the morning.",
            eve: "Tomorrow is Guru Nanak Jayanti. The Gurdwaras will be beautifully illuminated.",
            day_of: "Happy Gurpurab! ✨ May the profound teachings of Guru Nanak Dev Ji inspire equity, truth, and compassion."
        }
    }
};

const JSON_PATH = 'e:/flutter/App festival/backend/data/events_2026.json';

async function run() {
    try {
        console.log("Loading dataset for Batch 3...");
        const dataStr = fs.readFileSync(JSON_PATH, 'utf-8');
        const db = JSON.parse(dataStr);

        let updated = 0;
        let skipped = 0;

        for (const event of db) {
            const batchSlug = BATCH_3_EVENTS[event.slug]?.alias || event.slug;
            const batchData = BATCH_3_EVENTS[batchSlug];

            if (batchData && !batchData.alias) {
                event.muhurat = batchData.muhurat;
                event.ritual_steps = batchData.ritual_steps;
                event.recipes = batchData.recipes;
                event.dress_guide = batchData.dress_guide;
                event.notification_templates = batchData.notification_templates;

                updated++;
                console.log(`[Batch 3] Wrote Authentic Data -> ${event.slug}`);
            } else {
                skipped++;
            }
        }

        fs.writeFileSync(JSON_PATH, JSON.stringify(db, null, 2));
        console.log(`\nBatch 3 Complete! Updated ${updated} other religious festivals. Skipped ${skipped}.`);

    } catch (e) {
        console.error("Error:", e);
    }
}

run();
