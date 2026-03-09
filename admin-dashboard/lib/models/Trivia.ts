import mongoose, { Schema } from 'mongoose';

const TriviaSchema = new Schema({
    question: { type: String, required: true },
    options: [{ type: String }],
    correctAnswerIndex: { type: Number, required: true },
    explanation: { type: String },
    karmaReward: { type: Number, default: 10 },
    tags: [{ type: String }],
    isActive: { type: Boolean, default: true },
    translations: { type: Schema.Types.Mixed, default: {} },
    is_deleted: { type: Boolean, default: false },
}, { timestamps: true, collection: 'trivia' });
export const Trivia = mongoose.models.Trivia || mongoose.model('Trivia', TriviaSchema);
