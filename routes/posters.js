const express = require('express');
const posterService = require('../services/posterService');
const auth = require('../middleware/auth');
const moderatorAuth = require('../middleware/moderatorAuth');

const router = express.Router();

// POST /api/posters/generate
router.post('/generate', moderatorAuth, async (req, res) => {
    try {
        // Extract show details from request body
        const { bandName, showTitle, venue, date, style } = req.body;

        // Validate required fields
        if (!bandName) {
            return res.status(400).json({ message: 'Band name is required' });
        }

        // Prepare show details object
        const showDetails = {
            bandName,
            showTitle,
            venue,
            date,
            style
        };

        // Generate poster using the service (pass user ID from token)
        const result = await posterService.generatePoster(showDetails, req.user.id);

        // Send the image back to frontend with poster info
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Disposition', 'inline; filename="poster.png"');
        res.setHeader('X-Poster-ID', result.posterId);
        res.send(result.imageBuffer);

    } catch (error) {
        console.error('Poster generation error:', error);
        res.status(500).json({
            message: 'Failed to generate poster',
            error: error.message
        });
    }
});

// GET /api/posters - Get user's poster history
router.get('/', moderatorAuth, async (req, res) => {
    try {
        const posters = await posterService.getUserPosters(req.user.id);
        res.json(posters);
    } catch (error) {
        console.error('Get posters error:', error);
        res.status(500).json({
            message: 'Failed to get posters',
            error: error.message
        });
    }
});

// GET /api/posters/:id - Get specific poster with image data
router.get('/:id', moderatorAuth, async (req, res) => {
    try {
        const poster = await posterService.getPosterById(req.params.id, req.user.id);
        res.json(poster);
    } catch (error) {
        console.error('Get poster error:', error);
        if (error.message === 'Poster not found') {
            return res.status(404).json({ message: 'Poster not found' });
        }
        res.status(500).json({
            message: 'Failed to get poster',
            error: error.message
        });
    }
});

router.delete('/:id', moderatorAuth, async (req, res) => {
    try {
        const result = await posterService.deletePoster(req.params.id, req.user.id);
        res.json(result);
    } catch (error) {
        console.error('Delete poster error:', error);
        if (error.message === 'Poster not found') {
            return res.status(404).json({ message: 'Poster not found' });
        }
        res.status(500).json({
            message: 'Failed to delete poster',
            error: error.message
        });
    }
});

module.exports = router;