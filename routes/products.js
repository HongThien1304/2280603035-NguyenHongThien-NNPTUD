var express = require('express');
var router = express.Router();
let productModel = require('../schemas/product');
let { Response } = require('../utils/responseHandler');
let { Authentication, Authorization } = require('../utils/authHandler');

// View products - allowed for USER, MOD, ADMIN
router.get('/', Authentication, Authorization('USER','MOD','ADMIN'), async function(req, res, next){
  try{
    let products = await productModel.find({ isDelete: { $ne: true } }).populate('category','name');
    Response(res,200,true,products);
  }catch(err){
    Response(res,500,false,err);
  }
});

// Get product by id
router.get('/:id', Authentication, Authorization('USER','MOD','ADMIN'), async function(req,res,next){
  try{
    let item = await productModel.findOne({_id:req.params.id, isDelete: { $ne: true }}).populate('category','name');
    if(!item) return Response(res,404,false,'Product not found');
    Response(res,200,true,item);
  }catch(err){
    Response(res,500,false,err);
  }
});

// Create product - MOD, ADMIN
router.post('/', Authentication, Authorization('MOD','ADMIN'), async function(req,res,next){
  try{
    let newItem = new productModel({
      name: req.body.name,
      price: req.body.price,
      description: req.body.description,
      category: req.body.category
    });
    await newItem.save();
    await newItem.populate('category','name');
    Response(res,201,true,newItem);
  }catch(err){
    Response(res,400,false,err);
  }
});

// Update product - MOD, ADMIN
router.put('/:id', Authentication, Authorization('MOD','ADMIN'), async function(req,res,next){
  try{
    let updated = await productModel.findOneAndUpdate(
      { _id: req.params.id, isDelete: { $ne: true } },
      { name:req.body.name, price:req.body.price, description:req.body.description, category:req.body.category },
      { new: true, runValidators: true }
    ).populate('category','name');
    if(!updated) return Response(res,404,false,'Product not found');
    Response(res,200,true,updated);
  }catch(err){
    Response(res,400,false,err);
  }
});

// Delete product (soft) - ADMIN only
router.delete('/:id', Authentication, Authorization('ADMIN'), async function(req,res,next){
  try{
    let deleted = await productModel.findOneAndUpdate({ _id: req.params.id, isDelete: { $ne: true } }, { isDelete: true }, { new: true });
    if(!deleted) return Response(res,404,false,'Product not found');
    Response(res,200,true,deleted);
  }catch(err){
    Response(res,500,false,err);
  }
});

module.exports = router;
var express = require('express');
var router = express.Router();
let productModel = require('../schemas/product');
let categoryModel = require('../schemas/category');

/* GET products listing - exclude soft deleted */
router.get('/', async function(req, res, next) {
  try {
    let products = await productModel.find({ isDelete: { $ne: true } })
      .populate('category', 'name');
    res.send({
      success: true,
      data: products
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      data: error
    });
  }
});
router.get('/:id', async function(req, res, next) {
  try {
    let item = await productModel.findById(req.params.id)
      .populate('category', 'name');
    if (!item) {
      return res.status(404).send({
        success: false,
        message: 'Product not found'
      });
    }
    res.send({
      success: true,
      data: item
    });
  } catch (error) {
    res.status(404).send({
      success: false,
      data: error
    })
  }
});
router.post('/', async function(req,res,next){
  try {
    // Validate category exists
    const categoryExists = await categoryModel.findById(req.body.category);
    if (!categoryExists) {
      return res.status(400).send({
        success: false,
        message: 'Invalid category ID'
      });
    }

    let newItem = new productModel({
      name: req.body.name,
      price: req.body.price,
      description: req.body.description,
      category: req.body.category
    });
    await newItem.save();
    
    // Populate category data in response
    await newItem.populate('category', 'name');
    
    res.status(201).send({
      success: true,
      message: 'Product created successfully',
      data: newItem
    })
  } catch (error) {
    res.status(400).send({
      success: false,
      data: error
    })
  }
})
router.put('/:id', async function(req,res,next){
  try {
    // Validate category exists if provided
    if (req.body.category) {
      const categoryExists = await categoryModel.findById(req.body.category);
      if (!categoryExists) {
        return res.status(400).send({
          success: false,
          message: 'Invalid category ID'
        });
      }
    }

    let updatedItem = await productModel.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        price: req.body.price,
        description: req.body.description,
        category: req.body.category
      },{
        new: true,
        runValidators: true
      }
    ).populate('category', 'name');
    
    if (!updatedItem) {
      return res.status(404).send({
        success: false,
        message: 'Product not found'
      });
    }

    res.send({
      success: true,
      message: 'Product updated successfully',
      data: updatedItem
    })
  } catch (error) {
    res.status(400).send({
      success: false,
      data: error
    })
  }
})

// Soft delete - set isDelete to true
router.delete('/:id', async function(req, res, next) {
  try {
    let deletedItem = await productModel.findByIdAndUpdate(
      req.params.id,
      { isDelete: true },
      { new: true }
    );
    if (!deletedItem) {
      return res.status(404).send({
        success: false,
        message: 'Product not found'
      });
    }
    res.send({
      success: true,
      message: 'Product soft deleted successfully',
      data: deletedItem
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      data: error
    });
  }
});

module.exports = router;
