/* eslint-disable no-console */
require('dotenv').config();
const mongoose = require('mongoose');

const Band = require('./models/Band');
const Article = require('./models/Article');

// ---------- CONFIG ----------
const MONGODB_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/musicdb';

// Article templates and content generators
const ARTICLE_TEMPLATES = {
    'career_retrospective': {
        titles: [
            'The Evolution of {band}: From Underground to Stadium Rock',
            '{band}: A Journey Through Decades of Musical Innovation',
            'Breaking Down {band}\'s Most Influential Albums',
            'The Story Behind {band}\'s Rise to Fame'
        ],
        intro: [
            'Few bands have left as indelible a mark on the music world as {band}.',
            'When talking about influential rock bands, {band} inevitably comes up in conversation.',
            'The story of {band} is one of perseverance, innovation, and pure musical talent.',
            'From their humble beginnings to stadium-filling performances, {band} has redefined what it means to be a rock band.'
        ]
    },
    'recent_tour': {
        titles: [
            '{band} Announces Epic World Tour: What Fans Can Expect',
            'Live Review: {band} Delivers Unforgettable Performance',
            '{band}\'s Latest Tour Proves They\'re Still at the Top of Their Game',
            'Behind the Scenes: {band}\'s Preparation for Their Biggest Tour Yet'
        ],
        intro: [
            'Fans around the world are buzzing with excitement as {band} announces their latest tour.',
            'Last night\'s performance by {band} was nothing short of spectacular.',
            'The anticipation has been building for months, and {band} has finally revealed their tour plans.',
            'Concert-goers were treated to an incredible display of musical prowess when {band} took the stage.'
        ]
    },
    'musical_analysis': {
        titles: [
            'The Musical Genius of {band}: A Deep Dive into Their Sound',
            'How {band} Changed the Face of Modern Rock',
            'Analyzing {band}\'s Unique Approach to Songwriting',
            'The Technical Mastery Behind {band}\'s Greatest Hits'
        ],
        intro: [
            'What sets {band} apart from their contemporaries isn\'t just their popularity, but their innovative approach to music.',
            'The complexity and depth of {band}\'s musical arrangements have influenced countless artists.',
            'Music critics and fans alike have long praised {band} for their unique sonic identity.',
            'To understand the impact of {band}, one must look beyond the surface and examine their musical craftsmanship.'
        ]
    }
};

const CONTENT_PARAGRAPHS = {
    career: [
        'Formed in the early days of their respective careers, the band members brought together diverse musical backgrounds that would eventually forge their distinctive sound. Their chemistry was evident from the first jam session, with each member contributing their unique style and perspective to create something entirely new.',
        'The band\'s early years were marked by relentless touring and a dedication to perfecting their craft. Playing in small venues and clubs, they slowly built a devoted fanbase through word-of-mouth and the sheer power of their live performances. These formative experiences shaped not only their musical identity but also their connection with their audience.',
        'Their breakthrough came with the release of their debut album, which showcased their ability to blend technical proficiency with emotional depth. Critics praised the album\'s production quality and the band\'s mature songwriting, noting that this was clearly a group that had something important to say.',
        'As their popularity grew, so did their ambition. Subsequent albums saw the band experimenting with different styles and sounds, never content to simply repeat what had worked before. This willingness to evolve and take risks has been a hallmark of their career, keeping fans engaged and attracting new listeners with each release.'
    ],
    performance: [
        'Their live performances are legendary in the music industry, combining technical excellence with an energy that\'s impossible to replicate in studio recordings. The band\'s stage presence is commanding, with each member bringing their own charisma while maintaining perfect synchronization as a unit.',
        'Fans often describe their concerts as transformative experiences, with the band\'s ability to create an intimate atmosphere even in massive venues. The setlists are carefully crafted to take audiences on an emotional journey, mixing high-energy anthems with more introspective moments.',
        'The production value of their shows is consistently impressive, featuring state-of-the-art lighting and sound systems that enhance rather than overshadow the music itself. Every detail is meticulously planned to ensure that each performance is memorable for both longtime fans and newcomers alike.',
        'What truly sets their live shows apart is the genuine connection between the band and their audience. There\'s a palpable sense of mutual respect and appreciation that creates an electric atmosphere, making each concert feel like a shared celebration of music and community.'
    ],
    impact: [
        'The band\'s influence extends far beyond their own recordings, with countless musicians citing them as a major inspiration. Their innovative approach to songwriting and arrangement has become a template for aspiring artists looking to push the boundaries of their own creativity.',
        'Industry veterans often point to their work as a turning point in modern rock music, noting how they managed to maintain artistic integrity while achieving commercial success. This balance between accessibility and sophistication has become increasingly rare in today\'s music landscape.',
        'Their impact on music production techniques cannot be overstated, with many of their albums serving as benchmarks for sound engineering and mixing. The clarity and depth of their recordings continue to impress audiophiles and casual listeners alike, decades after their initial release.',
        'Beyond the technical aspects, their lyrics and themes have resonated with multiple generations of fans. Their ability to address universal human experiences while maintaining their own unique perspective has created a timeless quality that ensures their relevance for years to come.'
    ],
    future: [
        'Looking ahead, the band shows no signs of slowing down, with rumors of new material already generating excitement among fans. Their commitment to artistic growth suggests that their best work may still be ahead of them, a remarkable statement for a group with such an impressive catalog.',
        'The music industry continues to evolve rapidly, but this band has consistently demonstrated an ability to adapt while staying true to their core identity. Their upcoming projects promise to explore new territories while maintaining the qualities that have made them beloved by millions.',
        'As they enter this new phase of their career, the anticipation surrounding their future releases is palpable. Fans and critics alike are eager to see how they will continue to push boundaries and redefine what\'s possible in rock music.',
        'Their legacy is already secure, but their ongoing dedication to their craft suggests that the story of this remarkable band is far from over. Each new chapter continues to add depth to an already rich musical narrative that has captivated audiences worldwide.'
    ]
};

