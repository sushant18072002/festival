const fs = require('fs');

const BATCH_4_EVENTS = {
    "republic-day-2026": {
        muhurat: { puja_time: "Morning", type: "Flag Hoisting", description: "The unfurling of the National Flag across the country." },
        ritual_steps: [
            { order: 1, title: "Flag Hoisting", description: "Unfurl the Tricolor and sing the National Anthem 'Jana Gana Mana'.", items_needed: ["National Flag"] },
            { order: 2, title: "Parade Viewing", description: "Watch the grand Republic Day parade at Rajpath showcasing military might and cultural diversity.", items_needed: ["Television"] },
            { order: 3, title: "Patriotic Programs", description: "Attend or participate in patriotic songs and dances at schools or community centers.", items_needed: [] }
        ],
        recipes: [
            { name: "Tricolor Mithai", description: "Sweets designed in the three colors of the Indian flag.", ingredients: ["Coconut/Khoya", "Saffron color", "Green color", "Sugar"], steps: ["Divide the sweet mixture into three parts.", "Color one orange and one green.", "Layer them sequentially and press into a barfi shape."] }
        ],
        dress_guide: { colors: ["Saffron", "White", "Green"], description: "Dress respectfully in traditional or formal wear, often incorporating the colors of the national flag." },
        notification_templates: {
            discovery: "On this day in 1950, the Constitution of India came into effect, turning the nation into a newly formed Republic.",
            countdown: "Republic Day is next week! Prepare your flag and tune into the majestic parade.",
            eve: "Tomorrow is Republic Day! Remember the sacrifices of our freedom fighters and the architects of our Constitution.",
            day_of: "Happy Republic Day! 🇮🇳 Let us pledge to uphold the values enshrined in our Constitution."
        }
    },
    "independence-day-2026": {
        muhurat: { puja_time: "Morning", type: "Flag Hoisting", description: "The hoisting of the National Flag honoring India's freedom." },
        ritual_steps: [
            { order: 1, title: "Prime Minister's Address", description: "Listen to the Prime Minister's speech from the Red Fort.", items_needed: [] },
            { order: 2, title: "Flag Hoisting", description: "Hoist the Tricolor with pride at homes and offices.", items_needed: ["National Flag"] },
            { order: 3, title: "Kite Flying", description: "Participate in the vibrant tradition of kite flying symbolizing freedom.", items_needed: ["Kites", "Spool"] }
        ],
        recipes: [
            { name: "Tricolor Pulao", description: "A patriotic rice dish featuring three distinct layers.", ingredients: ["Basmati Rice", "Carrot puree (Saffron)", "Spinach puree (Green)"], steps: ["Cook three separate batches of rice using the differently colored purees.", "Layer them to form a beautiful, patriotic mound of Pulao."] }
        ],
        dress_guide: { colors: ["Saffron", "White", "Green"], description: "The ubiquitous Tricolor themes dominate the attire today." },
        notification_templates: {
            discovery: "The Indian National Anthem 'Jana Gana Mana' was originally composed in Bengali by Rabindranath Tagore.",
            countdown: "Independence Day is only 7 days away. Get your kites ready!",
            eve: "Tomorrow is Independence Day! Hang your flag proudly and prepare for a day of patriotic fervor.",
            day_of: "Happy Independence Day! 🇮🇳 Honoring the brave hearts who won us our freedom."
        }
    },
    "shivaji-maharaj-jayanti-2026": {
        muhurat: { puja_time: "Morning", type: "Jayanti", description: "Celebrating the birth of Chhatrapati Shivaji Maharaj, the great Maratha warrior." },
        ritual_steps: [
            { order: 1, title: "Garland Offering", description: "Offer garlands to the statues and portraits of Chhatrapati Shivaji Maharaj.", items_needed: ["Garland", "Shivaji Maharaj Portrait"] },
            { order: 2, title: "Processions", description: "Participate in magnificent processions featuring traditional Lezim dances.", items_needed: ["Lezim", "Dhol Tasha"] },
            { order: 3, title: "Powada Recitation", description: "Listen to heroic ballads (Powadas) recounting his valor.", items_needed: [] }
        ],
        recipes: [
            { name: "Puran Poli", description: "The classic Maharashtrian sweet flatbread, synonymous with every major celebration in the state.", ingredients: ["Chana Dal", "Jaggery", "Wheat Flour", "Ghee"], steps: ["Make the sweet lentil filling.", "Stuff into wheat dough and roast generously with ghee."] }
        ],
        dress_guide: { colors: ["Saffron (Bhagwa)"], description: "Traditional Maharashtrian attire with men often wearing the saffron pheta (turban) indicating Maratha pride." },
        notification_templates: {
            discovery: "Shivaji Maharaj established a competent and progressive civil rule with the help of a disciplined military and well-structured administrative organizations.",
            countdown: "Shiv Jayanti is approaching in 7 days! Prepare to honor the great Maratha King.",
            eve: "Tomorrow is Shivaji Maharaj Jayanti. Prepare the garlands and look forward to the Powadas.",
            day_of: "Jai Bhavani, Jai Shivaji! 🚩 Honoring the legendary courage and vision of Chhatrapati Shivaji Maharaj today."
        }
    },
    "ambedkar-jayanti-2026": {
        muhurat: { puja_time: "All Day", type: "Jayanti", description: "Honoring the chief architect of the Indian Constitution, Dr. B.R. Ambedkar." },
        ritual_steps: [
            { order: 1, title: "Tributes", description: "Offer floral tributes at statues of Dr. Ambedkar globally.", items_needed: ["Flowers"] },
            { order: 2, title: "Pledge for Equality", description: "Reiterate the pledge against caste discrimination and inequality.", items_needed: [] },
            { order: 3, title: "Educational Events", description: "Attend seminars emphasizing education and social justice.", items_needed: [] }
        ],
        recipes: [
            { name: "Community Feasts", description: "Simple, egalitarian community meals shared by all regardless of background.", ingredients: ["Various"], steps: ["Cooked and shared collectively to foster unity."] }
        ],
        dress_guide: { colors: ["Blue", "White"], description: "Blue is deeply symbolic of the Dalit movement and Dr. Ambedkar's legacy of equality." },
        notification_templates: {
            discovery: "Dr. Ambedkar held doctorates in economics from both Columbia University and the London School of Economics.",
            countdown: "Ambedkar Jayanti is 7 days away. A time to reflect on equality, liberty, and fraternity.",
            eve: "Tomorrow is Ambedkar Jayanti. Join the nation in honoring the architect of our Constitution.",
            day_of: "Happy Ambedkar Jayanti! 📘 Educate, Agitate, Organize. Let us uphold the vision of true equality."
        }
    },
    "gandhi-jayanti-2026": {
        muhurat: { puja_time: "Morning", type: "Jayanti", description: "The birth anniversary of Mahatma Gandhi, observed as the International Day of Non-Violence." },
        ritual_steps: [
            { order: 1, title: "Prarthana", description: "Attend multi-faith prayer meetings and sing 'Raghupati Raghava Raja Ram'.", items_needed: [] },
            { order: 2, title: "Shramdaan", description: "Participate in cleanliness drives (Swachhata Abhiyan) offering voluntary labor.", items_needed: ["Broom"] },
            { order: 3, title: "Spinning", description: "Engage in spinning the Charkha, symbolizing self-reliance.", items_needed: ["Charkha"] }
        ],
        recipes: [
            { name: "Sattvic Food", description: "Simple, non-spicy vegetarian food reflecting Gandhi's principles of dietetics and Ahimsa.", ingredients: ["Vegetables", "Lentils", "Minimal Oil"], steps: ["Cooked simply without excessive spices or oil."] }
        ],
        dress_guide: { colors: ["White"], description: "Khadi clothing. Wearing handspun Khadi honors his vision of 'Swadeshi' and rural empowerment." },
        notification_templates: {
            discovery: "Gandhi’s philosophy of 'Satyagraha' combined the Sanskrit words 'Satya' (Truth) and 'Agraha' (Firm grasping).",
            countdown: "Gandhi Jayanti is in 7 days. Plan your Shramdaan (cleanliness drive).",
            eve: "Tomorrow we celebrate the Father of the Nation. Prepare to spin the wheel of truth and non-violence.",
            day_of: "Happy Gandhi Jayanti! 🕊️ 'Be the change you wish to see in the world.' Honoring Bapu today."
        }
    },
    "international-yoga-day-2026": {
        muhurat: { puja_time: "Morning", type: "Global Observance", description: "Synchronized global yoga sessions to promote holistic health." },
        ritual_steps: [
            { order: 1, title: "Surya Namaskar", description: "Perform Sun Salutations early in the morning facing the rising sun.", items_needed: ["Yoga Mat"] },
            { order: 2, title: "Asana Practice", description: "Engage in a balanced sequence of physical postures.", items_needed: [] },
            { order: 3, title: "Pranayama & Dhyana", description: "Practice deep breathing exercises followed by meditation for mental clarity.", items_needed: [] }
        ],
        recipes: [
            { name: "Ayurvedic Herbal Tea", description: "A soothing, immunity-boosting morning brew.", ingredients: ["Holy Basil (Tulsi)", "Ginger", "Turmeric", "Honey"], steps: ["Boil the herbs in water for 5 minutes.", "Strain and add a spoon of honey.", "Consume warm before or after the yoga practice."] }
        ],
        dress_guide: { colors: ["White", "Earthy Tones"], description: "Comfortable, breathable cotton or linen activewear that allows free movement." },
        notification_templates: {
            discovery: "Yoga does not just change the way we see things, it transforms the person who sees.",
            countdown: "Get your mats ready! International Yoga Day is only a week away.",
            eve: "Tomorrow is Yoga Day! Wake up early and unite your mind, body, and breath.",
            day_of: "Happy International Yoga Day! 🧘‍♀️ Breathe in peace, exhale stress. Embrace the journey inward."
        }
    },
    "teachers-day-2026": {
        muhurat: { puja_time: "School Hours", type: "Observance", description: "Honoring Dr. Sarvepalli Radhakrishnan and all educators." },
        ritual_steps: [
            { order: 1, title: "Gratitude Messages", description: "Write heartfelt notes and give handmade cards to teachers.", items_needed: ["Pens", "Cards"] },
            { order: 2, title: "Role Reversal", description: "Senior students take on the role of teachers for the day.", items_needed: [] }
        ],
        recipes: [
            { name: "Handmade Chocolates", description: "A simple sweet gesture for educators.", ingredients: ["Chocolate compound", "Molds"], steps: ["Melt chocolate, pour into molds, refrigerate, and gift pack."] }
        ],
        dress_guide: { colors: ["Any respectful attire"], description: "Students often dress up as their favorite teachers or in formal wear." },
        notification_templates: {
            discovery: "Teachers' Day marks the birth of Dr. Sarvepalli Radhakrishnan, India's second President and a renowned philosopher.",
            countdown: "Teachers' Day is returning in 7 days! Have you prepared a thank you note?",
            eve: "Tomorrow is Teachers' Day. A perfect time to reach out to the mentors who shaped you.",
            day_of: "Happy Teachers' Day! 🎓 Thank you to all the educators who ignite minds and inspire futures."
        }
    },
    "valentines-day-2026": {
        muhurat: { puja_time: "All Day", type: "Observance", description: "A global celebration of love and affection." },
        ritual_steps: [
            { order: 1, title: "Expressions of Love", description: "Exchange roses, chocolates, and personalized gifts.", items_needed: ["Red Roses", "Gifts"] },
            { order: 2, title: "Quality Time", description: "Spend dedicated, uninterrupted time with your significant other.", items_needed: [] }
        ],
        recipes: [
            { name: "Chocolate Covered Strawberries", description: "A classic romantic treat.", ingredients: ["Strawberries", "Dark Chocolate"], steps: ["Dip fresh strawberries into melted dark chocolate.", "Let them cool on parchment paper."] }
        ],
        dress_guide: { colors: ["Red", "Pink", "Black"], description: "Elegant outfits, predominantly red or pink, symbolizing romance." },
        notification_templates: {
            discovery: "Valentine's Day originated as a Christian feast day honoring early martyrs named Saint Valentine.",
            countdown: "Valentine's Day is just 7 days away. Book your dinner reservations now!",
            eve: "Tomorrow is Valentine's Day. Finalize your romantic surprises.",
            day_of: "Happy Valentine's Day! ❤️ Celebrate the magic of love, companionship, and affection today."
        }
    },
    // Adding minimal structured defaults for the final few to hit 100%
    "childrens-day-2026": {
        muhurat: { puja_time: "All Day", type: "Observance", description: "Celebrating the birth of Pt. Jawaharlal Nehru and the magic of childhood." },
        ritual_steps: [{ order: 1, title: "Games & Activities", description: "Organize fun games, picnics, and cultural events for children.", items_needed: ["Toys", "Games"] }],
        recipes: [{ name: "Pav Bhaji", description: "A universal favorite among kids.", ingredients: ["Pav", "Mixed Veggies", "Butter", "Spices"], steps: ["Mash boiled veggies with spices and butter, serve with hot buttered buns."] }],
        dress_guide: { colors: ["Bright multi-colors"], description: "Colorful, playful, and extremely comfortable clothes." },
        notification_templates: { discovery: "Children's Day in India is celebrated on Jawaharlal Nehru's birthday because of his deep affection for kids.", countdown: "Children's Day is in 7 days. Plan a surprise picnic!", eve: "Tomorrow is Children's Day! Let the kids be the bosses.", day_of: "Happy Children's Day! 🎈 Let us nurture the innocence and dreams of every child." }
    },
    "world-environment-day-2026": {
        muhurat: { puja_time: "All Day", type: "Observance", description: "Global day for environmental awareness and action." },
        ritual_steps: [{ order: 1, title: "Tree Plantation", description: "Plant native saplings in your community.", items_needed: ["Saplings", "Shovel"] }],
        recipes: [{ name: "Zero-Waste Meal", description: "Cook a meal utilizing all parts of the vegetables.", ingredients: ["Vegetable Peels", "Stems"], steps: ["Use stems for stocks, and peels for crispy snacks."] }],
        dress_guide: { colors: ["Green", "Earth Tones"], description: "Clothes made from sustainable, organic, or recycled fabrics." },
        notification_templates: { discovery: "The UN has marked June 5 as World Environment Day since 1973 to encourage global awareness.", countdown: "World Environment Day is arriving. Plan a local clean-up drive.", eve: "Tomorrow is Environment Day. Let's pledge to reduce our carbon footprint.", day_of: "Happy World Environment Day! 🌍 The Earth is what we all have in common. Protect it." }
    },
    "mothers-day-2026": {
        muhurat: { puja_time: "All Day", type: "Observance", description: "Honoring mothers and motherhood globally." },
        ritual_steps: [{ order: 1, title: "Rest Day", description: "Take over all household chores so she can rest.", items_needed: [] }],
        recipes: [{ name: "Breakfast in Bed", description: "A classic gesture of love.", ingredients: ["Pancakes", "Coffee", "Fruit"], steps: ["Prepare her favorite breakfast and serve it gracefully in bed."] }],
        dress_guide: { colors: ["Pastels"], description: "Comforting and soft hues." },
        notification_templates: { discovery: "Mother's Day was first celebrated in 1908 by Anna Jarvis to honor her own mother.", countdown: "Mother's Day is next week. Have you chosen her gift?", eve: "Tomorrow is Mother's Day. Plan the perfect relaxing day for her.", day_of: "Happy Mother's Day! 💐 A mother's love is the fuel that enables a normal human being to do the impossible." }
    },
    "fathers-day-2026": {
        muhurat: { puja_time: "All Day", type: "Observance", description: "Honoring fathers and paternal bonds globally." },
        ritual_steps: [{ order: 1, title: "Quality Time", description: "Spend the day engaging in his favorite hobbies.", items_needed: [] }],
        recipes: [{ name: "His Favorite Meal", description: "Cook up absolute comfort food.", ingredients: ["Various"], steps: ["Tailor the recipe exactly to his liking."] }],
        dress_guide: { colors: ["Blue", "Grey"], description: "Casual, relaxed weekend wear." },
        notification_templates: { discovery: "Father's Day complements Mother's Day in celebrating parenting.", countdown: "Father's Day is 7 days away. Plan a day out with dad.", eve: "Tomorrow is Father's Day. Get ready to show your appreciation.", day_of: "Happy Father's Day! 👔 Honoring the silent sacrifices and the guiding hands of all fathers." }
    },
    "womens-day-2026": {
        muhurat: { puja_time: "All Day", type: "Observance", description: "Celebrating the social, economic, cultural, and political achievements of women." },
        ritual_steps: [{ order: 1, title: "Empowerment", description: "Acknowledge and elevate the women in your life and workplace.", items_needed: [] }],
        recipes: [{ name: "Celebratory Cake", description: "A sweet tribute.", ingredients: ["Flour", "Sugar", "Vanilla"], steps: ["Bake and share with the incredible women around you."] }],
        dress_guide: { colors: ["Purple", "Green", "White"], description: "Purple signifies justice and dignity; heavily associated with Women's Day." },
        notification_templates: { discovery: "International Women's Day has occurred for well over a century, tracing back to 1911.", countdown: "Women's Day is coming up. Recognize the female leaders around you.", eve: "Tomorrow is International Women's Day. Celebrate empowerment and equality.", day_of: "Happy Women's Day! 💜 Here's to strong women: May we know them. May we be them. May we raise them." }
    }
};

const JSON_PATH = 'e:/flutter/App festival/backend/data/events_2026.json';

async function run() {
    try {
        console.log("Loading dataset for Batch 4...");
        const dataStr = fs.readFileSync(JSON_PATH, 'utf-8');
        const db = JSON.parse(dataStr);

        let updated = 0;
        let skipped = 0;

        for (const event of db) {
            const batchSlug = BATCH_4_EVENTS[event.slug]?.alias || event.slug;
            const batchData = BATCH_4_EVENTS[batchSlug];

            if (batchData && !batchData.alias) {
                event.muhurat = batchData.muhurat;
                event.ritual_steps = batchData.ritual_steps;
                event.recipes = batchData.recipes;
                event.dress_guide = batchData.dress_guide;
                event.notification_templates = batchData.notification_templates;

                updated++;
                console.log(`[Batch 4] Wrote Authentic Data -> ${event.slug}`);
            } else {
                skipped++;
            }
        }

        fs.writeFileSync(JSON_PATH, JSON.stringify(db, null, 2));
        console.log(`\nBatch 4 Complete! Updated ${updated} national/global events. Skipped ${skipped}.`);

    } catch (e) {
        console.error("Error:", e);
    }
}

run();
