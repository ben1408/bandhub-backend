const express = require('express');
const analyticsService = require('../services/analyticsService');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

router.get('/', adminAuth, async (req, res) => {
    try {
        const analytics = await analyticsService.getAnalytics();
        res.json(analytics);
    } catch (err) {
        console.error('Error fetching analytics:', err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