const TAGS_POOL = [
    'rock', 'metal', 'tour', 'album review', 'music industry', 'concert', 'band interview',
    'music analysis', 'rock history', 'live performance', 'studio recording', 'music production',
    'songwriting', 'guitar', 'vocals', 'drums', 'bass', 'legends', 'modern rock', 'alternative'
];

// Helper functions
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

function generateArticleTitle(bandName) {
    const template = rand(Object.values(ARTICLE_TEMPLATES));
    const title = rand(template.titles);
    return title.replace(/{band}/g, bandName);
}

function generateArticleContent(bandName) {
    const template = rand(Object.values(ARTICLE_TEMPLATES));
    const intro = rand(template.intro).replace(/{band}/g, bandName);

    // Select random paragraphs from different categories
    const paragraphs = [intro];

    // Add 4-6 content paragraphs from different categories
    const categories = Object.keys(CONTENT_PARAGRAPHS);
    const numParagraphs = randInt(4, 6);

    for (let i = 0; i < numParagraphs; i++) {
        const category = rand(categories);
        const paragraph = rand(CONTENT_PARAGRAPHS[category]);
        paragraphs.push(paragraph);
    }

    // Add a conclusion
    const conclusions = [
        `In conclusion, ${bandName} continues to be a driving force in the music industry, inspiring both fans and fellow musicians with their dedication to artistic excellence.`,
        `As ${bandName} moves forward in their career, one thing remains certain: their impact on rock music will be felt for generations to come.`,
        `The story of ${bandName} is far from over, and fans eagerly await the next chapter in their remarkable musical journey.`,
        `Whether you're a longtime fan or new to their music, ${bandName} represents everything that makes rock music compelling and enduring.`
    ];
    paragraphs.push(rand(conclusions));

    return paragraphs.join('\n\n');
}

function generateTags() {
    const numTags = randInt(3, 6);
    const selectedTags = new Set();

    while (selectedTags.size < numTags) {
        selectedTags.add(rand(TAGS_POOL));
    }

    return Array.from(selectedTags);
}

function calculateReadTime(content) {
    // Average reading speed is 200-250 words per minute
    const wordCount = content.split(' ').length;
    return Math.ceil(wordCount / 225);
}

function generatePublishDate() {
    // Generate dates from the last 2 years
    const now = new Date();
    const twoYearsAgo = new Date(now);
    twoYearsAgo.setFullYear(now.getFullYear() - 2);

    const randomTime = twoYearsAgo.getTime() + Math.random() * (now.getTime() - twoYearsAgo.getTime());
    return new Date(randomTime);
}

// --- MAIN ---
(async function main() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);

        console.log('Fetching all bands...');
        const bands = await Band.find({}).select('name bandPhotoUrl');
        console.log(`Found ${bands.length} bands`);

        console.log('Clearing existing articles...');
        await Article.deleteMany({});

        console.log('Generating articles...');
        const articles = [];

        for (const band of bands) {
            // Generate 1-3 articles per band
            const articlesCount = randInt(1, 3);
            console.log(`Generating ${articlesCount} article(s) for ${band.name}`);

            for (let i = 0; i < articlesCount; i++) {
                const title = generateArticleTitle(band.name);
                const content = generateArticleContent(band.name);
                const tags = generateTags();
                const readTime = calculateReadTime(content);
                const publishDate = generatePublishDate();

                // Use band photo or generate a random image
                const imageUrl = band.bandPhotoUrl || `https://picsum.photos/seed/${encodeURIComponent(band.name)}-article-${i}/800/400`;

                articles.push({
                    title,
                    band: band._id,
                    content,
                    imageUrl,
                    author: rand(['Music Insider', 'Rock Weekly', 'Metal Magazine', 'Concert Review', 'Music Critic']),
                    publishDate,
                    tags,
                    readTime
                });
            }
        }

        console.log(`Inserting ${articles.length} articles into database...`);
        await Article.insertMany(articles);

        console.log('✅ Article generation complete!');
        console.log(`Generated ${articles.length} articles for ${bands.length} bands`);

        // Display some statistics
        const avgArticlesPerBand = (articles.length / bands.length).toFixed(2);
        console.log(`Average articles per band: ${avgArticlesPerBand}`);

    } catch (err) {
        console.error('❌ Article generation failed:', err);
    } finally {
        await mongoose.disconnect();
    }
})();
