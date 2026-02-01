/* eslint-disable no-console */
require('dotenv').config();
const mongoose = require('mongoose');

const Band = require('./models/Band');
const Venue = require('./models/Venue');
const Show = require('./models/Show');

// ---------- CONFIG ----------
const MONGODB_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/musicdb';
const BAND_NAMES = [
    'Metallica', 'Iron Maiden', 'Megadeth', 'Pantera', 'Slipknot', 'Tool', 'Korn', 'Deftones',
    'Bring Me The Horizon', 'Linkin Park', 'System of a Down', 'Rage Against the Machine',
    'Muse', 'Radiohead', 'Coldplay', 'U2', 'The Killers', 'Arctic Monkeys', 'Foo Fighters',
    'Pearl Jam', 'Red Hot Chili Peppers', 'Green Day', 'Blink-182', 'Sum 41', 'Nirvana',
    'Queens of the Stone Age', 'Nine Inch Nails', 'Rammstein', 'Imagine Dragons',
    'Thirty Seconds to Mars', 'Paramore', 'My Chemical Romance', 'Evanescence',
    'The Strokes', 'Oasis', 'Blur', 'The Smashing Pumpkins', 'Weezer', 'The 1975',
    'Tame Impala', 'Kings of Leon', 'Fall Out Boy', 'The Offspring', 'Avenged Sevenfold',
    'Parkway Drive', 'Architects', 'Gojira', 'Opeth', 'Lamb of God', 'A Day to Remember'
];

const VENUES = [
    { name: 'Madison Square Garden', location: 'New York, USA', capacity: 20000 },
    { name: 'O2 Arena', location: 'London, UK', capacity: 20000 },
    { name: 'Wembley Stadium', location: 'London, UK', capacity: 90000 },
    { name: 'Red Rocks Amphitheatre', location: 'Morrison, USA', capacity: 9525 },
    { name: 'Royal Albert Hall', location: 'London, UK', capacity: 5272 },
    { name: 'Accor Arena', location: 'Paris, France', capacity: 20000 },
    { name: 'Mercedes-Benz Arena', location: 'Berlin, Germany', capacity: 17000 },
    { name: 'Palau Sant Jordi', location: 'Barcelona, Spain', capacity: 17000 },
    { name: '3Arena', location: 'Dublin, Ireland', capacity: 13000 },
    { name: 'Barby Club', location: 'Tel Aviv, Israel', capacity: 1000 },
    { name: 'Hangar 11', location: 'Tel Aviv, Israel', capacity: 3500 },
    { name: 'Menora Mivtachim Arena', location: 'Tel Aviv, Israel', capacity: 11060 },
    { name: 'Amphitheatre Caesarea', location: 'Caesarea, Israel', capacity: 3500 }
];

const FIRST_NAMES = ['Alex', 'Ben', 'Noa', 'Liam', 'Maya', 'Daniel', 'Nadav', 'Oren', 'Omri', 'Michael', 'Dana', 'Shaked', 'Eitan', 'Coral', 'Lior', 'Shir', 'Tal', 'Yarden', 'Itay', 'Yuval', 'Noga', 'Roni', 'Amit', 'Bar'];
const LAST_NAMES = ['Levi', 'Cohen', 'Mizrahi', 'Netzer', 'Dragilev', 'Baron', 'Knafo', 'Gal', 'Rosen', 'Shapiro', 'Ben-Ami', 'Hadad', 'Peretz', 'Davidson', 'Mor', 'Katz', 'Aviv', 'Shilon', 'Tzur', 'Amir', 'Shaul'];
const INSTRUMENTS = ['Vocals', 'Guitar', 'Bass', 'Drums', 'Keys', 'Synth'];

// Helpers
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const uniqueSlug = (txt) => txt.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// Fallback placeholders
const fallbackLogo = (bandName) => `https://picsum.photos/seed/${encodeURIComponent(uniqueSlug(bandName))}/400/200`;
const fallbackPhoto = (bandName) => `https://picsum.photos/seed/${encodeURIComponent(uniqueSlug(bandName))}/800/600`;

