const User = require('../models/User');

const findUserByUsername = async (username) => {
    return await User.findOne({ username });
};

const findUserById = async (id) => {
    return await User.findById(id);
};

const findAllUsers = async () => {
    return await User.find().select('-password');
};

const createUser = async (userData) => {
    const user = new User(userData);
    return await user.save();
};

const updateUserById = async (id, update) => {
    return await User.findByIdAndUpdate(id, update, { new: true });
};

const deleteUserById = async (id) => {
    return await User.findByIdAndDelete(id);
};

module.exports = {
    findUserByUsername,
    findUserById,
    findAllUsers,
    createUser,
    updateUserById,
    deleteUserById,
};
