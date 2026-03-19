// controllers/auth.js
// Student ID: [Smriti's Student ID]
// CampusConnect - Authentication Controller
// Description: Handles user registration, login, and JWT authentication

const User = require('../models/User');
const ActivityLog = require('../models/activityLog');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

/**
 * User Registration
 */
exports.register = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const { firstName, lastName, email, username, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or username already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      firstName,
      lastName,
      email,
      username,
      password: hashedPassword,
      role: role || 'student'
    });

    const savedUser = await newUser.save();

    // Create JWT token
    const token = jwt.sign(
      { 
        id: savedUser._id, 
        username: savedUser.username,
        role: savedUser.role 
      },
      process.env.JWT_SECRET || 'campusconnect_secret_key',
      { expiresIn: '7d' }
    );

    // Log activity
    const activityLog = new ActivityLog({
      user: savedUser._id,
      action: 'REGISTER',
      target: 'User registration'
    });
    await activityLog.save();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
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
    console.error('Error in register:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

/**
 * User Login
 */
exports.signin = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const { username, password } = req.body;

    // Find user by username or email
    const user = await User.findOne({
      $or: [{ username }, { email: username }]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        id: user._id, 
        username: user.username,
        role: user.role 
      },
      process.env.JWT_SECRET || 'campusconnect_secret_key',
      { expiresIn: '7d' }
    );

    // Log activity
    const activityLog = new ActivityLog({
      user: user._id,
      action: 'LOGIN',
      target: 'User login'
    });
    await activityLog.save();

    res.json({
      success: true,
      message: 'Login successful',
      token,
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
    console.error('Error in signin:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

/**
 * Middleware to require signin for protected routes
 */
exports.requireSignin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  try {
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'campusconnect_secret_key'
    );
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

/**
 * Middleware to log token info (for debugging)
 */
exports.logToken = (req, res, next) => {
  console.log('User authenticated:', req.user?.username);
  next();
};

/**
 * Get current user profile
 */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password'); // Exclude password
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.username,
        role: user.role,
        created: user.created
      }
    });
  } catch (error) {
    console.error('Error in getProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile'
    });
  }
};

/**
 * Update user profile
 */
exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, email } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;

    const updatedUser = await user.save();

    // Log activity
    const activityLog = new ActivityLog({
      user: user._id,
      action: 'UPDATE_PROFILE',
      target: 'User profile update'
    });
    await activityLog.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        username: updatedUser.username,
        role: updatedUser.role
      }
    });
  } catch (error) {
    console.error('Error in updateProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile'
    });
  }
};