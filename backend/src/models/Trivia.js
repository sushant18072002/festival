const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const triviaSchema = new Schema({
    question: {
        type: String,
        required: true,
    },
    options: [{
        type: String,
        required: true,
    }],
    correctAnswerIndex: {
        type: Number,
        required: true,
        min: 0
    },
    karmaReward: {
        type: Number,
        required: true,
        default: 10
    },
    isActive: {
        type: Boolean,
        default: true
    },
    tags: [{
        type: String
    }]
}, {
    timestamps: true,
    collection: 'trivia'
});

// Avoid OverwriteModelError
module.exports = mongoose.models.Trivia || mongoose.model('Trivia', triviaSchema);
