let User = require('../models/User');
let jwt = require('jsonwebtoken');
let { expressjwt } = require('express-jwt');
let bcrypt = require('bcryptjs');

let secretKey = process.env.SECRETKEY;

module.exports.register = async function (req, res, next) {
    try {
        let existingUser = await User.findOne({
            $or: [{ email: req.body.email }, { username: req.body.username }]
        });

        if (existingUser)
            throw new Error('Email or username already in use.');

        let hashedPassword = await bcrypt.hash(req.body.password, 10);

        let newUser = new User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
            role: 'admin' // Default role, can be changed as needed
        });

        let result = await User.create(newUser);

        res.json({
            success: true,
            message: 'User registered successfully.',
            data: result
        });
    } catch (error) {
        console.log(error);
        next(error);
    }
};

module.exports.signin = async function (req, res, next) {
    try {
        let user = await User.findOne({ email: req.body.email });

        if (!user)
            throw new Error('User not found.');

        let isMatch = await bcrypt.compare(req.body.password, user.password);

        if (!isMatch)
            throw new Error("Email and/or password don't match.");

        let payload = {
            id: user._id,
            username: user.username,
            role: user.role
        };

        let token = jwt.sign(payload, secretKey, {
            algorithm: 'HS512',
            expiresIn: '1h'
        });

        res.json({
            success: true,
            message: 'User authenticated successfully.',
            token: token
        });
    } catch (error) {
        console.log(error);
        next(error);
    }
};

module.exports.requireSignin = expressjwt({
    secret: secretKey,
    algorithms: ['HS512'],
    userProperty: 'auth'
});

module.exports.logToken = async function (req, res, next) {
    console.log(req.headers);
    console.log(req.auth);
    next();
};