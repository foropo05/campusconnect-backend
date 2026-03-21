let User = require('../models/User');

// Get all users (admin only)
module.exports.userList = async (req, res, next) => {
    try {
        if (req.auth.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        let list = await User.find({}, '-password');

        res.json({
            success: true,
            message: 'Users retrieved successfully.',
            data: list
        });
    } catch (error) {
        console.log(error);
        next(error);
    }
};

// Get one user by ID (admin only)
module.exports.getByID = async (req, res, next) => {
    try {
        if (req.auth.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        let user = await User.findById(req.params.id, '-password');

        if (!user) {
            throw new Error('User not found. Are you sure it exists?');
        }

        res.json({
            success: true,
            message: 'User retrieved successfully.',
            data: user
        });
    } catch (error) {
        console.log(error);
        next(error);
    }
};

// Update user (admin only)
module.exports.processEdit = async (req, res, next) => {
    try {
        if (req.auth.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        let id = req.params.id;

        let updateUser = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            username: req.body.username,
            role: req.body.role
        };

        let result = await User.updateOne({ _id: id }, updateUser);

        if (result.modifiedCount > 0 || result.matchedCount > 0) {
            res.json({
                success: true,
                message: 'User updated successfully.'
            });
        } else {
            throw new Error('User not updated. Are you sure it exists?');
        }
    } catch (error) {
        console.log(error);
        next(error);
    }
};

// Delete user (admin only)
module.exports.performDelete = async (req, res, next) => {
    try {
        if (req.auth.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        let id = req.params.id;

        let result = await User.deleteOne({ _id: id });

        if (result.deletedCount > 0) {
            res.json({
                success: true,
                message: 'User deleted successfully.'
            });
        } else {
            throw new Error('User not deleted. Are you sure it exists?');
        }
    } catch (error) {
        console.log(error);
        next(error);
    }
};