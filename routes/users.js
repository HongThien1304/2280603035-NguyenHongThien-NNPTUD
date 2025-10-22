var express = require('express');
var router = express.Router();
let users = require('../schemas/users');
let roles = require('../schemas/roles');
let { uploadAFileWithField, uploadMultiFilesWithField } = require('../utils/uploadHandler');
let { Authentication } = require('../utils/authHandler');
let { Response } = require('../utils/responseHandler');

/* GET users listing. */
router.get('/', async function(req, res, next) {
  try{
    let allUsers = await users.find({isDeleted:false}).populate({
      path: 'role',
      select:'name'
    });
    Response(res,200,true,allUsers);
  }catch(err){
    Response(res,500,false,err);
  }
});
router.get('/:id', async function(req, res, next) {
  try {
    let getUser = await users.findById(req.params.id).populate('role','name');
    if(!getUser || getUser.isDeleted) return Response(res,404,false,'User not found');
    Response(res,200,true,getUser);
  } catch (error) {
    Response(res,404,false,error);
  }
});

router.post('/', async function(req, res, next) {
  let role = req.body.role?req.body.role:"USER";
  let roleId;
  role = await roles.findOne({name:role});
  roleId = role._id;
  let newUser = new users({
    username:req.body.username,
    email:req.body.email,
    password:req.body.password,
    role:roleId
  })
  await newUser.save();
  Response(res,201,true,newUser);
});
router.put('/:id', async function(req, res, next) {
  let user = await users.findById(req.params.id);
  user.email = req.body.email?req.body.email:user.email;
  user.fullName = req.body.fullName?req.body.fullName:user.fullName;
  user.password = req.body.password?req.body.password:user.password;
  await user.save()
  Response(res,200,true,user);
});

// Upload single avatar (authenticated)
router.post('/avatar', Authentication, uploadAFileWithField('image'), async function(req,res,next){
  try{
    if(!req.file) return Response(res,400,false,'No file uploaded');
    let URL = `${req.protocol}://${req.get('host')}/files/${req.file.filename}`;
    let user = await users.findById(req.userId);
    if(!user) return Response(res,404,false,'User not found');
    user.avatarURL = URL;
    await user.save();
    Response(res,200,true,URL);
  }catch(err){
    Response(res,500,false,err);
  }
});

// Upload multiple images for user (authenticated)
router.post('/avatars', Authentication, uploadMultiFilesWithField('image'), async function(req,res,next){
  try{
    if(!req.files || req.files.length===0) return Response(res,400,false,'No files uploaded');
    let URLs = req.files.map(f=>`${req.protocol}://${req.get('host')}/files/${f.filename}`);
    let user = await users.findById(req.userId);
    if(!user) return Response(res,404,false,'User not found');
    user.images = (user.images||[]).concat(URLs);
    await user.save();
    Response(res,200,true,URLs);
  }catch(err){
    Response(res,500,false,err);
  }
});

module.exports = router;
