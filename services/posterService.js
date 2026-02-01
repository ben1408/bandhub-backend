const OpenAI = require('openai');
const Poster = require('../models/Poster');
require('dotenv').config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

class PosterService {
    constructor() {
        this.openai = new OpenAI({
            apiKey: OPENAI_API_KEY,
        });
    }

    // Main function to generate poster
    async generatePoster(showDetails, userId) {
        // Build the AI prompt from show details
        const prompt = this.buildPrompt(showDetails);

        // Call OpenAI DALL-E 3 API
        const imageBuffer = await this.callOpenAIAPI(prompt);

        // Save to database
        const savedPoster = await this.savePosterToDatabase(showDetails, prompt, imageBuffer, userId);

        return {
            imageBuffer,
            posterId: savedPoster._id,
            posterData: savedPoster
        };
    }

    // Save poster to database
    async savePosterToDatabase(showDetails, prompt, imageBuffer, userId) {
        try {
            // Convert image buffer to base64
            const imageBase64 = `data:image/png;base64,${imageBuffer.toString('base64')}`;

            // Create new poster document
            const poster = new Poster({
                userId,
                bandName: showDetails.bandName,
                showTitle: showDetails.showTitle,
                venue: showDetails.venue,
                date: showDetails.date,
                style: showDetails.style,
                imageData: imageBase64,
                prompt
            });

            // Save to database
            const savedPoster = await poster.save();
            return savedPoster;
        } catch (error) {
            throw new Error(`Failed to save poster to database: ${error.message}`);
        }
    }

    // Get user's posters
    async getUserPosters(userId) {
        try {
            const posters = await Poster.find({ userId })
                .sort({ createdAt: -1 }) // Most recent first
                .select('-imageData'); // Exclude image data for list view (for performance)

            return posters;
        } catch (error) {
            throw new Error(`Failed to get user posters: ${error.message}`);
        }
    }

    // Get specific poster with image data
    async getPosterById(posterId, userId) {
        try {
            const poster = await Poster.findOne({
                _id: posterId,
                userId // Ensure user can only access their own posters
            });

            if (!poster) {
                throw new Error('Poster not found');
            }

            return poster;
        } catch (error) {
            throw new Error(`Failed to get poster: ${error.message}`);
        }
    }

    // Delete a poster
    async deletePoster(posterId, userId) {
        try {
            const poster = await Poster.findOneAndDelete({
                _id: posterId,
                userId // Ensure user can only delete their own posters
            });

            if (!poster) {
                throw new Error('Poster not found');
            }

            return { message: 'Poster deleted successfully', deletedPoster: poster };
        } catch (error) {
            throw new Error(`Failed to delete poster: ${error.message}`);
        }
    }

    // Build the prompt for the AI
    buildPrompt(showDetails) {
        const { bandName, showTitle, venue, date, style } = showDetails;

        // Create a detailed prompt for poster generation
        let prompt = `Concert poster for "${bandName}"`;

        if (showTitle) prompt += ` performing "${showTitle}"`;
        if (venue) prompt += ` at ${venue}`;
        if (date) prompt += ` on ${date}`;

        prompt += `, ${style || 'rock'} music style, vibrant colors, professional concert poster design, bold typography, artistic, high quality`;

        return prompt;
    }

    // Call the OpenAI DALL-E 3 API
    async callOpenAIAPI(prompt) {
        try {
            console.log('Sending prompt to OpenAI DALL-E 3:', prompt);
            console.log('Using API key:', OPENAI_API_KEY ? 'API key exists' : 'No API key found');

            const response = await this.openai.images.generate({
                model: "dall-e-3",
                prompt: prompt,
                n: 1,
                size: "1024x1024",
                quality: "standard",
                response_format: "b64_json"
            });

            // Extract the base64 image data
            const imageBase64 = response.data[0].b64_json;

            // Convert base64 to buffer
            const imageBuffer = Buffer.from(imageBase64, 'base64');

            return imageBuffer;
        } catch (error) {
            console.error('OpenAI API Error:', error.message);
            console.error('Error details:', error.response?.data || error);

            // Try to get more details about the error
            let errorMessage = error.message;
            if (error.response?.data) {
                errorMessage += ` - ${JSON.stringify(error.response.data)}`;
            }

            throw new Error(`Poster generation failed: ${errorMessage}`);
        }
    }
}
module.exports = new PosterService();