const mongoose = require('mongoose');

const ArticleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    band: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Band',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    author: {
        type: String,
        default: 'Music Insider'
    },
    publishDate: {
        type: Date,
        default: Date.now
    },
    tags: [{
        type: String,
        trim: true
    }],
    readTime: {
        type: Number, // in minutes
        default: 5
    }
}, {
    timestamps: true
});

// Index for efficient queries
ArticleSchema.index({ band: 1 });
ArticleSchema.index({ publishDate: -1 });
ArticleSchema.index({ tags: 1 });

module.exports = mongoose.model('Article', ArticleSchema);
