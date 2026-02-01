const Band = require('../models/Band');

const findAllBands = () => Band.find();
const findBandById = (id) => Band.findById(id);
const createBand = (data) => (new Band(data)).save();
const updateBandById = (id, update) => Band.findByIdAndUpdate(id, update, { new: true });
const deleteBandById = (id) => Band.findByIdAndDelete(id);

const findAlbumsByBandId = (id) => Band.findById(id).then(band => band ? band.albums : null);
const findAlbumById = (bandId, albumId) => Band.findById(bandId).then(band => band ? band.albums.id(albumId) : null);
const pushAlbumToBand = (bandId, albumData) => Band.findById(bandId).then(async band => {
    if (!band) return null;
    band.albums.push(albumData);
    await band.save();
    return band.albums[band.albums.length - 1];
});
const editAlbumInBand = (bandId, albumId, albumData) => Band.findById(bandId).then(async band => {
    if (!band) return null;
    const album = band.albums.id(albumId);
    if (!album) return null;
    Object.assign(album, albumData);
    await band.save();
    return album;
});

module.exports = {
    findAllBands,
    findBandById,
    createBand,
    updateBandById,
    deleteBandById,
    findAlbumsByBandId,
    findAlbumById,
    pushAlbumToBand,
    editAlbumInBand
};
