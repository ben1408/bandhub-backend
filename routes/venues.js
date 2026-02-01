const express = require('express');
const venueService = require('../services/venueService');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const venues = await venueService.getAllVenues();
        res.json(venues);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const venue = await venueService.getVenueById(req.params.id);
        if (!venue) return res.status(404).json({ message: 'Venue not found' });
        res.json(venue);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', async (req, res) => {
    try {
        const newVenue = await venueService.createVenue(req.body);
        res.status(201).json(newVenue);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const updatedVenue = await venueService.updateVenue(req.params.id, req.body);
        if (!updatedVenue) return res.status(404).json({ message: 'Venue not found' });
        res.json(updatedVenue);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const venue = await venueService.deleteVenue(req.params.id);
        if (!venue) return res.status(404).json({ message: 'Venue not found' });
        res.json({ message: 'Venue deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;