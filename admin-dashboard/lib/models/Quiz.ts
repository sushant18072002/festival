import mongoose, { Schema } from 'mongoose';

const QuizOptionSchema = new Schema({
    label: { type: String, required: true },
    scores: { type: Map, of: Number, default: {} },
}, { _id: false });

const QuizQuestionSchema = new Schema({
    question: { type: String, required: true },
    emoji: { type: String, default: '❓' },
    options: [QuizOptionSchema],
}, { _id: false });

const QuizResultSchema = new Schema({
    code: { type: String, required: true },
    name: { type: String, required: true },
    emoji: { type: String, default: '🎯' },
    personality: { type: String },
    description: { type: String },
    primaryColor: { type: String, default: '0xFFFF6B35' },
    secondaryColor: { type: String, default: '0xFFFF9F1C' },
}, { _id: false });

const QuizSchema = new Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    karmaReward: { type: Number, default: 25 },
    isActive: { type: Boolean, default: true },
    translations: { type: Schema.Types.Mixed, default: {} },
    questions: [QuizQuestionSchema],
    results: [QuizResultSchema],
}, { timestamps: true, collection: 'quizzes' });
export const Quiz = mongoose.models.Quiz || mongoose.model('Quiz', QuizSchema);
