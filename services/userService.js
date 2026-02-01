const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');

const registerUser = async (username, password) => {
    const existingUser = await userRepository.findUserByUsername(username);
    if (existingUser) throw new Error('User already exists');
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userRepository.createUser({ username, password: hashedPassword });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    return { token };
};

const loginUser = async (username, password) => {
    const user = await userRepository.findUserByUsername(username);
    if (!user) throw new Error('User not found');
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('Invalid credentials');
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    return { token, isAdmin: user.role === 'admin', role: user.role };
};

const getAllUsers = async () => {
    return await userRepository.findAllUsers();
};

const updateUser = async (id, update) => {
    return await userRepository.updateUserById(id, update);
};

const deleteUser = async (id) => {
    return await userRepository.deleteUserById(id);
};

const updateUsername = async (userId, newUsername) => {
    // Check if username already exists
    const existingUser = await userRepository.findUserByUsername(newUsername);
    if (existingUser && existingUser._id.toString() !== userId) {
        throw new Error('Username already exists');
    }

    const updatedUser = await userRepository.updateUserById(userId, { username: newUsername });
    if (!updatedUser) throw new Error('User not found');

    return { message: 'Username updated successfully' };
};

const updatePassword = async (userId, currentPassword, newPassword) => {
    const user = await userRepository.findUserById(userId);
    if (!user) throw new Error('User not found');

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) throw new Error('Current password is incorrect');

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await userRepository.updateUserById(userId, { password: hashedPassword });

    return { message: 'Password updated successfully' };
};

const updateUserRole = async (userId, newRole) => {
    if (!['fan', 'moderator', 'admin'].includes(newRole)) {
        throw new Error('Invalid role. Must be either "fan", "moderator", or "admin"');
    }

    const updatedUser = await userRepository.updateUserById(userId, { role: newRole });
    if (!updatedUser) throw new Error('User not found');

    return { message: `User role updated to ${newRole} successfully`, user: updatedUser };
};

module.exports = {
    registerUser,
    loginUser,
    getAllUsers,
    updateUser,
    deleteUser,
    updateUsername,
    updatePassword,
    updateUserRole,
};
