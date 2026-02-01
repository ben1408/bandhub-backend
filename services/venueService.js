const venueRepository = require('../repositories/venueRepository');

const getAllVenues = async () => venueRepository.findAllVenues();
const getVenueById = async (id) => venueRepository.findVenueById(id);
const createVenue = async (data) => venueRepository.createVenue(data);
const updateVenue = async (id, update) => venueRepository.updateVenueById(id, update);
const deleteVenue = async (id) => venueRepository.deleteVenueById(id);

module.exports = {
    getAllVenues,
    getVenueById,
    createVenue,
    updateVenue,
    deleteVenue,
};
