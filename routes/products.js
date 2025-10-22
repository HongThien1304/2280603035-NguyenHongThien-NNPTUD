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
    // Validate category if provided
    if (req.body.category) {
      const categoryModel = require('../schemas/category');
      const exists = await categoryModel.findById(req.body.category);
      if (!exists) return Response(res,400,false,'Invalid category ID');
    }
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
    // Validate category if provided
    if (req.body.category) {
      const categoryModel = require('../schemas/category');
      const exists = await categoryModel.findById(req.body.category);
      if (!exists) return Response(res,400,false,'Invalid category ID');
    }
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