// Fetch logo + band photo from TheAudioDB
async function fetchBandImages(bandName) {
    try {
        const url = `https://theaudiodb.com/api/v1/json/2/search.php?s=${encodeURIComponent(bandName)}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data && data.artists && data.artists[0]) {
            const artist = data.artists[0];
            return {
                logo: artist.strArtistLogo || fallbackLogo(bandName),
                photo: artist.strArtistThumb || fallbackPhoto(bandName)
            };
        }
    } catch (err) {
        console.warn(`Image fetch failed for ${bandName}:`, err.message);
    }
    return { logo: fallbackLogo(bandName), photo: fallbackPhoto(bandName) };
}

// Generate band members
const makeMembers = () => {
    const count = randInt(3, 6);
    const set = new Set();
    const members = [];
    while (members.length < count) {
        const full = `${rand(FIRST_NAMES)} ${rand(LAST_NAMES)}`;
        if (set.has(full)) continue;
        set.add(full);
        members.push({ name: full, instrument: rand(INSTRUMENTS) });
    }
    if (!members.some(m => m.instrument === 'Vocals')) members[0].instrument = 'Vocals';
    if (!members.some(m => m.instrument === 'Guitar')) members[1 % members.length].instrument = 'Guitar';
    if (!members.some(m => m.instrument === 'Bass')) members[2 % members.length].instrument = 'Bass';
    if (!members.some(m => m.instrument === 'Drums')) members[3 % members.length].instrument = 'Drums';
    return members;
};

// Word pools for album & song titles
const ALBUM_WORDS = [
    'Echoes', 'Shadows', 'Dreams', 'Chaos', 'Horizons', 'Fragments', 'Reflections',
    'Oblivion', 'Whispers', 'Storms', 'Legends', 'Ashes', 'Myth', 'Phantoms', 'Pulse',
    'Voyage', 'Eclipse', 'Origins', 'Collapse', 'Awakening', 'Infinity'
];
const SONG_WORDS = [
    'Fire', 'Glass', 'Moon', 'River', 'Night', 'Silence', 'Fall', 'Rise', 'Chains', 'Sky',
    'Blood', 'Light', 'Heart', 'Stone', 'Ash', 'Wings', 'Ocean', 'Bones', 'Storm', 'Dream'
];

function randomTitle(pool, count = 2) {
    let words = [];
    for (let i = 0; i < count; i++) words.push(rand(pool));
    return words.join(' ');
}

// Generate albums & songs with natural names
const makeAlbums = (bandName) => {
    const albumsCount = randInt(1, 3);
    const albums = [];
    const startYear = randInt(2000, 2022);

    for (let i = 0; i < albumsCount; i++) {
        const year = startYear + i;
        const title = `${randomTitle(ALBUM_WORDS)} ${rand(['I', 'II', 'III', 'IV', 'V'])}`;
        const tracks = randInt(6, 12);

        const songs = Array.from({ length: tracks }, () => ({
            title: randomTitle(SONG_WORDS, randInt(1, 3)),
            duration: randInt(120, 360),
            listens: randInt(1000, 2000000),
        }));

        albums.push({
            title,
            releaseDate: new Date(`${year}-${randInt(1, 12)}-${randInt(1, 28)}`),
            coverUrl: `https://picsum.photos/seed/${encodeURIComponent(uniqueSlug(title))}/600/600`,
            songs
        });
    }
    return albums;
};

const albumSongsToSetlist = (albums) => {
    if (!albums || albums.length === 0) {
        console.log('    Warning: Band has no albums');
        return ['Generic Song 1', 'Generic Song 2', 'Generic Song 3']; // Fallback songs
    }

    const titles = albums.flatMap(a => a.songs ? a.songs.map(s => s.title) : []);
    if (titles.length === 0) {
        console.log('    Warning: Band has albums but no songs');
        return ['Generic Song 1', 'Generic Song 2', 'Generic Song 3']; // Fallback songs
    }

    const n = Math.min(randInt(8, 15), titles.length);
    const set = new Set();
    let attempts = 0;
    while (set.size < n && attempts < 100) { // Prevent infinite loop with max attempts
        set.add(rand(titles));
        attempts++;
    }
    return Array.from(set);
};

// --- MAIN ---
(async function main() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);

        console.log('Purging Bands, Venues, Shows...');
        await Promise.all([
            Band.deleteMany({}),
            Venue.deleteMany({}),
            Show.deleteMany({})
        ]);

        console.log('Seeding Venues...');
        const venues = await Venue.insertMany(VENUES);

        console.log('Creating Bands...');
        const bands = [];
        for (const name of BAND_NAMES) {
            const { logo, photo } = await fetchBandImages(name);
            const albums = makeAlbums(name);
            bands.push({
                name,
                genre: 'Rock',
                description: `${name} are a world-renowned band.`,
                logoUrl: logo,
                bandPhotoUrl: photo,
                members: makeMembers(),
                albums
            });
        }
        const bandDocs = await Band.insertMany(bands);

        console.log('Creating Shows...');
        const shows = [];
        const today = new Date();
        console.log(`Processing ${bandDocs.length} bands for shows...`);

        for (let bandIndex = 0; bandIndex < bandDocs.length; bandIndex++) {
            const band = bandDocs[bandIndex];
            console.log(`Creating shows for band ${bandIndex + 1}/${bandDocs.length}: ${band.name}`);

            const showsCount = randInt(1, 3);
            for (let i = 0; i < showsCount; i++) {
                const venue = rand(venues);
                const price = rand([50, 100, 150, 200, 250, 300]);
                const maxSold = Math.min(venue.capacity, 10000);
                const minSold = Math.min(100, maxSold);
                const ticketsSold = randInt(minSold, maxSold);
                const date = new Date(today);
                date.setDate(date.getDate() + randInt(-270, 270));

                const setlist = albumSongsToSetlist(band.albums);
                console.log(`  Show ${i + 1}: ${venue.name}, setlist length: ${setlist.length}`);

                shows.push({
                    band: band._id,
                    venue: venue._id,
                    date,
                    setlist,
                    ticketsPrice: price,
                    ticketsSold
                });
            }
        }

        console.log(`Inserting ${shows.length} shows into database...`);
        await Show.insertMany(shows);

        console.log('✅ Seeding complete!');
        console.log(`Inserted: ${bandDocs.length} bands, ${venues.length} venues, ${shows.length} shows`);
    } catch (err) {
        console.error('❌ Seed failed:', err);
    } finally {
        await mongoose.disconnect();
    }
})();
