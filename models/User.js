const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['fan', 'moderator', 'admin'], default: 'fan' },
    subscriptions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Band' }],
});

module.exports = mongoose.model('User', userSchema);
