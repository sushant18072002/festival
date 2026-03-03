const Trivia = require('../models/Trivia');

/**
 * Generates trivia data.
 * Exports a list of daily trivia challenges.
 */
async function generateTrivia(lang) {
    const activeTrivia = await Trivia.find({ isActive: true })
        .sort({ _id: -1 })
        .lean()
        .exec();

    return {
        version: "1.0",
        lang: lang,
        generated_at: new Date().toISOString(),
        trivia: activeTrivia.map(t => ({
            id: t._id.toString(),
            question: t.question,
            options: t.options,
            correct_answer_index: t.correctAnswerIndex,
            karma_reward: t.karmaReward,
            tags: t.tags
        }))
    };
}

module.exports = generateTrivia;
