/* eslint-disable no-console */
/**
 * Migration script to copy data from local MongoDB to MongoDB Atlas
 * This will preserve all your existing data
 */
require('dotenv').config();
const mongoose = require('mongoose');

// Import all your models
const Band = require('./models/Band');
const Venue = require('./models/Venue');
const Show = require('./models/Show');
const User = require('./models/User');
const Article = require('./models/Article');
const Poster = require('./models/Poster');

// Connection URIs
const LOCAL_URI = 'mongodb://localhost:27017/bandhub';
const ATLAS_URI = process.env.MONGO_URI;

async function migrateData() {
    console.log('🚀 Starting migration from local MongoDB to Atlas...\n');

    // Connect to local database
    console.log('📡 Connecting to local MongoDB...');
    const localConnection = await mongoose.createConnection(LOCAL_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    console.log('✅ Connected to local MongoDB\n');

    // Connect to Atlas
    console.log('📡 Connecting to MongoDB Atlas...');
    const atlasConnection = await mongoose.createConnection(ATLAS_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB Atlas\n');

    // Get models for both connections
    const LocalBand = localConnection.model('Band', Band.schema);
    const LocalVenue = localConnection.model('Venue', Venue.schema);
    const LocalShow = localConnection.model('Show', Show.schema);
    const LocalUser = localConnection.model('User', User.schema);
    const LocalArticle = localConnection.model('Article', Article.schema);
    const LocalPoster = localConnection.model('Poster', Poster.schema);

    const AtlasBand = atlasConnection.model('Band', Band.schema);
    const AtlasVenue = atlasConnection.model('Venue', Venue.schema);
    const AtlasShow = atlasConnection.model('Show', Show.schema);
    const AtlasUser = atlasConnection.model('User', User.schema);
    const AtlasArticle = atlasConnection.model('Article', Article.schema);
    const AtlasPoster = atlasConnection.model('Poster', Poster.schema);

    try {
        // Migrate Users
        console.log('👥 Migrating Users...');
        const localUsers = await LocalUser.find({});
        if (localUsers.length > 0) {
            await AtlasUser.deleteMany({}); // Clear existing data
            await AtlasUser.insertMany(localUsers);
            console.log(`✅ Migrated ${localUsers.length} users\n`);
        } else {
            console.log('⚠️  No users found in local database\n');
        }

        // Migrate Venues
        console.log('🏟️  Migrating Venues...');
        const localVenues = await LocalVenue.find({});
        if (localVenues.length > 0) {
            await AtlasVenue.deleteMany({});
            await AtlasVenue.insertMany(localVenues);
            console.log(`✅ Migrated ${localVenues.length} venues\n`);
        } else {
            console.log('⚠️  No venues found in local database\n');
        }

        // Migrate Bands
        console.log('🎸 Migrating Bands...');
        const localBands = await LocalBand.find({});
        if (localBands.length > 0) {
            await AtlasBand.deleteMany({});
            await AtlasBand.insertMany(localBands);
            console.log(`✅ Migrated ${localBands.length} bands\n`);
        } else {
            console.log('⚠️  No bands found in local database\n');
        }

        // Migrate Shows
        console.log('🎤 Migrating Shows...');
        const localShows = await LocalShow.find({});
        if (localShows.length > 0) {
            await AtlasShow.deleteMany({});
            await AtlasShow.insertMany(localShows);
            console.log(`✅ Migrated ${localShows.length} shows\n`);
        } else {
            console.log('⚠️  No shows found in local database\n');
        }

        // Migrate Articles
        console.log('📰 Migrating Articles...');
        const localArticles = await LocalArticle.find({});
        if (localArticles.length > 0) {
            await AtlasArticle.deleteMany({});
            await AtlasArticle.insertMany(localArticles);
            console.log(`✅ Migrated ${localArticles.length} articles\n`);
        } else {
            console.log('⚠️  No articles found in local database\n');
        }

        // Migrate Posters
        console.log('🖼️  Migrating Posters...');
        const localPosters = await LocalPoster.find({});
        if (localPosters.length > 0) {
            await AtlasPoster.deleteMany({});
            await AtlasPoster.insertMany(localPosters);
            console.log(`✅ Migrated ${localPosters.length} posters\n`);
        } else {
            console.log('⚠️  No posters found in local database\n');
        }

        console.log('🎉 Migration completed successfully!');
        console.log('\n📊 Summary:');
        console.log(`   Users: ${localUsers.length}`);
        console.log(`   Venues: ${localVenues.length}`);
        console.log(`   Bands: ${localBands.length}`);
        console.log(`   Shows: ${localShows.length}`);
        console.log(`   Articles: ${localArticles.length}`);
        console.log(`   Posters: ${localPosters.length}`);

    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        await localConnection.close();
        await atlasConnection.close();
        console.log('\n🔌 Connections closed');
    }
}

// Run migration
migrateData()
    .then(() => {
        console.log('\n✨ All done! Your data is now on MongoDB Atlas.');
        process.exit(0);
    })
    .catch((err) => {
        console.error('\n💥 Migration error:', err);
        process.exit(1);
    });
