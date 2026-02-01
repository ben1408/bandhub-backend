const bandRepository = require('../repositories/bandRepository');

const getAllBands = async () => bandRepository.findAllBands();
const getBandById = async (id) => bandRepository.findBandById(id);
const createBand = async (data) => bandRepository.createBand(data);
const updateBand = async (id, update) => bandRepository.updateBandById(id, update);
const deleteBand = async (id) => bandRepository.deleteBandById(id);

const getAlbums = async (bandId) => bandRepository.findAlbumsByBandId(bandId);
const getAlbum = async (bandId, albumId) => bandRepository.getAlbumById(bandId, albumId);
const addAlbum = async (bandId, albumData) => bandRepository.pushAlbumToBand(bandId, albumData);
const editAlbum = async (bandId, albumId, albumData) => bandRepository.editAlbumInBand(bandId, albumId, albumData);

module.exports = {
    getAllBands,
    getBandById,
    createBand,
    updateBand,
    deleteBand,
    getAlbums,
    getAlbum,
    addAlbum,
    editAlbum,
};
