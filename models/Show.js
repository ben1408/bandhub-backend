const mongoose = require('mongoose');

const showSchema = new mongoose.Schema({
    band: { type: mongoose.Schema.Types.ObjectId, ref: 'Band', required: true },
    venue: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue', required: true },
    date: { type: Date, required: true },
    setlist: [{ type: String }], // song titles or IDs
    ticketsPrice: { type: Number, required: true },
    ticketsSold: { type: Number, default: 0 },

});

module.exports = mongoose.model('Show', showSchema);
