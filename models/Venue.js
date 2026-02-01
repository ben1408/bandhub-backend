const mongoose = require('mongoose');

const venueSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    location: { type: String },
    capacity: { type: Number },
});

module.exports = mongoose.model('Venue', venueSchema);
