const mongoose = require('mongoose');
const songSchema = require('./Song');

const albumSchema = new mongoose.Schema({
    title: { type: String, required: true },
    releaseDate: { type: Date },
    coverUrl: { type: String },
    songs: [songSchema],
});

module.exports = albumSchema;
