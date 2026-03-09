const generateVersionMemory = async () => {
    const versionData = {
        version: Date.now(),
        generatedAt: new Date().toISOString()
    };
    return {
        'version/version.json': JSON.stringify(versionData, null, 2)
    };
};

module.exports = { generateVersionMemory };
