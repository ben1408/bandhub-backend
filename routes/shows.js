const express = require('express');
const showService = require('../services/showService');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// GET /api/shows - Get all shows
router.get('/', async (req, res) => {
    try {
        const shows = await showService.getAllShows();
        res.json(shows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/shows/upcoming - Get upcoming shows
router.get('/upcoming', async (req, res) => {
    try {
        const shows = await showService.getUpcomingShows();
        res.json(shows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/shows/band/:bandId - Get shows by band
router.get('/band/:bandId', async (req, res) => {
    try {
        const shows = await showService.getShowsByBand(req.params.bandId);
        res.json(shows);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// GET /api/shows/venue/:venueId - Get shows by venue
router.get('/venue/:venueId', async (req, res) => {
    try {
        const shows = await showService.getShowsByVenue(req.params.venueId);
        res.json(shows);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// GET /api/shows/:id - Get show by ID
router.get('/:id', async (req, res) => {
    try {
        const show = await showService.getShowById(req.params.id);
        res.json(show);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
});

// POST /api/shows - Create new show (admin only)
router.post('/', adminAuth, async (req, res) => {
    try {
        const show = await showService.createShow(req.body);
        res.status(201).json(show);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PUT /api/shows/:id - Update show (admin only)
router.put('/:id', adminAuth, async (req, res) => {
    try {
        const show = await showService.updateShow(req.params.id, req.body);
        res.json(show);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE /api/shows/:id - Delete show (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
    try {
        await showService.deleteShow(req.params.id);
        res.json({ message: 'Show deleted successfully' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
