const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

const checkConfig = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/utsav_share');
        console.log('Connected to MongoDB');

        const DeployConfig = require('../../models/DeployConfig');
        const config = await DeployConfig.findOne({ key: 'server_deployment' });

        console.log('DeployConfig found:', config);

        if (!config) {
            console.log('No config found with key "server_deployment"');
        } else {
            console.log('Environment:', config.environment);
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

checkConfig();
