var express = require('express');
var router = express.Router();
let roleModel = require('../schemas/role');

/* GET all roles - exclude soft deleted */
router.get('/', async function(req, res, next) {
  try {
    let roles = await roleModel.find({ isDelete: { $ne: true } });
    res.send({
      success: true,
      data: roles
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      data: error
    });
  }
});

/* GET role by ID */
router.get('/:id', async function(req, res, next) {
  try {
    let role = await roleModel.findOne({ 
      _id: req.params.id, 
      isDelete: { $ne: true } 
    });
    if (!role) {
      return res.status(404).send({
        success: false,
        message: 'Role not found'
      });
    }
    res.send({
      success: true,
      data: role
    });
  } catch (error) {
    res.status(404).send({
      success: false,
      data: error
    });
  }
});

/* POST create new role */
router.post('/', async function(req, res, next) {
  try {
    let newRole = new roleModel({
      name: req.body.name,
      description: req.body.description
    });
    await newRole.save();
    res.status(201).send({
      success: true,
      message: 'Role created successfully',
      data: newRole
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      data: error
    });
  }
});

/* PUT update role */
router.put('/:id', async function(req, res, next) {
  try {
    let updatedRole = await roleModel.findOneAndUpdate(
      { _id: req.params.id, isDelete: { $ne: true } },
      {
        name: req.body.name,
        description: req.body.description
      },
      { 
        new: true, 
        runValidators: true 
      }
    );
    
    if (!updatedRole) {
      return res.status(404).send({
        success: false,
        message: 'Role not found'
      });
    }

    res.send({
      success: true,
      message: 'Role updated successfully',
      data: updatedRole
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      data: error
    });
  }
});

/* DELETE role (soft delete) */
router.delete('/:id', async function(req, res, next) {
  try {
    let deletedRole = await roleModel.findOneAndUpdate(
      { _id: req.params.id, isDelete: { $ne: true } },
      { isDelete: true },
      { new: true }
    );
    
    if (!deletedRole) {
      return res.status(404).send({
        success: false,
        message: 'Role not found'
      });
    }

    res.send({
      success: true,
      message: 'Role deleted successfully',
      data: deletedRole
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      data: error
    });
  }
});

module.exports = router;