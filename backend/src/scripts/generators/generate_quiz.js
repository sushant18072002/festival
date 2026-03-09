const Quiz = require('../../models/Quiz');

/**
 * Generates quiz data with i18n translation support.
 * Exports active personality quizzes localized for the given language.
 */
async function generateQuizzes(lang) {
    const activeQuizzes = await Quiz.find({
        isActive: true,
        is_deleted: { $ne: true }
    })
        .lean()
        .exec();

    const getLocalized = (quiz, field, lang) => {
        if (lang === 'en') return quiz[field] || '';
        const tr = quiz.translations;
        if (tr && tr[lang] && tr[lang][field]) return tr[lang][field];
        return quiz[field] || '';
    };

    return {
        version: "1.1",
        lang: lang,
        generated_at: new Date().toISOString(),
        quizzes: activeQuizzes.map(quiz => ({
            id: quiz._id.toString(),
            title: getLocalized(quiz, 'title', lang),
            slug: quiz.slug,
            description: getLocalized(quiz, 'description', lang),
            karma_reward: quiz.karmaReward,
            is_active: quiz.isActive,
            questions: (quiz.questions || []).map(q => ({
                question: q.question,
                emoji: q.emoji || '',
                options: (q.options || []).map(opt => ({
                    label: opt.label,
                    scores: opt.scores || {}
                }))
            })),
            results: (quiz.results || []).map(r => ({
                code: r.code,
                name: r.name,
                personality: r.personality,
                description: r.description,
                emoji: r.emoji || '',
                primary_color: r.primaryColor || '#8B5CF6',
                secondary_color: r.secondaryColor || '#A78BFA'
            }))
        }))
    };
}

module.exports = generateQuizzes;
