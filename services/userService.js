const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');

// Validation helpers
const validateUsername = (username) => {
    if (!username || typeof username !== 'string') {
        throw new Error('Username is required');
    }
    if (username.length < 3 || username.length > 30) {
        throw new Error('Username must be between 3 and 30 characters');
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        throw new Error('Username can only contain letters, numbers, and underscores');
    }
    return username.trim();
};

const validatePassword = (password) => {
    if (!password || typeof password !== 'string') {
        throw new Error('Password is required');
    }
    if (password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
    }
    if (password.length > 100) {
        throw new Error('Password is too long');
    }
    // Check for at least one number and one letter
    if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(password)) {
        throw new Error('Password must contain at least one letter and one number');
    }
    return password;
};

const registerUser = async (username, password) => {
    // Validate input
    username = validateUsername(username);
    password = validatePassword(password);

    const existingUser = await userRepository.findUserByUsername(username);
    if (existingUser) throw new Error('User already exists');
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userRepository.createUser({ username, password: hashedPassword });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    return { token };
};

const loginUser = async (username, password) => {
    // Basic validation
    if (!username || !password) {
        throw new Error('Username and password are required');
    }

    const user = await userRepository.findUserByUsername(username);
    if (!user) throw new Error('Invalid credentials'); // Don't reveal if user exists
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('Invalid credentials');
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    return { token, isAdmin: user.role === 'admin', role: user.role };
};

const getAllUsers = async () => {
    return await userRepository.findAllUsers();
};

const updateUser = async (id, update) => {
    // SECURITY: Prevent role escalation by removing sensitive fields
    // Only admins can update roles via updateUserRole endpoint
    const sanitizedUpdate = { ...update };
    delete sanitizedUpdate.role;        // Prevent role changes
    delete sanitizedUpdate.password;    // Prevent password changes
    delete sanitizedUpdate._id;         // Prevent ID changes

    if (Object.keys(sanitizedUpdate).length === 0) {
        throw new Error('No valid fields to update');
    }

    return await userRepository.updateUserById(id, sanitizedUpdate);
};

const deleteUser = async (id) => {
    return await userRepository.deleteUserById(id);
};

const updateUsername = async (userId, newUsername) => {
    // Validate input
    newUsername = validateUsername(newUsername);

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
    // Validate new password
    newPassword = validatePassword(newPassword);

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
