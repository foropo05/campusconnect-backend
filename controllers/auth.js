let User = require('../models/User');
let bcrypt = require('bcryptjs');
let jwt = require('jsonwebtoken');

// User registration
exports.register = async (req, res) => {
  try {
    let { firstName, lastName, email, username, password, role } = req.body;

    // Check if user exists
    let existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Hash password
    let salt = await bcrypt.genSalt(10);
    let hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    let newUser = new User({
      firstName: firstName,
      lastName: lastName,
      email: email,
      username: username,
      password: hashedPassword,
      role: role || 'student'
    });

    let savedUser = await newUser.save();

    // Create token
    let token = jwt.sign(
      { 
        id: savedUser._id, 
        username: savedUser.username,
        role: savedUser.role 
      },
      'secretkey',
      { expiresIn: '1h' }
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token: token,
      user: {
        id: savedUser._id,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        email: savedUser.email,
        username: savedUser.username,
        role: savedUser.role
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// User login
exports.signin = async (req, res) => {
  try {
    let { username, password } = req.body;

    // Find user
    let user = await User.findOne({
      $or: [{ username: username }, { email: username }]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    let isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Create token
    let token = jwt.sign(
      { 
        id: user._id, 
        username: user.username,
        role: user.role 
      },
      'secretkey',
      { expiresIn: '1h' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token: token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Middleware for protected routes
exports.requireSignin = (req, res, next) => {
  let token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided'
    });
  }

  try {
    let decoded = jwt.verify(token, 'secretkey');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

// Log token middleware
exports.logToken = (req, res, next) => {
  if (req.user) {
    console.log('User authenticated:', req.user.username);
  }
  next();
};