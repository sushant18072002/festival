let mongooseInstance;

try {
    // Resolve mongoose relative to the entry script (e.g., backend or admin)
    // This guarantees we share the EXACT same Mongoose singleton as the host application!
    if (require.main && typeof require.main.require === 'function') {
        mongooseInstance = require.main.require('mongoose');
    } else {
        mongooseInstance = require('mongoose');
    }
} catch (e) {
    console.error("Mongoose not found in host application's node_modules.");
    throw e;
}

module.exports = mongooseInstance;
