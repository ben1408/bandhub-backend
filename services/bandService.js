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

// Get top 5 bands by average listeners
const getTopBands = async () => {
    const bands = await bandRepository.findAllBands();

    // Calculate average listeners for each band
    const bandsWithAverages = bands.map(band => {
        let totalListens = 0;
        let totalSongs = 0;

        // Iterate through all albums and songs
        if (band.albums && band.albums.length > 0) {
            band.albums.forEach(album => {
                if (album.songs && album.songs.length > 0) {
                    album.songs.forEach(song => {
                        totalListens += song.listens || 0;
                        totalSongs++;
                    });
                }
            });
        }

        const averageListeners = totalSongs > 0 ? totalListens / totalSongs : 0;

        // Return band as plain object with averageListeners
        return {
            _id: band._id,
            name: band.name,
            genre: band.genre,
            description: band.description,
            logoUrl: band.logoUrl,
            bandPhotoUrl: band.bandPhotoUrl,
            members: band.members,
            createdAt: band.createdAt,
            averageListeners: averageListeners
        };
    });

    // Sort by average listeners (descending) and return top 5
    return bandsWithAverages
        .sort((a, b) => b.averageListeners - a.averageListeners)
        .slice(0, 5);
};

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
    getTopBands,
};
