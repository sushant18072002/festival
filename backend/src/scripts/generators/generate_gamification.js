const GamificationConfig = require('../../models/GamificationConfig');

async function generateGamification(lang) {
    // Find the latest active v1 config
    const config = await GamificationConfig.findOne({ version: 1, isActive: true })
        .lean()
        .exec();

    if (!config) {
        return {
            version: "1.0",
            lang: lang,
            generated_at: new Date().toISOString(),
            avatar_tiers: [],
            trophies: []
        };
    }

    return {
        version: "1.0",
        lang: lang,
        generated_at: new Date().toISOString(),
        avatar_tiers: config.avatarTiers.map(t => ({
            name: t.name,
            base_karma: t.baseKarma,
            paths: t.paths
        })),
        trophies: config.trophies.map(t => ({
            name: t.name,
            icon: t.icon,
            description: t.description,
            unlock_rule_type: t.unlockRuleType,
            unlock_threshold: t.unlockThreshold
        }))
    };
}

module.exports = generateGamification;
