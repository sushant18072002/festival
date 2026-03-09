const Trivia = require('../../models/Trivia');

/**
 * Generates trivia data with i18n translation support.
 * Exports a list of daily trivia challenges localized for the given language.
 */
async function generateTrivia(lang) {
    const activeTrivia = await Trivia.find({
        isActive: true,
        is_deleted: { $ne: true }
    })
        .sort({ _id: -1 })
        .lean()
        .exec();

    const getLocalized = (trivia, field, lang) => {
        if (lang === 'en') return trivia[field];
        const tr = trivia.translations;
        if (tr && tr[lang] && tr[lang][field]) return tr[lang][field];
        return trivia[field]; // Fallback to English
    };

    const getLocalizedOptions = (trivia, lang) => {
        if (lang === 'en') return trivia.options;
        const tr = trivia.translations;
        if (tr && tr[lang] && Array.isArray(tr[lang].options)) return tr[lang].options;
        return trivia.options;
    };

    return {
        version: "1.1",
        lang: lang,
        generated_at: new Date().toISOString(),
        trivia: activeTrivia.map(t => ({
            id: t._id.toString(),
            question: getLocalized(t, 'question', lang),
            options: getLocalizedOptions(t, lang),
            correct_answer_index: t.correctAnswerIndex,
            karma_reward: t.karmaReward,
            tags: t.tags || []
        }))
    };
}

module.exports = generateTrivia;
