let PostModel = require('../models/post');

module.exports.postList = async (req, res, next) => {
    try {
        let list = await PostModel.find({}).populate(
            'author',
            'firstName lastName username email'
        );

        res.json({
            success: true,
            message: 'Posts list retrieved successfully.',
            data: list
        });
    } catch (error) {
        console.log(error);
        next(error);
    }
};

module.exports.getByID = async function (req, res, next) {
    try {
        let post = await PostModel.findOne({ _id: req.params.id }).populate(
            'author',
            'firstName lastName username email'
        );

        if (!post)
            throw new Error('Post not found. Are you sure it exists?');

        res.json({
            success: true,
            message: 'Post retrieved successfully.',
            data: post
        });
    } catch (error) {
        console.log(error);
        next(error);
    }
};

module.exports.processAdd = async (req, res, next) => {
    try {
        let newPost = new PostModel({
            title: req.body.title,
            content: req.body.content,
            category: req.body.category,
            status: req.body.status || 'active',
            location: req.body.location,
            eventDate: req.body.eventDate,
            author: req.auth.id
        });

        let result = await PostModel.create(newPost);

        res.json({
            success: true,
            message: 'Post added successfully.',
            data: result
        });
    } catch (error) {
        console.log(error);
        next(error);
    }
};

module.exports.processEdit = async (req, res, next) => {
    try {
        let id = req.params.id;

        let updatePost = {
            title: req.body.title,
            content: req.body.content,
            category: req.body.category,
            status: req.body.status,
            location: req.body.location,
            eventDate: req.body.eventDate
        };

        let result = await PostModel.updateOne({ _id: id }, updatePost);

        if (result.modifiedCount > 0 || result.matchedCount > 0) {
            res.json({
                success: true,
                message: 'Post updated successfully.'
            });
        } else {
            throw new Error('Post not updated. Are you sure it exists?');
        }
    } catch (error) {
        console.log(error);
        next(error);
    }
};

module.exports.performDelete = async (req, res, next) => {
    try {
        let id = req.params.id;

        let result = await PostModel.deleteOne({ _id: id });

        if (result.deletedCount > 0) {
            res.json({
                success: true,
                message: 'Post deleted successfully.'
            });
        } else {
            throw new Error('Post not deleted. Are you sure it exists?');
        }
    } catch (error) {
        console.log(error);
        next(error);
    }
};