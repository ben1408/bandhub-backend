const express = require('express');
const bandService = require('../services/bandService');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const bands = await bandService.getAllBands();
        res.json(bands);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const band = await bandService.getBandById(req.params.id);
        if (!band) return res.status(404).json({ message: 'Band not found' });
        res.json(band);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/', adminAuth, async (req, res) => {
    try {
        const newBand = await bandService.createBand(req.body);
        res.status(201).json(newBand);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const updatedBand = await bandService.updateBand(req.params.id, req.body);
        if (!updatedBand) return res.status(404).json({ message: 'Band not found' });
        res.json(updatedBand);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.delete('/:id', adminAuth, async (req, res) => {
    try {
        const band = await bandService.deleteBand(req.params.id);
        if (!band) return res.status(404).json({ message: 'Band not found' });
        res.json({ message: 'Band deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/:id/albums', async (req, res) => {
    try {
        const albums = await bandService.getAlbums(req.params.id);
        if (!albums) return res.status(404).json({ message: 'Band not found' });
        res.json(albums);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/:id/albums/:albumId', async (req, res) => {
    try {
        const album = await bandService.getAlbum(req.params.id, req.params.albumId);
        if (!album) return res.status(404).json({ message: 'Album not found' });
        res.json(album);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/:id/albums', adminAuth, async (req, res) => {
    try {
        const album = await bandService.addAlbum(req.params.id, req.body);
        if (!album) return res.status(404).json({ message: 'Band not found' });
        res.status(201).json(album);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.put('/:id/albums/:albumId', adminAuth, async (req, res) => {
    try {
        const album = await bandService.editAlbum(req.params.id, req.params.albumId, req.body);
        if (!album) return res.status(404).json({ message: 'Album not found' });
        res.json(album);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;


