const Venue = require('../models/Venue');

const findAllVenues = async () => Venue.find();
const findVenueById = async (id) => Venue.findById(id);
const createVenue = async (data) => (new Venue(data)).save();
const updateVenueById = async (id, update) => Venue.findByIdAndUpdate(id, update, { new: true });
const deleteVenueById = async (id) => Venue.findByIdAndDelete(id);

module.exports = {
    findAllVenues,
    findVenueById,
    createVenue,
    updateVenueById,
    deleteVenueById,
};
