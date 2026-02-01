const mongoose = require('mongoose');

const posterSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bandName: { type: String, required: true },
    showTitle: { type: String },
    venue: { type: String },
    date: { type: String },
    style: { type: String },
    imageData: { type: String, required: true }, // Base64 encoded image
    prompt: { type: String }, // The AI prompt used
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Poster', posterSchema);