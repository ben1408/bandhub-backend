const Band = require('../models/Band');
const Show = require('../models/Show');
const Venue = require('../models/Venue');
const Album = require('../models/Album');

class AnalyticsService {
    async getAnalytics() {
        try {
            // Get basic counts
            const totalBands = await Band.countDocuments();
            const totalShows = await Show.countDocuments();
            const totalVenues = await Venue.countDocuments();

            // Calculate total albums (from all bands' albums arrays)
            const bandsWithAlbums = await Band.find({}, { albums: 1 });
            const totalAlbums = bandsWithAlbums.reduce((total, band) => {
                return total + (band.albums ? band.albums.length : 0);
            }, 0);

            // Calculate total revenue and tickets sold
            const shows = await Show.find({});
            const totalRevenue = shows.reduce((total, show) => {
                return total + (show.ticketsPrice * show.ticketsSold || 0);
            }, 0);
            const totalTicketsSold = shows.reduce((total, show) => {
                return total + (show.ticketsSold || 0);
            }, 0);

            // Get top performing bands
            const topBands = await this.getTopBands();

            // Get popular venues
            const topVenues = await this.getTopVenues();

            // Get recent shows
            const recentShows = await this.getRecentShows();

            // Get genre breakdown
            const genreBreakdown = await this.getGenreBreakdown();

            return {
                totalBands,
                totalAlbums,
                totalShows,
                totalRevenue,
                totalTicketsSold,
                topBands,
                topVenues,
                recentShows,
                genreBreakdown
            };
        } catch (error) {
            throw new Error(`Analytics service error: ${error.message}`);
        }
    }

    async getTopBands() {
        try {
            // Aggregate shows by band to get show count and total revenue per band
            const bandStats = await Show.aggregate([
                {
                    $group: {
                        _id: '$band',
                        showCount: { $sum: 1 },
                        totalRevenue: {
                            $sum: {
                                $multiply: ['$ticketsPrice', '$ticketsSold']
                            }
                        }
                    }
                },
                { $sort: { totalRevenue: -1, showCount: -1 } },
                { $limit: 10 }
            ]);

            // Populate band details
            const topBands = [];
            for (const stat of bandStats) {
                const band = await Band.findById(stat._id).select('name logoUrl');
                if (band) {
                    topBands.push({
                        _id: band._id,
                        name: band.name,
                        logoUrl: band.logoUrl,
                        showCount: stat.showCount,
                        totalRevenue: stat.totalRevenue
                    });
                }
            }

            return topBands;
        } catch (error) {
            throw new Error(`Error getting top bands: ${error.message}`);
        }
    }

    async getTopVenues() {
        try {
            // Aggregate shows by venue to get show count
            const venueStats = await Show.aggregate([
                {
                    $group: {
                        _id: '$venue',
                        showCount: { $sum: 1 }
                    }
                },
                { $sort: { showCount: -1 } },
                { $limit: 10 }
            ]);

            // Populate venue details
            const topVenues = [];
            for (const stat of venueStats) {
                const venue = await Venue.findById(stat._id).select('name location');
                if (venue) {
                    topVenues.push({
                        _id: venue._id,
                        name: venue.name,
                        location: venue.location,
                        showCount: stat.showCount
                    });
                }
            }

            return topVenues;
        } catch (error) {
            throw new Error(`Error getting top venues: ${error.message}`);
        }
    }

    async getRecentShows() {
        try {
            const recentShows = await Show.find({})
                .populate('band', 'name logoUrl')
                .populate('venue', 'name location')
                .sort({ date: -1 })
                .limit(10);

            return recentShows.map(show => ({
                _id: show._id,
                band: {
                    name: show.band?.name || 'Unknown Band',
                    logoUrl: show.band?.logoUrl
                },
                venue: {
                    name: show.venue?.name || 'Unknown Venue',
                    location: show.venue?.location || 'Unknown Location'
                },
                date: show.date,
                ticketsSold: show.ticketsSold || 0,
                revenue: (show.ticketsPrice || 0) * (show.ticketsSold || 0)
            }));
        } catch (error) {
            throw new Error(`Error getting recent shows: ${error.message}`);
        }
    }

    async getGenreBreakdown() {
        try {
            const genreStats = await Band.aggregate([
                {
                    $group: {
                        _id: '$genre',
                        count: { $sum: 1 }
                    }
                },
                { $sort: { count: -1 } }
            ]);

            return genreStats.map(stat => ({
                genre: stat._id || 'Unknown',
                count: stat.count
            }));
        } catch (error) {
            throw new Error(`Error getting genre breakdown: ${error.message}`);
        }
    }
}

module.exports = new AnalyticsService();
