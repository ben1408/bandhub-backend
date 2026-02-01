const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
    title: { type: String, required: true },
    duration: { type: Number }, // seconds
    listens: { type: Number, default: 0 },
});

module.exports = songSchema;
