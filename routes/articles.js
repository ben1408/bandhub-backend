const express = require('express');
const router = express.Router();
const Article = require('../models/Article');
const Band = require('../models/Band');

// GET /api/articles - Get all articles with pagination
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const articles = await Article.find()
            .populate('band', 'name logoUrl')
            .sort({ publishDate: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Article.countDocuments();

        res.json({
            articles,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalArticles: total,
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/articles/search - Search articles
router.get('/search', async (req, res) => {
    try {
        const { q, tag, author } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        let query = {};

        if (q) {
            query.$or = [
                { title: { $regex: q, $options: 'i' } },
                { content: { $regex: q, $options: 'i' } }
            ];
        }

        if (tag) {
            query.tags = { $in: [tag] };
        }

        if (author) {
            query.author = { $regex: author, $options: 'i' };
        }

        const articles = await Article.find(query)
            .populate('band', 'name logoUrl')
            .sort({ publishDate: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Article.countDocuments(query);

        res.json({
            articles,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalArticles: total,
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/articles/featured - Get featured articles (latest 5)
router.get('/featured', async (req, res) => {
    try {
        const articles = await Article.find()
            .populate('band', 'name logoUrl')
            .sort({ publishDate: -1 })
            .limit(5);

        res.json(articles);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/articles/tags - Get all unique tags
router.get('/tags', async (req, res) => {
    try {
        const tags = await Article.distinct('tags');
        res.json(tags.sort());
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/articles/band/:bandId - Get articles for specific band
router.get('/band/:bandId', async (req, res) => {
    try {
        const articles = await Article.find({ band: req.params.bandId })
            .populate('band', 'name logoUrl')
            .sort({ publishDate: -1 });

        res.json(articles);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/articles/:id - Get single article
router.get('/:id', async (req, res) => {
    try {
        const article = await Article.findById(req.params.id)
            .populate('band', 'name logoUrl genre description');

        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }

        res.json(article);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
