var express = require('express');
var router = express.Router();
let categoryModel = require('../schemas/category');
let { Response } = require('../utils/responseHandler');
let { Authentication, Authorization } = require('../utils/authHandler');

// View categories - allowed for USER, MOD, ADMIN
router.get('/', Authentication, Authorization('USER','MOD','ADMIN'), async function(req,res,next){
  try{
    let categories = await categoryModel.find({ isDelete: { $ne: true } });
    Response(res,200,true,categories);
  }catch(err){
    Response(res,500,false,err);
  }
});

// Get category by id
router.get('/:id', Authentication, Authorization('USER','MOD','ADMIN'), async function(req,res,next){
  try{
    let cat = await categoryModel.findOne({_id:req.params.id, isDelete: { $ne: true }});
    if(!cat) return Response(res,404,false,'Category not found');
    Response(res,200,true,cat);
  }catch(err){
    Response(res,500,false,err);
  }
});

// Create category - MOD, ADMIN
router.post('/', Authentication, Authorization('MOD','ADMIN'), async function(req,res,next){
  try{
    let newCat = new categoryModel({ name: req.body.name });
    await newCat.save();
    Response(res,201,true,newCat);
  }catch(err){
    Response(res,400,false,err);
  }
});

// Update category - MOD, ADMIN
router.put('/:id', Authentication, Authorization('MOD','ADMIN'), async function(req,res,next){
  try{
    let updated = await categoryModel.findOneAndUpdate({ _id:req.params.id, isDelete:{ $ne: true } }, { name: req.body.name }, { new: true, runValidators: true });
    if(!updated) return Response(res,404,false,'Category not found');
    Response(res,200,true,updated);
  }catch(err){
    Response(res,400,false,err);
  }
});

// Delete category (soft) - ADMIN only
router.delete('/:id', Authentication, Authorization('ADMIN'), async function(req,res,next){
  try{
    let deleted = await categoryModel.findOneAndUpdate({ _id:req.params.id, isDelete:{ $ne: true } }, { isDelete: true }, { new: true });
    if(!deleted) return Response(res,404,false,'Category not found');
    Response(res,200,true,deleted);
  }catch(err){
    Response(res,500,false,err);
  }
});

module.exports = router;
var express = require('express');
var router = express.Router();
let categoryModel = require('../schemas/category');

/* GET categories listing */
router.get('/', async function(req, res, next) {
  try {
    let categories = await categoryModel.find();
    res.send({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      data: error
    });
  }
});

/* GET products by category */
router.get('/:id/products', async function(req, res, next) {
  try {
    const productModel = require('../schemas/product');
    let products = await productModel.find({ 
      category: req.params.id,
      isDelete: { $ne: true }
    }).populate('category', 'name');
    
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

// GET category by ID
router.get('/:id', async function(req, res, next) {
  try {
    let category = await categoryModel.findById(req.params.id);
    if (!category) {
      return res.status(404).send({
        success: false,
        message: 'Category not found'
      });
    }
    res.send({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(404).send({
      success: false,
      data: error
    });
  }
});

// POST create new category
router.post('/', async function(req, res, next) {
  try {
    let newCategory = new categoryModel({
      name: req.body.name
    });
    await newCategory.save();
    res.status(201).send({
      success: true,
      message: 'Category created successfully',
      data: newCategory
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      data: error
    });
  }
});

// PUT update category
router.put('/:id', async function(req, res, next) {
  try {
    let updatedCategory = await categoryModel.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name },
      { new: true, runValidators: true }
    );
    if (!updatedCategory) {
      return res.status(404).send({
        success: false,
        message: 'Category not found'
      });
    }
    res.send({
      success: true,
      message: 'Category updated successfully',
      data: updatedCategory
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      data: error
    });
  }
});

// DELETE category (hard delete since categories don't have isDelete field)
router.delete('/:id', async function(req, res, next) {
  try {
    let deletedCategory = await categoryModel.findByIdAndDelete(req.params.id);
    if (!deletedCategory) {
      return res.status(404).send({
        success: false,
        message: 'Category not found'
      });
    }
    res.send({
      success: true,
      message: 'Category deleted successfully',
      data: deletedCategory
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      data: error
    });
  }
});

module.exports = router;