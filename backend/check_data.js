require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./src/models/Category');
const Tag = require('./src/models/Tag');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/utsav_admin';

const checkData = async () => {
    try {
        // Check utsav_share
        const uriShare = process.env.MONGO_URI || 'mongodb://localhost:27017/utsav_share';
        const connShare = await mongoose.createConnection(uriShare).asPromise();
        console.log(`\n--- Checking ${uriShare} ---`);
        console.log('Categories:', await connShare.model('Category', Category.schema).countDocuments());
        console.log('Tags:', await connShare.model('Tag', Tag.schema).countDocuments());
        console.log('Events:', await connShare.model('Event', require('./src/models/Event').schema).countDocuments());
        await connShare.close();

        // Check utsav_admin
        const uriAdmin = 'mongodb://localhost:27017/utsav_admin';
        const connAdmin = await mongoose.createConnection(uriAdmin).asPromise();
        console.log(`\n--- Checking ${uriAdmin} ---`);
        console.log('Categories:', await connAdmin.model('Category', Category.schema).countDocuments());
        console.log('Tags:', await connAdmin.model('Tag', Tag.schema).countDocuments());
        console.log('Events:', await connAdmin.model('Event', require('./src/models/Event').schema).countDocuments());
        await connAdmin.close();

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkData();
