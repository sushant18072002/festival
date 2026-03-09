const fs = require('fs');

const BATCH_2_EVENTS = {
    "navratri-2026": {
        muhurat: { puja_time: "06:11 AM to 10:11 AM (Ghatasthapana)", type: "Pratipada Tithi", description: "The most auspicious window to establish the Kalash on the first day of Sharadiya Navratri." },
        ritual_steps: [
            { order: 1, title: "Ghatasthapana", description: "Sow barley seeds in clay and set up the copper Kalash.", items_needed: ["Earthen pot", "Barley", "Kalash", "Mango leaves", "Coconut"] },
            { order: 2, title: "Fasting", description: "Observe a pure Sattvic fast throughout the 9 days.", items_needed: ["Fruits", "Buckwheat", "Milk"] },
            { order: 3, title: "Garba / Dandiya", description: "Participate in traditional devotional dance rituals in the evening.", items_needed: ["Dandiya Sticks", "Traditional Attire"] },
            { order: 4, title: "Maha Ashtami Kanya Pujan", description: "Worship young girls as the embodiment of Goddess Durga.", items_needed: ["Puri", "Halwa", "Chana", "Gifts"] }
        ],
        recipes: [
            { name: "Sabudana Vada", description: "Crispy fried tapioca pearl patties often eaten during fasting.", ingredients: ["1 cup Sabudana", "2 boiled potatoes", "Roasted peanuts", "Green chili", "Rock salt"], steps: ["Soak sabudana for 4 hours.", "Mash potatoes and mix with sabudana, crushed peanuts, chili, and salt.", "Shape into patties and deep fry until golden."] }
        ],
        dress_guide: { colors: ["Red", "Royal Blue", "Yellow", "Green", "Grey", "Orange", "White", "Pink", "Purple"], description: "Each of the 9 days carries a specific color corresponding to the Navadurga." },
        notification_templates: {
            discovery: "Navratri is not just a dance festival; it's a 9-day journey honoring the divine feminine.",
            countdown: "Sharad Navratri is 7 days away! Ready your Chaniya Cholis and Kurta Pajamas.",
            eve: "Tomorrow begins the 9 divine nights of Navratri! Jai Ambe Maa.",
            day_of: "Happy Navratri! Step into the cosmic rhythm of devotion and Garba."
        }
    },
    "raksha-bandhan-2026": {
        muhurat: { puja_time: "01:30 PM to 09:08 PM", type: "Aparahna Time", description: "The best time to tie the Rakhi, avoiding the inauspicious Bhadra period." },
        ritual_steps: [
            { order: 1, title: "Preparation", description: "Prepare the Rakhi thali with an earthen lamp, kumkum, rice, and sweets.", items_needed: ["Thali", "Rakhi", "Diya", "Kumkum", "Akshat (Rice)", "Sweets"] },
            { order: 2, title: "Aarti", description: "The sister performs the Aarti of the brother to ward off the evil eye.", items_needed: ["Aarti Thali"] },
            { order: 3, title: "Tying the Rakhi", description: "Sister ties the sacred Rakhi thread on the brother's right wrist.", items_needed: ["Rakhi Thread"] },
            { order: 4, title: "Vow & Sweets", description: "Brother pledges to protect her, and they feed each other sweets.", items_needed: ["Sweets", "Gifts"] }
        ],
        recipes: [
            { name: "Kaju Katli", description: "A diamond-shaped cashew fudge, universally loved for Rakhi.", ingredients: ["1 cup Cashew powder", "1/2 cup Sugar", "1/4 cup Water", "Silver leaf (optional)"], steps: ["Boil sugar and water to single-string consistency.", "Add cashew powder and stir quickly on low heat.", "Wait until it leaves the pan sides. Knead gently.", "Roll flat and cut into diamond shapes."] }
        ],
        dress_guide: { colors: ["Pink", "Yellow", "Orange"], description: "Bright ethnic wear. Brothers often wear kurtas, and sisters wear vibrant salwar suits or lehengas." },
        notification_templates: {
            discovery: "Did you know Raksha Bandhan literally translates to 'The Bond of Protection'?",
            countdown: "Only 1 week until Raksha Bandhan! Have you bought the perfect Rakhi and gift?",
            eve: "Tomorrow is Raksha Bandhan! Prepare the thali and the sweets.",
            day_of: "Happy Raksha Bandhan! Celebrate the unbreakable bond between brothers and sisters. 💕"
        }
    },
    "hanuman-jayanti-2026": {
        muhurat: { puja_time: "Sunrise", type: "Pratah Kaal", description: "Lord Hanuman was born at sunrise on the Full Moon day of Chaitra." },
        ritual_steps: [
            { order: 1, title: "Temple Visit", description: "Visit a Hanuman temple early in the morning and offer Sindoor.", items_needed: ["Sindoor", "Jasmine Oil"] },
            { order: 2, title: "Chanting", description: "Read the Hanuman Chalisa, Bajrang Baan, or Sunderkand.", items_needed: ["Hanuman Chalisa Book/App"] },
            { order: 3, title: "Offerings", description: "Offer Boondi Ladoos, betel leaves, and red flowers.", items_needed: ["Boondi Ladoos", "Red Hibiscus", "Paan"] }
        ],
        recipes: [
            { name: "Boondi Ladoo", description: "Sweet gram flour droplets bound together, a favorite of Lord Hanuman.", ingredients: ["Besan", "Sugar", "Ghee", "Cardamom", "Melon seeds"], steps: ["Fry tiny droplets of besan batter in ghee.", "Soak them in warm sugar syrup.", "Add cardamom and seeds, shape into round balls while warm."] }
        ],
        dress_guide: { colors: ["Red", "Saffron"], description: "Red and Saffron are deeply associated with Hanuman, symbolizing energy and strength." },
        notification_templates: {
            discovery: "Hanuman embodies pure devotion (Bhakti), strength (Shakti), and absolute surrender.",
            countdown: "Hanuman Jayanti is arriving in 7 days! Prepare to chant the powerful Chalisa.",
            eve: "Tomorrow is Hanuman Jayanti. Wake up early for the sunrise prayers.",
            day_of: "Happy Hanuman Jayanti! May Bajrangbali grant you boundless strength, courage, and devotion. 📿🐒"
        }
    },
    "gudi-padwa-ugadi-2026": {
        muhurat: { puja_time: "06:15 AM to 08:30 AM", type: "Pratah Kaal Tithi", description: "The auspicious morning timeframe marking the beginning of the Hindu New Year." },
        ritual_steps: [
            { order: 1, title: "Oil Bath", description: "Take a traditional Abhyanga Snan (oil bath) before sunrise.", items_needed: ["Sesame Oil"] },
            { order: 2, title: "Hoisting the Gudi", description: "Erect the Gudi (a pole adorned with a silk cloth, neem leaves, and a copper pot inverted on top) outside the house.", items_needed: ["Bamboo stick", "Silk cloth", "Neem and Mango leaves", "Flower garland", "Copper pot"] },
            { order: 3, title: "Pachadi/Neem Consumption", description: "Eat a mixture of Neem and Jaggery (or Ugadi Pachadi) signifying the acceptance of life's bitter-sweet moments.", items_needed: ["Neem leaves", "Jaggery", "Ugadi Pachadi ingredients"] }
        ],
        recipes: [
            { name: "Shrikhand", description: "A Maharashtrian sweet dish made of strained yogurt flavored with saffron and cardamom.", ingredients: ["500g Hung Curd", "1 cup Powdered sugar", "Saffron strands", "Cardamom powder", "Pistachios"], steps: ["Whisk hung curd and sugar until entirely smooth.", "Add saffron soaked in warm milk and cardamom powder.", "Garnish with pistachios and serve chilled with puris."] },
            { name: "Ugadi Pachadi", description: "A six-taste concoction representing the diverse experiences of life.", ingredients: ["Tamarind paste", "Jaggery", "Raw Mango", "Neem flowers", "Chili powder", "Salt"], steps: ["Mix all ingredients with water.", "Serve a spoonful to family members before meals."] }
        ],
        dress_guide: { colors: ["Yellow", "Orange", "Red"], description: "New traditional Indian attire. Nauvari sarees for women and Kurta/Dhoti for men." },
        notification_templates: {
            discovery: "The bitter-sweet essence of Neem and Jaggery teaches us to accept life's duality gracefully.",
            countdown: "The Hindu New Year is just a week away! Ready the Gudi and the Shrikhand?",
            eve: "Tomorrow is Gudi Padwa and Ugadi! A glorious start to the new year.",
            day_of: "Happy Gudi Padwa & Ugadi! Wishing you a sweet and prosperous new beginning. 🌿🌟"
        }
    },
    "dussehra-2026": {
        muhurat: { puja_time: "02:04 PM to 02:51 PM", type: "Vijay Muhurat", description: "The definitive moment of victory, highly auspicious for starting any new endeavor or performing Shastra Puja." },
        ritual_steps: [
            { order: 1, title: "Shastra Puja", description: "Worship weapons, tools, vehicles, and books as instruments of strength and knowledge.", items_needed: ["Tools", "Vehicles", "Books", "Kumkum", "Flowers"] },
            { order: 2, title: "Aapta Leaves", description: "Exchange Aapta leaves (Banni) referring to them as 'Gold', signifying prosperity.", items_needed: ["Aapta (Banni) leaves"] },
            { order: 3, title: "Ravana Dahan", description: "Witness the burning of the effigies of Ravana, Kumbhakarna, and Meghanada in the evening.", items_needed: [] },
            { order: 4, title: "Simollanghan", description: "Cross the boundaries (metaphorical or physical) signifying breaking limits and embarking on new conquests.", items_needed: [] }
        ],
        recipes: [
            { name: "Jalebi and Fafda", description: "A classic Gujarati Dussehra pairing uniting sweet and savory textures.", ingredients: ["Jalebi", "Fafda (Besan snack)"], steps: ["Best sourced fresh from a sweet shop early in the morning.", "Enjoy the contrasting crispy salty fafda with syrupy hot jalebis."] }
        ],
        dress_guide: { colors: ["Orange", "Gold", "Red"], description: "Festive and formal traditional wear. Royal and bright colors reflecting victory." },
        notification_templates: {
            discovery: "Dussehra marks the day Lord Rama defeated Ravana. It's the ultimate triumph of Dharma over Adharma.",
            countdown: "Only 7 days until Dussehra! Prepare your tools and vehicles for the Shastra Puja.",
            eve: "Tomorrow is Dussehra! The effigies will burn, and truth will prevail.",
            day_of: "Happy Dussehra (Vijayadashami)! May the forces of good continuously guide you to victory. 🏹🔥"
        }
    },
    "chhath-puja-2026": {
        muhurat: { puja_time: "05:27 PM (Sunset) & 06:33 AM (Sunrise)", type: "Arghya Time", description: "The precise timing of offering water to the Setting Sun (Sandhya Arghya) and the Rising Sun (Usha Arghya)." },
        ritual_steps: [
            { order: 1, title: "Nahay Khay", description: "Take a holy dip in a river, clean the house, and eat a single sattvic meal.", items_needed: ["Bottle gourd", "Chana Dal", "Rice"] },
            { order: 2, title: "Kharna", description: "Observe a strict fast for the entire day and break it after sunset with Rasiya (kheer) and Roti.", items_needed: ["Rasiya", "Roti"] },
            { order: 3, title: "Sandhya Arghya", description: "Stand in waist-deep water in a river/pond and offer Arghya to the setting sun.", items_needed: ["Bamboo basket (Soop)", "Fruits", "Arghya pot", "Water/Milk", "Thekua"] },
            { order: 4, title: "Usha Arghya", description: "Offer Arghya to the rising sun the next morning, completing the 36-hour strict fast.", items_needed: ["Soop", "Arghya offerings"] }
        ],
        recipes: [
            { name: "Thekua", description: "A deep-fried, crisp, sweet wheat biscuit that is the signature Prasad of Chhath Puja.", ingredients: ["Whole wheat flour", "Jaggery (melted in water)", "Ghee", "Fennel seeds", "Dry coconut cuts"], steps: ["Mix wheat flour with fennel, coconut, and ghee.", "Knead a stiff dough using jaggery water.", "Shape into ovals or rounds using a wooden mold.", "Deep fry in pure ghee on medium heat until dark golden and crisp."] }
        ],
        dress_guide: { colors: ["Yellow", "Orange", "Red"], description: "Vratis (fasting individuals) mostly wear unstitched, pure cotton yellow or orange sarees/dhotis." },
        notification_templates: {
            discovery: "Chhath is uniquely dedicated to Chhathi Maiya and Surya Dev (The Sun), thanking them for sustaining life on Earth.",
            countdown: "Chhath Puja begins in 7 days. Time to prepare the wheat and jaggery for Thekua.",
            eve: "Tomorrow is Nahay Khay! Let the sacred 4-day festival of purity and devotion begin.",
            day_of: "Happy Chhath Puja! Stand in the holy waters and offer your prayers to the radiant Sun God. 🌅💧"
        }
    },
    "lohri-makar-sankranti-2026": {
        muhurat: { puja_time: "07:15 PM (Lohri) | 08:30 AM (Makar Sankranti)", type: "Bonfire & Punya Kaal", description: "Lighting of the Lohri Bonfire at dusk, and the Punya Kaal bath at sunrise for Sankranti." },
        ritual_steps: [
            { order: 1, title: "Bonfire (Lohri)", description: "Light the bonfire in the evening; circumambulate it while tossing til, rewri, and popcorn into the flames.", items_needed: ["Wood", "Peanuts", "Rewri", "Popcorn", "Sesame seeds"] },
            { order: 2, title: "Holy Snan (Sankranti)", description: "Take a bath in a sacred river during the morning Punya Kaal.", items_needed: ["Water"] },
            { order: 3, title: "Kite Flying", description: "Fly colorful kites on the terrace, soaking in the gentle winter sun.", items_needed: ["Kites", "Spool (Charkhi)"] },
            { order: 4, title: "Til-Gud Exchange", description: "Exchange sesame and jaggery sweets saying 'Til gud ghya, god god bola'.", items_needed: ["Til Ladoos"] }
        ],
        recipes: [
            { name: "Til Ke Ladoo", description: "Sesame and jaggery balls, rich in iron and calcium to keep the body warm.", ingredients: ["1 cup Sesame seeds", "3/4 cup Jaggery", "1 tsp Ghee", "Cardamom powder"], steps: ["Dry roast sesame seeds until they pop.", "Melt jaggery with water and ghee until frothy.", "Mix roasted sesame seeds into the hot jaggery.", "Apply drops of water to hands and quickly shape into round balls before it cools."] },
            { name: "Sarson Ka Saag & Makki Ki Roti", description: "The iconic Punjabi winter meal served during Lohri.", ingredients: ["Mustard greens", "Spinach", "Corn flour", "Butter/Ghee", "Garlic", "Spices"], steps: ["Boil and blend greens.", "Temper with garlic, ginger, and ghee.", "Knead cornflour with warm water into discs and cook on a griddle. Serve with massive dollops of white butter."] }
        ],
        dress_guide: { colors: ["Yellow", "Orange", "Bright Red", "Black (specifically for Makar Sankranti in Maharashtra)"], description: "Warm Punjabi festive wear like Phulkari suits for Lohri, and often Black sarees for Sankranti to absorb the sun's heat." },
        notification_templates: {
            discovery: "These festivals mark the end of winter solstice and the Sun's transit into Capricorn (Makara).",
            countdown: "Only a week left until Lohri & Makar Sankranti! Get your kites and peanuts ready.",
            eve: "Tonight is Lohri! Gather around the bonfire. Tomorrow, we fly kites for Sankranti!",
            day_of: "Happy Lohri & Makar Sankranti! May the harvest season bring you boundless prosperity. 🪁🔥"
        }
    },
    // Aliases to handle the unified slugs
    "makar-sankranti-2026": { alias: "lohri-makar-sankranti-2026" },
    "baisakhi-vishu-bihu-2026": {
        muhurat: { puja_time: "Morning", type: "Pratah Kaal", description: "The commencement of the solar New Year across Punjab (Baisakhi), Kerala (Vishu), and Assam (Rongali Bihu)." },
        ritual_steps: [
            { order: 1, title: "Vishu Kani", description: "In Kerala, view the auspicious 'Vishu Kani' (golden shower flowers, fruits, gold, mirror) first thing in the morning.", items_needed: ["Konna flowers", "Fruits", "Gold", "Mirror", "Uruli"] },
            { order: 2, title: "Nagar Kirtan", description: "In Punjab, participate in Gurdwara processions celebrating the formation of the Khalsa panth.", items_needed: ["Traditional clothes"] },
            { order: 3, title: "Bihu Dance", description: "In Assam, men and women perform the traditional Bihu dance to the beats of the Dhol and Pepa.", items_needed: ["Gamosa", "Dhol"] },
            { order: 4, title: "Feasting", description: "Share a grand community or family feast celebrating the Spring harvest.", items_needed: ["Sadhya/Langar/Pitha"] }
        ],
        recipes: [
            { name: "Til Pitha (Bihu)", description: "A classic Assamese sweet made of glutinous rice stuffed with black sesame and jaggery.", ingredients: ["Sticky rice flour", "Black sesame seeds", "Jaggery"], steps: ["Roast and grind sesame, mix with jaggery.", "Spread rice flour thinly on a hot tawa.", "Place the stuffing in the center and fold it into a cylindrical roll."] }
        ],
        dress_guide: { colors: ["Yellow", "Red", "White/Gold"], description: "Vibrant yellow/orange for Baisakhi, Kerala Kasavu (White & Gold) for Vishu, and Muga silk dresses with red motifs for Bihu." },
        notification_templates: {
            discovery: "Three states, three names, one majestic celebration of the Spring harvest!",
            countdown: "Spring New Year is approaching in 7 days! Prepare for the Bihu dances and Vishu Kani.",
            eve: "Tomorrow is Baisakhi, Vishu, and Bihu. Arrange the Kani and prepare traditional attire.",
            day_of: "Happy Baisakhi, Vishu, & Bihu! Wishing you a bountiful and joyous Solar New Year. 🌾☀️"
        }
    },
    "onam-2026": {
        muhurat: { puja_time: "All Day", type: "Thiruvonam Asterism", description: "The main day of Onam when the spirit of the legendary King Mahabali visits Kerala." },
        ritual_steps: [
            { order: 1, title: "Pookalam", description: "Create intricate floral carpets (Pookalam) at the entrance of the house to welcome King Mahabali.", items_needed: ["Fresh colorful flowers"] },
            { order: 2, title: "Onakkodi", description: "Gift and wear new clothes, specifically Kerala Kasavu traditional wear.", items_needed: ["New Clothes"] },
            { order: 3, title: "Onasadya", description: "Prepare and serve the grand 26-dish vegetarian feast on a plantain leaf.", items_needed: ["Plantain leaves", "26 traditional dishes"] },
            { order: 4, title: "Vallam Kali", description: "Watch or participate in the spectacular Snake Boat races.", items_needed: [] }
        ],
        recipes: [
            { name: "Palada Pradhaman", description: "The king of Onam sweets: a rich milk and rice-flakes dessert.", ingredients: ["Rice ada (flakes)", "Full cream milk", "Sugar", "Cardamom", "Cashews"], steps: ["Wash and soak the rice ada.", "Boil milk and sugar until slightly reduced and pinkish.", "Add the ada and cook until soft and thickened.", "Garnish with cardamom and cashews."] },
            { name: "Avial", description: "A thick mixture of 13 vegetables and coconut, seasoned with coconut oil and curry leaves.", ingredients: ["Mixed local veg (Yam, Plantain, Carrot, Beans, Ash gourd)", "Grated coconut", "Green chillies", "Curd", "Coconut oil", "Curry leaves"], steps: ["Boil vegetables lightly.", "Grind coconut and chillies, add to vegetables.", "Mix in beaten curd and simmer.", "Finish with fresh coconut oil and curry leaves."] }
        ],
        dress_guide: { colors: ["White", "Gold"], description: "The traditional Kerala Kasavu saree for women and Mundu for men, symbolizing elegance and purity." },
        notification_templates: {
            discovery: "Onam celebrates the homecoming of the righteous and benevolent Asura King Mahabali.",
            countdown: "Onam is just a week away! Have you planned your 26-dish Onasadya menu?",
            eve: "Tomorrow is Thiruvonam. Prepare the grand Pookalam and get the plantain leaves ready.",
            day_of: "Happy Onam! 🌸🍛 May the spirit of King Mahabali bring prosperity, equality, and joy to your home."
        }
    },
    "guru-purnima-2026": {
        muhurat: { puja_time: "Morning", type: "Purnima Tithi", description: "Wiping out the darkness of ignorance (Gu) with the light of knowledge (Ru) on the full moon." },
        ritual_steps: [
            { order: 1, title: "Guru Puja", description: "Visit and offer respects to your spiritual or academic teachers.", items_needed: ["Garlands", "Gifts", "Sweets"] },
            { order: 2, title: "Vyasa Puja", description: "Offer prayers to Sage Ved Vyasa, the author of the Mahabharata.", items_needed: ["Flowers", "Incense"] },
            { order: 3, title: "Reflection", description: "Spend the day in meditation and reading spiritual scriptures.", items_needed: [] }
        ],
        recipes: [
            { name: "Sooji Halwa", description: "A simple, pure offering for Gurus made from semolina.", ingredients: ["1 cup Sooji (Semolina)", "1 cup Sugar", "1/2 cup Ghee", "3 cups Water", "Cardamom"], steps: ["Roast sooji in ghee until aromatic.", "Boil water and sugar separately to make a syrup.", "Carefully pour syrup into roasted sooji, stir continuously to avoid lumps. Cook until thick."] }
        ],
        dress_guide: { colors: ["Yellow", "White"], description: "Simple, modest white or yellow clothes representing purity, learning, and dedication." },
        notification_templates: {
            discovery: "Guru Purnima honors Sage Ved Vyasa and all teachers who guide us from darkness to light.",
            countdown: "Guru Purnima is in 7 days. Plan a visit or a message for the mentors in your life.",
            eve: "Tomorrow is Guru Purnima. Give thanks to the teachers who illuminate your path.",
            day_of: "Happy Guru Purnima! 🙏 May the wisdom of your gurus guide you to eternal truth."
        }
    },
    "karva-chauth-2026": {
        muhurat: { puja_time: "05:46 PM to 07:02 PM", type: "Upavasa & Puja", description: "The strictest nirjala (waterless) fast observed by married women from sunrise to moonrise for their husband's long life." },
        ritual_steps: [
            { order: 1, title: "Sargi", description: "Wake up before sunrise to eat the Sargi (pre-dawn meal) given by the mother-in-law.", items_needed: ["Pheni", "Fruits", "Sweets", "Nuts"] },
            { order: 2, title: "Nirjala Fast", description: "Abstain from all food and water throughout the day.", items_needed: [] },
            { order: 3, title: "Evening Puja", description: "Listen to the Karva Chauth Katha and perform the puja of Goddess Parvati.", items_needed: ["Karva (Clay pot)", "Thali", "Sweets", "Kalash"] },
            { order: 4, title: "Moonrise", description: "Look at the moon through a sieve, then look at the husband. The husband breaks her fast with a sip of water.", items_needed: ["Sieve (Channi)", "Water", "Sweets"] }
        ],
        recipes: [
            { name: "Pheni", description: "A vermicelli-like sweet dish consumed pre-dawn during Sargi for sustained energy.", ingredients: ["Pheni (fine roasted vermicelli)", "Full cream milk", "Sugar", "Dry fruits"], steps: ["Boil milk and reduce it slightly.", "Add sugar and dry fruits.", "Pour hot milk over the pheni in a bowl. Let it soften for 5 mins before eating."] }
        ],
        dress_guide: { colors: ["Red", "Maroon", "Gold", "Pink"], description: "Women dress up lavishly like brides. Red is highly prominent. Solah Shringar (16 adornments including Mehendi and Bindi) are essential." },
        notification_templates: {
            discovery: "Sargi, eaten before dawn, is a symbol of a mother-in-law's blessing and care on Karva Chauth.",
            countdown: "Karva Chauth is 7 days away! Book your Mehendi appointments.",
            eve: "Tomorrow is Karva Chauth! Ensure the Sargi prep is ready for the pre-dawn meal.",
            day_of: "Happy Karva Chauth! 🌙 May your bond of love and devotion be blessed with longevity and happiness."
        }
    },
    "dhanteras-2026": {
        muhurat: { puja_time: "05:47 PM to 07:43 PM", type: "Pradosh Kaal", description: "The ideal time for Lakshmi and Kubera Puja, marking the first day of the Diwali festival." },
        ritual_steps: [
            { order: 1, title: "Purchasing", description: "Buy gold, silver, or new utensils as a sign of bringing Lakshmi (wealth) home.", items_needed: ["Gold/Silver coin", "New utensils", "Broom"] },
            { order: 2, title: "Dhanvantari Puja", description: "Pray to Lord Dhanvantari, the physician of the Gods, for good health.", items_needed: ["Flowers", "Incense"] },
            { order: 3, title: "Yama Deepam", description: "Light a four-wick diya outside the main door facing south to ward off untimely death.", items_needed: ["Clay Diya", "Mustard Oil", "4 wicks"] }
        ],
        recipes: [
            { name: "Panchamrit", description: "The holy nectar used in pujas.", ingredients: ["Milk", "Curd", "Honey", "Ghee", "Sugar"], steps: ["Mix all 5 ingredients in a silver or copper bowl.", "Add Tulsi leaves.", "Offer to deities and consume as Prasad."] }
        ],
        dress_guide: { colors: ["Gold", "Yellow", "Red"], description: "Bright, rich colors welcoming wealth and prosperity into the home." },
        notification_templates: {
            discovery: "Dhanteras honors both Lord Kubera (Wealth) and Lord Dhanvantari (Health and Ayurveda).",
            countdown: "Dhanteras is just a week away! Plan your gold or utensil purchases.",
            eve: "Tomorrow is Dhanteras. Clean your entrances and prepare the Yama Deepam.",
            day_of: "Happy Dhanteras! ✨ May Lord Kubera and Dhanvantari bless your home with health, wealth, and prosperity."
        }
    },
    "bhai-dooj-2026": {
        muhurat: { puja_time: "01:10 PM to 03:22 PM", type: "Aparahna Kaal", description: "The afternoon period ideal for performing the Bhai Dooj Tikka ceremony." },
        ritual_steps: [
            { order: 1, title: "Tilak", description: "Sister applies a Tikka of vermilion, dahi, and rice on the brother's forehead.", items_needed: ["Kumkum", "Dahi", "Rice"] },
            { order: 2, title: "Aarti & Sweets", description: "Perform Aarti and feed sweets to the brother.", items_needed: ["Aarti Thali", "Sweets"] },
            { order: 3, title: "Feast", description: "Sister prepares a lavish, favorite meal for her brother.", items_needed: [] },
            { order: 4, title: "Gifting", description: "Exchange gifts as tokens of love and protection.", items_needed: ["Gifts"] }
        ],
        recipes: [
            { name: "Basundi", description: "A sweetened dense milk dessert, popular in Western India for Bhai Dooj.", ingredients: ["1 liter Full fat milk", "1/2 cup Sugar", "Nutmeg powder", "Cardamom", "Saffron"], steps: ["Boil milk and simmer on low heat, scraping the cream from the sides.", "Wait until milk reduces to half volume.", "Add sugar, saffron, and spices.", "Serve chilled garnished with pistachios."] }
        ],
        dress_guide: { colors: ["Pink", "Orange", "Yellow"], description: "Casual yet festive ethnic wear characterizing the warm, familial tone of the concluding day of Diwali." },
        notification_templates: {
            discovery: "Bhai Dooj commemorates the day Lord Yama visited his sister Yami and granted her a boon.",
            countdown: "Bhai Dooj is returning in 7 days! Plan the perfect gift and feast for your sibling.",
            eve: "Tomorrow is Bhai Dooj! Time to prepare the Tilak thali and the favorite sweets.",
            day_of: "Happy Bhai Dooj! 👫 Cherish the sweet, lifelong bond of siblings today."
        }
    },
    "vasant-panchami-2026": {
        muhurat: { puja_time: "07:12 AM to 12:34 PM", type: "Purvahna Kaal", description: "The morning hours marking the onset of Spring and the worship of Goddess Saraswati." },
        ritual_steps: [
            { order: 1, title: "Yellow Clothing", description: "Wake up early, bathe, and wear yellow clothes representing the blooming mustard fields.", items_needed: ["Yellow Clothes"] },
            { order: 2, title: "Saraswati Puja", description: "Worship Goddess Saraswati, placing books, pens, and musical instruments near the idol.", items_needed: ["Books", "Pens", "Instruments", "Yellow Flowers"] },
            { order: 3, title: "Vidyaarambham", description: "Introduce young children to writing for the first time by writing 'Om' on rice.", items_needed: ["Plate", "Rice/Sand"] },
            { order: 4, title: "Yellow Offerings", description: "Offer yellow sweets like Boondi or sweet saffron rice to the Goddess.", items_needed: ["Sweet Yellow Rice"] }
        ],
        recipes: [
            { name: "Meethe Chawal (Sweet Yellow Rice)", description: "A fragrant yellow rice dish representing the vibrancy of Vasant (Spring).", ingredients: ["1 cup Basmati Rice", "3/4 cup Sugar", "Saffron strands", "Food color (yellow, optional)", "Ghee", "Cashews and Raisins", "Cloves and Cardamom"], steps: ["Soak rice for 30 mins. Boil it until 80% cooked.", "In a pan, heat ghee, add cloves, cardamom, and dry fruits.", "Add sugar and a little water to make a syrup. Add saffron.", "Gently mix in the rice. Cover and simmer until fully cooked."] }
        ],
        dress_guide: { colors: ["Yellow", "Mustard", "White"], description: "Yellow is absolutely mandatory. It signifies the brilliance of nature and the radiance of knowledge." },
        notification_templates: {
            discovery: "Vasant Panchami honors Saraswati, the goddess of knowledge, arts, and music. Place your books near her today.",
            countdown: "Vasant Panchami is in 7 days! Time to bring out the yellow ethnic wear.",
            eve: "Tomorrow is Vasant Panchami. Prepare your books, pens, and sweet yellow rice for the puja.",
            day_of: "Happy Vasant Panchami! 🌼 May Goddess Saraswati bless you with immense knowledge, wisdom, and creativity."
        }
    },
    "akshaya-tritiya-2026": {
        muhurat: { puja_time: "05:40 AM to 12:18 PM", type: "Auspicious Timing", description: "The word 'Akshaya' means never diminishing. It is the most auspicious day for new investments and gold." },
        ritual_steps: [
            { order: 1, title: "Snan & Dan", description: "Take an early bath and donate food, clothes, or water to the needy (very auspicious today).", items_needed: ["Donation items e.g., grains, earthen pitchers"] },
            { order: 2, title: "Purchase Gold", description: "Buying gold or property today brings everlasting prosperity.", items_needed: ["Gold Coin or Jewelry"] },
            { order: 3, title: "Vishnu & Lakshmi Puja", description: "Worship Lord Vishnu and Goddess Lakshmi with yellow flowers and Tulsi.", items_needed: ["Yellow Flowers", "Tulsi", "Sandalwood"] },
            { order: 4, title: "New Beginnings", description: "Start new ledgers (Khata), marriages, or business ventures.", items_needed: [] }
        ],
        recipes: [
            { name: "Puran Poli", description: "A sweet flatbread stuffed with lentil and jaggery, highly auspicious in Maharashtra/Gujarat.", ingredients: ["1 cup Chana Dal", "1 cup Jaggery", "Nutmeg & Cardamom", "Whole Wheat Flour", "Ghee"], steps: ["Boil chana dal until soft. Drain water.", "Cook dal with jaggery, nutmeg, and cardamom until thick (Puran).", "Stuff the Puran inside small wheat dough balls.", "Roll gently and cook on a griddle with plenty of ghee."] }
        ],
        dress_guide: { colors: ["Gold", "Yellow", "Red"], description: "Festive traditional wear recognizing the divine abundance of the day." },
        notification_templates: {
            discovery: "Akshaya means 'endless'. Any good deeds, charity, or investments made today yield eternal benefits.",
            countdown: "Akshaya Tritiya is in 7 days! A great time to plan your auspicious investments.",
            eve: "Tomorrow is Akshaya Tritiya. Prepare for charity and the Lakshmi-Narayana puja.",
            day_of: "Happy Akshaya Tritiya! ✨ May your life be filled with never-ending prosperity, wealth, and joy."
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
            // Check alias first
            const batchSlug = BATCH_2_EVENTS[event.slug]?.alias || event.slug;
            const batchData = BATCH_2_EVENTS[batchSlug];

            if (batchData && !batchData.alias) {
                event.muhurat = batchData.muhurat;
                event.ritual_steps = batchData.ritual_steps;
                event.recipes = batchData.recipes;
                event.dress_guide = batchData.dress_guide;
                event.notification_templates = batchData.notification_templates;

                updated++;
                console.log(`[Batch 2] Wrote Authentic Data -> ${event.slug}`);
            } else {
                skipped++;
            }
        }

        fs.writeFileSync(JSON_PATH, JSON.stringify(db, null, 2));
        console.log(`\nBatch 2 Complete! Updated ${updated} regional/minor festivals. Skipped ${skipped}.`);

    } catch (e) {
        console.error("Error:", e);
    }
}

run();
