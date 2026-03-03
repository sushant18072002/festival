const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const quizOptionSchema = new Schema({
    label: { type: String, required: true },
    // scores map e.g. { "diwali": 3, "holi": 1 }
    scores: { type: Map, of: Number, required: true }
}, { _id: false });

const quizQuestionSchema = new Schema({
    question: { type: String, required: true },
    emoji: { type: String, required: true },
    options: [quizOptionSchema]
}, { _id: false });

const festivalResultSchema = new Schema({
    code: { type: String, required: true },
    name: { type: String, required: true },
    emoji: { type: String, required: true },
    description: { type: String, required: true },
    primaryColor: { type: String, required: true }, // Hex code: e.g., "0xFFFFB347"
    secondaryColor: { type: String, required: true }, // Hex code
    personality: { type: String, required: true }
}, { _id: false });

const quizSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String
    },
    karmaReward: {
        type: Number,
        default: 25
    },
    questions: [quizQuestionSchema],
    results: [festivalResultSchema], // The master list of outcomes for this quiz
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    collection: 'quizzes'
});

module.exports = mongoose.models.Quiz || mongoose.model('Quiz', quizSchema);
