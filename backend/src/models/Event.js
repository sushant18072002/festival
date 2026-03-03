const mongoose = require('mongoose');
const { Schema } = mongoose;
const trackChanges = require('../middleware/trackChanges');

// 1. Root Translation Schema (Field-Mirroring)
// Used for top-level fields like Title/Description
const RootTranslation = {
  title: { type: String, trim: true },
  description: { type: String, trim: true }
};

// 2. Embedded Translation Schema (For List Items)
// Used inside 'historical_significance' items
const FactTranslation = {
  fact: { type: String, trim: true }
};

// Translation for ritual steps
const RitualStepTranslation = {
  title: { type: String, trim: true },
  description: { type: String, trim: true }
};

// Translation for recipes
const RecipeTranslation = {
  name: { type: String, trim: true },
  description: { type: String, trim: true }
};

const EventSchema = new Schema({
  slug: { type: String, unique: true, sparse: true },
  title: { type: String, required: true },
  description: String,
  wiki_link: String,
  lottie_overlay: { type: Schema.Types.ObjectId, ref: 'LottieOverlay' },
  notification_templates: [{ type: String }],
  category: { type: Schema.Types.ObjectId, ref: 'Category' },

  // Date Handling
  date: Date,
  dates: [{
    year: Number,
    date: Date
  }],

  priority: { type: Number, default: 0 },
  vibes: [{ type: Schema.Types.ObjectId, ref: 'Vibe' }],
  tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
  is_active: { type: Boolean, default: true },

  // Soft Delete
  is_deleted: { type: Boolean, default: false },
  deleted_at: Date,

  // --- Localization ---
  translations: {
    hi: RootTranslation,
    mr: RootTranslation,
    gu: RootTranslation,
    bn: RootTranslation,
    ta: RootTranslation,
    te: RootTranslation,
    kn: RootTranslation,
    ml: RootTranslation
  },

  // --- Historical Facts ---
  historical_significance: [{
    year: Number,
    fact: String,
    source: String,
    translations: {
      hi: FactTranslation,
      mr: FactTranslation,
      gu: FactTranslation,
      bn: FactTranslation,
      ta: FactTranslation,
      te: FactTranslation,
      kn: FactTranslation,
      ml: FactTranslation
    }
  }],

  // --- Ritual Guide (How to Celebrate) ---
  ritual_steps: [{
    order: { type: Number, required: true },
    title: { type: String, required: true },
    description: String,
    timing: String,                          // "Morning, before sunrise"
    items_needed: [{ type: String }],        // ["Diya", "Oil", "Cotton wicks", "Flowers"]
    translations: {
      hi: RitualStepTranslation,
      mr: RitualStepTranslation,
      gu: RitualStepTranslation,
      bn: RitualStepTranslation,
      ta: RitualStepTranslation,
      te: RitualStepTranslation,
      kn: RitualStepTranslation,
      ml: RitualStepTranslation
    }
  }],

  // --- Auspicious Timing ---
  muhurat: {
    puja_time: String,                       // "6:15 PM - 8:45 PM"
    type: String,                            // "Pradosh Kaal Lakshmi Puja"
    description: String,
    translations: {
      hi: { puja_time: String, type: String, description: String },
      mr: { puja_time: String, type: String, description: String }
    }
  },

  // --- Ambient Audio ---
  ambient_audio: {
    filename: String,                        // "diwali_aarti_bells.aac"
    s3_key: String,
    duration_seconds: Number,
    title: String                            // "Aarti Bells"
  },

  // --- Countdown ---
  countdown_config: {
    enabled: { type: Boolean, default: true },
    prep_days: { type: Number, default: 3 }, // Show "prep starts" X days before
    show_hours: { type: Boolean, default: true }
  },

  // --- Mantras ---
  mantras: [{
    type: Schema.Types.ObjectId,
    ref: 'Mantra'
  }],

  // --- Festival Recipes ---
  recipes: [{
    name: String,                            // "Gujiya"
    description: String,                     // "Traditional Holi sweet..."
    ingredients: [{ type: String }],
    steps: [{ type: String }],
    translations: {
      hi: RecipeTranslation,
      mr: RecipeTranslation,
      gu: RecipeTranslation,
      bn: RecipeTranslation,
      ta: RecipeTranslation,
      te: RecipeTranslation,
      kn: RecipeTranslation,
      ml: RecipeTranslation
    }
  }],

  // --- Dress Guide ---
  dress_guide: {
    description: String,                     // "Wear new clothes, preferably..."
    colors: [{ type: String }],              // Recommended colors
    translations: {
      hi: { description: String },
      mr: { description: String }
    }
  },

  // --- External Links ---
  playlist_links: [{
    platform: { type: String, enum: ['spotify', 'youtube', 'apple_music'] },
    url: String,
    title: String
  }]
}, { timestamps: true });

EventSchema.plugin(trackChanges);

module.exports = mongoose.models.Event || mongoose.model('Event', EventSchema);
