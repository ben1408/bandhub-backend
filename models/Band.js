const mongoose = require('mongoose');
const albumSchema = require('./Album');

const bandSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    genre: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    logoUrl: {
        type: String,
        required: true
    },
    bandPhotoUrl: {
        type: String
    },
    members: [{
        name: String,
        instrument: String
    }],
    albums: [albumSchema],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Band', bandSchema);
