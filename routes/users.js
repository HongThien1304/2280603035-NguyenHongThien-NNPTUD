var express = require('express');
var router = express.Router();
let userModel = require('../schemas/user');

/* GET all users - exclude soft deleted, with search functionality */
router.get('/', async function(req, res, next) {
  try {
    let query = { isDelete: { $ne: true } };
    
    // Search by username or fullName if search parameter is provided
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i'); // case-insensitive search
      query.$or = [
        { username: { $regex: searchRegex } },
        { fullName: { $regex: searchRegex } }
      ];
    }
    
    let users = await userModel.find(query)
      .populate('role', 'name description')
      .select('-password'); // Exclude password from response
    
    res.send({
      success: true,
      data: users
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      data: error
    });
  }
});

/* GET user by ID */
router.get('/:id', async function(req, res, next) {
  try {
    let user = await userModel.findOne({ 
      _id: req.params.id, 
      isDelete: { $ne: true } 
    })
    .populate('role', 'name description')
    .select('-password');
    
    if (!user) {
      return res.status(404).send({
        success: false,
        message: 'User not found'
      });
    }
    
    res.send({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(404).send({
      success: false,
      data: error
    });
  }
});

/* GET user by username */
router.get('/username/:username', async function(req, res, next) {
  try {
    let user = await userModel.findOne({ 
      username: req.params.username, 
      isDelete: { $ne: true } 
    })
    .populate('role', 'name description')
    .select('-password');
    
    if (!user) {
      return res.status(404).send({
        success: false,
        message: 'User not found'
      });
    }
    
    res.send({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(404).send({
      success: false,
      data: error
    });
  }
});

/* POST create new user */
router.post('/', async function(req, res, next) {
  try {
    // Validate role exists
    const roleModel = require('../schemas/role');
    const roleExists = await roleModel.findOne({ 
      _id: req.body.role, 
      isDelete: { $ne: true } 
    });
    
    if (!roleExists) {
      return res.status(400).send({
        success: false,
        message: 'Invalid role ID'
      });
    }

    let newUser = new userModel({
      username: req.body.username,
      password: req.body.password,
      email: req.body.email,
      fullName: req.body.fullName,
      avatarUrl: req.body.avatarUrl,
      role: req.body.role
    });
    
    await newUser.save();
    
    // Populate role data and exclude password in response
    await newUser.populate('role', 'name description');
    
    res.status(201).send({
      success: true,
      message: 'User created successfully',
      data: {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        fullName: newUser.fullName,
        avatarUrl: newUser.avatarUrl,
        status: newUser.status,
        role: newUser.role,
        loginCount: newUser.loginCount,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt
      }
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      data: error
    });
  }
});

/* PUT update user */
router.put('/:id', async function(req, res, next) {
  try {
    // Validate role exists if provided
    if (req.body.role) {
      const roleModel = require('../schemas/role');
      const roleExists = await roleModel.findOne({ 
        _id: req.body.role, 
        isDelete: { $ne: true } 
      });
      
      if (!roleExists) {
        return res.status(400).send({
          success: false,
          message: 'Invalid role ID'
        });
      }
    }

    let updatedUser = await userModel.findOneAndUpdate(
      { _id: req.params.id, isDelete: { $ne: true } },
      {
        username: req.body.username,
        password: req.body.password,
        email: req.body.email,
        fullName: req.body.fullName,
        avatarUrl: req.body.avatarUrl,
        status: req.body.status,
        role: req.body.role,
        loginCount: req.body.loginCount
      },
      { 
        new: true, 
        runValidators: true 
      }
    )
    .populate('role', 'name description')
    .select('-password');
    
    if (!updatedUser) {
      return res.status(404).send({
        success: false,
        message: 'User not found'
      });
    }

    res.send({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      data: error
    });
  }
});

/* DELETE user (soft delete) */
router.delete('/:id', async function(req, res, next) {
  try {
    let deletedUser = await userModel.findOneAndUpdate(
      { _id: req.params.id, isDelete: { $ne: true } },
      { isDelete: true },
      { new: true }
    )
    .populate('role', 'name description')
    .select('-password');
    
    if (!deletedUser) {
      return res.status(404).send({
        success: false,
        message: 'User not found'
      });
    }

    res.send({
      success: true,
      message: 'User deleted successfully',
      data: deletedUser
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      data: error
    });
  }
});

/* POST activate user - verify email and username, set status to true */
router.post('/activate', async function(req, res, next) {
  try {
    const { email, username } = req.body;
    
    if (!email || !username) {
      return res.status(400).send({
        success: false,
        message: 'Email and username are required'
      });
    }
    
    // Find user by email and username
    let user = await userModel.findOne({ 
      email: email,
      username: username,
      isDelete: { $ne: true } 
    });
    
    if (!user) {
      return res.status(404).send({
        success: false,
        message: 'User not found with provided email and username'
      });
    }
    
    // Update status to true
    user.status = true;
    await user.save();
    
    // Return user info without password
    await user.populate('role', 'name description');
    
    res.send({
      success: true,
      message: 'User activated successfully',
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        status: user.status,
        role: user.role,
        loginCount: user.loginCount,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      data: error
    });
  }
});

module.exports = router;