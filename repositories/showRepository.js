const Show = require('../models/Show');

const findAllShows = async () => {
    return await Show.find()
        .populate('band', 'name logoUrl')
        .populate('venue', 'name location')
        .sort({ date: 1 });
};

const findShowById = async (id) => {
    return await Show.findById(id)
        .populate('band', 'name logoUrl')
        .populate('venue', 'name location');
};

const findShowsByBand = async (bandId) => {
    return await Show.find({ band: bandId })
        .populate('venue', 'name location')
        .sort({ date: 1 });
};

const findShowsByVenue = async (venueId) => {
    return await Show.find({ venue: venueId })
        .populate('band', 'name logoUrl')
        .sort({ date: 1 });
};

const findUpcomingShows = async () => {
    const now = new Date();
    return await Show.find({ date: { $gte: now } })
        .populate('band', 'name logoUrl')
        .populate('venue', 'name location')
        .sort({ date: 1 });
};

const createShow = async (data) => {
    const show = new Show(data);
    return await show.save();
};

const updateShowById = async (id, update) => {
    return await Show.findByIdAndUpdate(id, update, { new: true })
        .populate('band', 'name logoUrl')
        .populate('venue', 'name location');
};

const deleteShowById = async (id) => {
    return await Show.findByIdAndDelete(id);
};

module.exports = {
    findAllShows,
    findShowById,
    findShowsByBand,
    findShowsByVenue,
    findUpcomingShows,
    createShow,
    updateShowById,
    deleteShowById,
};
