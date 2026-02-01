const showRepository = require('../repositories/showRepository');
const bandRepository = require('../repositories/bandRepository');
const venueRepository = require('../repositories/venueRepository');

const getAllShows = async () => {
    return await showRepository.findAllShows();
};

const getShowById = async (id) => {
    const show = await showRepository.findShowById(id);
    if (!show) throw new Error('Show not found');
    return show;
};

const getShowsByBand = async (bandId) => {
    // Verify band exists
    const band = await bandRepository.findBandById(bandId);
    if (!band) throw new Error('Band not found');

    return await showRepository.findShowsByBand(bandId);
};

const getShowsByVenue = async (venueId) => {
    // Verify venue exists
    const venue = await venueRepository.findVenueById(venueId);
    if (!venue) throw new Error('Venue not found');

    return await showRepository.findShowsByVenue(venueId);
};

const getUpcomingShows = async () => {
    return await showRepository.findUpcomingShows();
};

const createShow = async (showData) => {
    const { band, venue, date, setlist, ticketsPrice, ticketsSold } = showData;

    // Validate required fields
    if (!band || !venue || !date || !ticketsPrice) {
        throw new Error('Band, venue, date, and ticket price are required');
    }

    // Verify band exists
    const bandExists = await bandRepository.findBandById(band);
    if (!bandExists) throw new Error('Band not found');

    // Verify venue exists
    const venueExists = await venueRepository.findVenueById(venue);
    if (!venueExists) throw new Error('Venue not found');

    // Validate date format
    const showDate = new Date(date);
    if (isNaN(showDate.getTime())) {
        throw new Error('Invalid date format');
    }

    // Validate ticket price
    if (ticketsPrice <= 0) {
        throw new Error('Ticket price must be greater than 0');
    }

    const newShow = await showRepository.createShow({
        band,
        venue,
        date: showDate,
        setlist: setlist || [],
        ticketsPrice,
        ticketsSold: ticketsSold || 0
    });

    return await showRepository.findShowById(newShow._id);
};

const updateShow = async (id, updateData) => {
    const existingShow = await showRepository.findShowById(id);
    if (!existingShow) throw new Error('Show not found');

    // If updating band, verify it exists
    if (updateData.band) {
        const band = await bandRepository.findBandById(updateData.band);
        if (!band) throw new Error('Band not found');
    }

    // If updating venue, verify it exists
    if (updateData.venue) {
        const venue = await venueRepository.findVenueById(updateData.venue);
        if (!venue) throw new Error('Venue not found');
    }

    // If updating date, validate it's in the future
    if (updateData.date) {
        const showDate = new Date(updateData.date);
        if (showDate <= new Date()) {
            throw new Error('Show date must be in the future');
        }
        updateData.date = showDate;
    }

    // Validate ticket price if provided
    if (updateData.ticketsPrice !== undefined && updateData.ticketsPrice <= 0) {
        throw new Error('Ticket price must be greater than 0');
    }

    return await showRepository.updateShowById(id, updateData);
};

const deleteShow = async (id) => {
    const show = await showRepository.findShowById(id);
    if (!show) throw new Error('Show not found');

    return await showRepository.deleteShowById(id);
};

module.exports = {
    getAllShows,
    getShowById,
    getShowsByBand,
    getShowsByVenue,
    getUpcomingShows,
    createShow,
    updateShow,
    deleteShow,
};
