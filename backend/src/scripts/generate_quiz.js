const Quiz = require('../models/Quiz');

/**
 * Generates quiz data.
 * The Flutter app expects a root object or list structure for quizzes.
 * We'll export {"version": 1, "quizzes": [...]} to match standard app parsers.
 */
async function generateQuizzes(lang) {
    // Usually quizzes would have localized fields (_en, _hi).
    // For now we just dump the active quizzes.
    const activeQuizzes = await Quiz.find({ isActive: true })
        .lean()
        .exec();

    return {
        version: "1.0",
        lang: lang,
        generated_at: new Date().toISOString(),
        quizzes: activeQuizzes.map(quiz => ({
            id: quiz._id.toString(),
            title: quiz.title,
            slug: quiz.slug,
            description: quiz.description,
            karma_reward: quiz.karmaReward,
            questions: quiz.questions,
            results: quiz.results
        }))
    };
}

module.exports = generateQuizzes;
