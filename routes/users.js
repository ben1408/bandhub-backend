const express = require('express');
const userService = require('../services/userService');
// const auth = require('../middleware/auth');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// POST /api/users/register - Register a new user
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const result = await userService.registerUser(username, password);
        res.status(201).json(result);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const users = await userService.getAllUsers();
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const result = await userService.loginUser(username, password);
        res.json(result);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// GET /api/users/validate-token - Validate JWT token
router.get('/validate-token', auth, async (req, res) => {
    try {
        // If middleware passes, token is valid
        res.json({ valid: true, user: { id: req.user.id, role: req.user.role } });
    } catch (err) {
        res.status(401).json({ valid: false, message: 'Invalid token' });
    }
});

// PUT /api/users/update-username - Update username (requires authentication)
router.put('/update-username', auth, async (req, res) => {
    try {
        const { username } = req.body;
        if (!username) {
            return res.status(400).json({ message: 'Username is required' });
        }

        const result = await userService.updateUsername(req.user.id, username);
        res.json(result);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PUT /api/users/update-password - Update password (requires authentication)
router.put('/update-password', auth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current password and new password are required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters long' });
        }

        const result = await userService.updatePassword(req.user.id, currentPassword, newPassword);
        res.json(result);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PUT /api/users/update-role/:userId - Update user role (admin only)
router.put('/update-role/:userId', adminAuth, async (req, res) => {
    try {
        const { role } = req.body;
        const { userId } = req.params;

        if (!role) {
            return res.status(400).json({ message: 'Role is required' });
        }

        const result = await userService.updateUserRole(userId, role);
        res.json(result);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const updatedUser = await userService.updateUser(req.params.id, req.body);
        if (!updatedUser) return res.status(404).json({ message: 'User not found' });
        res.json(updatedUser);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const user = await userService.deleteUser(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;

