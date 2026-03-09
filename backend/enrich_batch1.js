const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const BATCH_1_EVENTS = {
    "maha-shivratri-2026": {
        muhurat: {
            puja_time: "12:09 AM to 01:00 AM",
            type: "Nishita Kaal Puja Time",
            description: "The most auspicious window during the night to perform Shiva Puja, offering Bilva leaves and milk."
        },
        ritual_steps: [
            { order: 1, title: "Purification", description: "Take a vow (Sankalpa) after taking a bath in the morning. Fast strictly for the whole day.", items_needed: ["Water", "Clean Clothes"] },
            { order: 2, title: "Abhisheka", description: "Perform Rudrabhishek of the Shiva Linga with water, milk, honey, and ghee.", items_needed: ["Milk", "Honey", "Ghee", "Water", "Shiva Linga"] },
            { order: 3, title: "Offerings", description: "Offer Bilva (Bael) leaves, Dhatura flowers, and Bhasma (sacred ash) to Lord Shiva.", items_needed: ["Bilva Leaves", "Dhatura Flowers", "Bhasma"] },
            { order: 4, title: "Jagaran", description: "Stay awake throughout the night singing bhajans and chanting 'Om Namah Shivaya'.", items_needed: ["Mala (Rosary)"] }
        ],
        recipes: [
            {
                name: "Sabudana Khichdi",
                description: "A beloved fasting dish made with tapioca pearls, peanuts, and mild spices.",
                ingredients: ["1 cup Sabudana (soaked)", "1/2 cup Roasted peanuts (crushed)", "1 Potato (boiled and cubed)", "2 Green chilies", "Sendha Namak (Rock salt)"],
                steps: [
                    "Soak sabudana overnight or for 4-5 hours until soft but not mushy.",
                    "Heat ghee in a pan, add cumin seeds and green chilies.",
                    "Add cubed potatoes and sauté for a minute.",
                    "Mix in the drained sabudana, crushed peanuts, and rock salt.",
                    "Cook on low heat until sabudana turns translucent. Garnish with coriander."
                ]
            },
            {
                name: "Thandai",
                description: "A cooling milk-based traditional drink infused with nuts, seeds, and spices.",
                ingredients: ["1 liter Full-cream milk", "1/4 cup Almonds & Pistachios", "1 tbsp Melon seeds (Magaz)", "1 tsp Fennel seeds (Saunf)", "1/2 tsp Cardamom powder"],
                steps: [
                    "Soak the nuts, melon seeds, and fennel in warm water for 2 hours.",
                    "Blend the soaked ingredients into a smooth paste.",
                    "Boil milk, add sugar and the prepared paste.",
                    "Simmer for 10 minutes, add cardamom powder, and let it cool. Serve chilled."
                ]
            }
        ],
        dress_guide: {
            colors: ["Green", "White", "Saffron"],
            description: "Devotees typically wear simple, clean, unstitched clothes or traditional attire like a dhoti-kurta for men and a simple saree or salwar for women. Green is considered highly auspicious as it represents nature and Bilva leaves."
        },
        notification_templates: {
            discovery: "Did you know? Offering Bilva leaves to Shiva destroys the sins of 3 lifetimes. Prepare for Mahashivratri.",
            countdown: "Just 7 days until the great night of Shiva! Have you planned your fast and puja?",
            eve: "Tomorrow is Maha Shivaratri! Get ready for the sacred Jagaran.",
            day_of: "Happy Maha Shivaratri! May Lord Shiva bless you with strength, peace, and eternal wisdom. Om Namah Shivaya! 🙏"
        }
    },
    "holi-2026": {
        muhurat: {
            puja_time: "06:33 PM to 08:58 PM (Holika Dahan)",
            type: "Pradosh Kaal Muhurat",
            description: "The ideal evening time for lighting the Holika bonfire, signifying the victory of good over evil."
        },
        ritual_steps: [
            { order: 1, title: "Holika Dahan", description: "Gather around the bonfire on the eve of Holi, offer prayers, and roast stalks of wheat or gram in the fire.", items_needed: ["Wood", "Cow dung cakes", "Wheat/Gram stalks", "Kumkum"] },
            { order: 2, title: "Preparation", description: "Oil your hair and skin in the morning to protect against harsh colors.", items_needed: ["Coconut or Mustard Oil"] },
            { order: 3, title: "Playing Colors", description: "Apply dry Gulal on elders' feet for blessings, and playfully splash wet colors on friends and family.", items_needed: ["Gulal", "Pichkari (Water Gun)", "Water balloons"] },
            { order: 4, title: "Feasting", description: "Share traditional sweets like Gujiya and drinks like Thandai with neighbors and loved ones.", items_needed: ["Gujiya", "Sweets"] }
        ],
        recipes: [
            {
                name: "Traditional Gujiya",
                description: "A classic Holi sweet: deep-fried pastry filled with sweetened khoya and dried fruits.",
                ingredients: ["2 cups Maida (All-purpose flour)", "1 cup Khoya (Mawa)", "1/2 cup Powdered sugar", "Chopped dry fruits (Almonds, Cashews)", "Cardamom powder", "Ghee for frying"],
                steps: [
                    "Knead maida with water and 2 tbsp ghee to make a firm dough. Let it rest.",
                    "Roast khoya slightly, let it cool. Mix in sugar, dry fruits, and cardamom.",
                    "Roll small dough circles, place a spoonful of filling, fold into half moon, and seal the edges tightly.",
                    "Deep fry in medium-hot ghee until golden brown. Serve crisp."
                ]
            }
        ],
        dress_guide: {
            colors: ["White", "Bright Yellow", "Red"],
            description: "White is the universally loved color for Holi as it acts as a perfect canvas for the vibrant colors (Gulal) thrown during the day. Avoid expensive or newly bought clothes."
        },
        notification_templates: {
            discovery: "Holi Fact: The festival marks the eternal and divine love of Radha and Krishna. Get ready for colors!",
            countdown: "One week left until Holi! Stock up on herbal Gulal and get your Gujiya recipes ready.",
            eve: "Tonight is Holika Dahan. May the fire burn away all negativity. Tomorrow we play colors!",
            day_of: "Happy Holi! 🎨 Wishing you a vibrant, joyous, and colorful day with your loved ones."
        }
    },
    "chaitra-navratri-2026": {
        muhurat: {
            puja_time: "06:15 AM to 10:22 AM (Ghatasthapana)",
            type: "Pratipada Tithi Muhurat",
            description: "The invocation of Goddess Durga. This is the most crucial ritual marking the beginning of the 9-day festival."
        },
        ritual_steps: [
            { order: 1, title: "Ghatasthapana", description: "Sow barley seeds in an earthen pot and establish the Kalash on the first day to invoke the Goddess.", items_needed: ["Earthen pot", "Mud", "Barley seeds", "Kalash (Copper/Brass pot)", "Water", "Coconut", "Mango leaves"] },
            { order: 2, title: "Daily Puja", description: "Worship one of the nine forms of Navadurga each day, offering specific flowers and bhog.", items_needed: ["Flowers", "Incense", "Diya", "Sweets for Bhog"] },
            { order: 3, title: "Fasting (Vrat)", description: "Observe a pure, sattvic fast devoid of onion, garlic, wheat, or rice.", items_needed: ["Buckwheat/Amaranth flour", "Fruits", "Milk"] },
            { order: 4, title: "Kanya Pujan", description: "On the 8th or 9th day, invite and worship young girls as embodiments of the Goddess.", items_needed: ["Gifts", "Halwa", "Puri", "Chana"] }
        ],
        recipes: [
            {
                name: "Kuttu Ki Pakodi",
                description: "Crispy fritters made from buckwheat flour and potatoes, perfect for Navratri fasting.",
                ingredients: ["1 cup Kuttu ka atta (Buckwheat flour)", "2 Potatoes (boiled and mashed)", "1 Green chili (chopped)", "Sendha Namak (Rock salt)", "Oil/Ghee for frying"],
                steps: [
                    "Mix kuttu atta, mashed potatoes, green chili, and rock salt.",
                    "Add a little water to form a thick batter.",
                    "Drop small spoonfuls into hot oil.",
                    "Fry until golden and crispy. Serve with mint-yogurt dip."
                ]
            }
        ],
        dress_guide: {
            colors: ["Red", "Orange", "Yellow", "Green", "White", "Royal Blue", "Pink", "Purple", "Peacock Green"],
            description: "Devotees often wear the designated auspicious color of the day representing the specific form of Goddess Durga being worshipped. Red is universally auspicious for the Goddess."
        },
        notification_templates: {
            discovery: "Navratri signifies the 9 divine nights of Cosmic Energy. Tap to read about the 9 forms of Maa Durga.",
            countdown: "Navratri begins next week! Time to clean the puja room and plan your sattvic meals.",
            eve: "Tomorrow begins the sacred 9-day journey of Chaitra Navratri. Jai Mata Di!",
            day_of: "Happy Navratri! May Goddess Durga bless your home with health, wealth, and prosperity. ✨"
        }
    },
    "ram-navami-2026": {
        muhurat: {
            puja_time: "11:04 AM to 01:35 PM",
            type: "Madhyahna Muhurat",
            description: "The time during the middle of the day marking the exact moment Lord Rama was born in Ayodhya."
        },
        ritual_steps: [
            { order: 1, title: "Morning Snana", description: "Take a holy bath early in the morning and wear clean, fresh clothes.", items_needed: ["Water"] },
            { order: 2, title: "Cradle Setup", description: "Place a small idol of infant Rama (Ram Lalla) in a beautifully decorated miniature cradle.", items_needed: ["Idol of Ram Lalla", "Miniature Cradle", "Flowers"] },
            { order: 3, title: "Madhyahna Puja", description: "Perform Aarti exactly at noon, the time of His birth, offering Panjiri and Panchamrit.", items_needed: ["Aarti Thali", "Panjiri", "Panchamrit"] },
            { order: 4, title: "Ramayana Path", description: "Read or listen to the Ramcharitmanas or chant the Rama Raksha Stotra.", items_needed: ["Ramayana Book"] }
        ],
        recipes: [
            {
                name: "Panjiri",
                description: "A traditional wheat-based sweet offering commonly made for Ram Navami.",
                ingredients: ["1 cup Whole wheat flour (Atta)", "1/2 cup Ghee", "1/2 cup Powdered sugar", "Chopped dry fruits", "Tulsi leaves"],
                steps: [
                    "Melt ghee in a heavy-bottomed pan.",
                    "Add wheat flour and roast continuously on low flame until it turns golden brown and gives off an aroma.",
                    "Turn off the heat, let it cool slightly, then mix in the sugar and dry fruits.",
                    "Offer to the deity with a Tulsi leaf before consuming."
                ]
            }
        ],
        dress_guide: {
            colors: ["Saffron", "Yellow"],
            description: "Yellow is considered highly auspicious for Lord Rama. Devotees often wear yellow or ochre traditional clothing like kurtas, sarees, or dhotis."
        },
        notification_templates: {
            discovery: "Lord Rama is the 7th avatar of Vishnu, born representing truth and morality. Tap to learn His story.",
            countdown: "Ram Navami is 7 days away! Prepare your home to welcome the birth of Lord Rama.",
            eve: "Tomorrow is Ram Navami. Prepare the cradle and the Panjiri prasadam!",
            day_of: "Happy Ram Navami! May the divine grace of Maryada Purushottam Ram always be with you. 🏹🙏"
        }
    },
    "krishna-janmashtami-2026": {
        muhurat: {
            puja_time: "12:01 AM to 12:45 AM",
            type: "Nishita Kaal",
            description: "Midnight marks the exact time of Lord Krishna's birth in Mathura."
        },
        ritual_steps: [
            { order: 1, title: "Fasting", description: "Observe a strict fast for the entire day until midnight.", items_needed: [] },
            { order: 2, title: "Footprints", description: "Draw small footprints from the doorstep to the puja room symbolizing child Krishna entering the house.", items_needed: ["Rice flour paste"] },
            { order: 3, title: "Midnight Bathing", description: "At midnight, bathe the idol of Bal Krishna (Laddu Gopal) in Panchamrit.", items_needed: ["Panchamrit", "Bal Krishna Idol"] },
            { order: 4, title: "Swinging & Offering", description: "Dress the idol in new clothes, place Him in a swing, and offer Makhan Mishri.", items_needed: ["New deity clothes", "Swing", "Makhan", "Mishri"] }
        ],
        recipes: [
            {
                name: "Makhan Mishri",
                description: "Lord Krishna's absolute favorite: freshly churned white butter mixed with rock sugar.",
                ingredients: ["1 cup Fresh cream (Malai) or homemade white butter", "2 tbsp Mishri (crystallized sugar lumps)", "Tulsi leaves"],
                steps: [
                    "If using cream, churn it vigorously until the whey separates and the white butter (makhan) gathers.",
                    "Collect the butter, wash it gently with chilled water.",
                    "Mix in the mishri crystals.",
                    "Place a Tulsi leaf on top before offering it to the deity."
                ]
            }
        ],
        dress_guide: {
            colors: ["Yellow", "Orange", "Peacock Blue"],
            description: "Bright, festive colors. Children are often dressed up as young Krishna or Radha, complete with a peacock feather resting on the crown."
        },
        notification_templates: {
            discovery: "Did you know? Krishna's favorite Makhan Mishri represents the purity and sweetness of devotion.",
            countdown: "Only 1 week until Janmashtami! Get your Laddu Gopal's poshak and swing ready.",
            eve: "Tonight is Janmashtami Eve! The midnight bells will ring soon to celebrate His birth.",
            day_of: "Happy Janmashtami! May the melodies of Krishna's flute fill your life with love and joy. 🦚🍯"
        }
    },
    "ganesh-chaturthi-2026": {
        muhurat: {
            puja_time: "11:05 AM to 01:36 PM",
            type: "Madhyahna Ganesha Puja",
            description: "Ganesha is believed to have been born during Madhyahna (midday), making this the most auspicious time for Sthapana."
        },
        ritual_steps: [
            { order: 1, title: "Pranapratishtha", description: "Install the eco-friendly Ganesha idol on a raised platform during the auspicious time.", items_needed: ["Ganesha Idol", "Wooden Stool", "Red cloth"] },
            { order: 2, title: "Shodashopachara", description: "Perform 16-step worship including offering Durva grass, red Hibiscus flowers, and Modaks.", items_needed: ["Durva grass", "Hibiscus flowers", "Modaks", "Sandalwood paste"] },
            { order: 3, title: "Aarti", description: "Sing the Ganesh Aarti ('Jai Ganesh Jai Ganesh') with family while ringing bells and offering camphor.", items_needed: ["Camphor", "Aarti Thali", "Bell"] },
            { order: 4, title: "Visarjan", description: "After 1.5, 3, 5, 7, or 10 days, bid farewell and immerse the idol in a water body.", items_needed: ["Water tank (for eco-friendly immersion)"] }
        ],
        recipes: [
            {
                name: "Ukadiche Modak",
                description: "Steamed sweet dumplings made of rice flour, filled with coconut and jaggery.",
                ingredients: ["1 cup Rice flour", "1 cup Grated fresh coconut", "1/2 cup Jaggery", "Cardamom powder", "1 tsp Ghee"],
                steps: [
                    "Cook coconut and jaggery together until melting. Add cardamom. This is the filling.",
                    "Boil 1 cup water with a pinch of salt and ghee. Turn off heat, stir in rice flour, cover for 5 mins.",
                    "Knead the hot dough until smooth.",
                    "Shape dough into small bowls, fill with the coconut mixture, pinch the edges to form a peak.",
                    "Steam for 10-12 minutes. Serve hot with a drizzle of ghee."
                ]
            }
        ],
        dress_guide: {
            colors: ["Red", "Yellow", "Orange"],
            description: "Traditional Maharashtrian attire like Nauvari sarees for women and Kurta-pajamas with a Pheta (turban) for men are popular. Bright red is Ganesha's favored color."
        },
        notification_templates: {
            discovery: "Ganesha loves Durva grass! Offering 21 blades of Durva clears obstacles. Prepare for Chaturthi.",
            countdown: "Bappa is arriving in 7 days! Have you booked your eco-friendly idol?",
            eve: "Tomorrow is Ganesh Chaturthi! Clean the mandap and prepare the Modak ingredients.",
            day_of: "Ganpati Bappa Morya! 🐘🌺 Wishing you an auspicious Ganesh Chaturthi filled with wisdom and joy."
        }
    },
    // Adding Diwali for completeness in Batch 1
    "diwali-2026": {
        muhurat: {
            puja_time: "06:01 PM to 08:00 PM",
            type: "Lakshmi Puja Muhurat",
            description: "The Pradosh Kaal mixed with Amavasya tithi, the ideal window to pray to Goddess Lakshmi and Lord Ganesha."
        },
        ritual_steps: [
            { order: 1, title: "Cleaning (Safai)", description: "Start by thoroughly cleaning the entire house to welcome Goddess Lakshmi.", items_needed: [] },
            { order: 2, title: "Decorating", description: "Light Diyas, hang Marigold garlands, and draw vibrant Rangoli at the entrance.", items_needed: ["Diyas", "Oil/Ghee", "Rangoli colors", "Flowers"] },
            { order: 3, title: "Lakshmi Puja", description: "Place idols of Ganesha and Lakshmi. Offer sweets, coins, and perform Aarti.", items_needed: ["Idols", "Silver/Gold coin", "Sweets", "Aarti plate"] },
            { order: 4, title: "Celebration", description: "Distribute sweets to neighbors and burst green crackers safely.", items_needed: ["Sweets", "Sparklers"] }
        ],
        recipes: [
            {
                name: "Besan Ladoo",
                description: "Classic Diwali sweet made from roasted gram flour, ghee, and sugar.",
                ingredients: ["2 cups Besan (Gram flour)", "1 cup Ghee", "1 cup Powdered sugar", "Cardamom powder", "Chopped almonds"],
                steps: [
                    "Melt ghee in a heavy pan and add besan. Roast on low flame until golden brown and aromatic (approx 20 mins).",
                    "Let the mixture cool slightly.",
                    "Mix in sugar, cardamom, and nuts.",
                    "Take small portions and roll them tightly into round balls (ladoos)."
                ]
            }
        ],
        dress_guide: {
            colors: ["Gold", "Red", "Maroon", "Bright Pink"],
            description: "Diwali is the grandest festival, calling for heavy, rich, and brand new traditional clothing. Silks, brocades, and bright festive colors are preferred."
        },
        notification_templates: {
            discovery: "Diwali marks Lord Rama's return to Ayodhya after 14 years. It is a celebration of inner light.",
            countdown: "Diwali is only a week away! Time to finish the deep cleaning and start making sweets.",
            eve: "Tomorrow is Diwali! Prepare the diyas and the rangoli to welcome Maa Lakshmi.",
            day_of: "Happy Diwali! 🪔✨ May your life be illuminated with endless prosperity, health, and joy."
        }
    }
};

const JSON_PATH = 'e:/flutter/App festival/backend/data/events_2026.json';

async function run() {
    try {
        console.log("Loading dataset...");
        const dataStr = fs.readFileSync(JSON_PATH, 'utf-8');
        const db = JSON.parse(dataStr);

        let updated = 0;
        let skipped = 0;

        for (const event of db) {
            const batchData = BATCH_1_EVENTS[event.slug];
            if (batchData) {
                // Apply rich data completely wiping any generic data
                event.muhurat = batchData.muhurat;
                event.ritual_steps = batchData.ritual_steps;
                event.recipes = batchData.recipes;
                event.dress_guide = batchData.dress_guide;

                // Map the new notification_templates structure
                event.notification_templates = batchData.notification_templates;

                updated++;
                console.log(`[Batch 1] Wrote Authentic Data -> ${event.slug}`);
            } else {
                skipped++;
            }
        }

        fs.writeFileSync(JSON_PATH, JSON.stringify(db, null, 2));
        console.log(`\nBatch 1 Complete! Updated ${updated} major Hindu festivals. Skipped ${skipped}.`);

    } catch (e) {
        console.error("Error:", e);
    }
}

run();
