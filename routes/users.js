var express = require('express');
var router = express.Router();
let users = require('../schemas/user');
let roles = require('../schemas/role');
let { Response } = require('../utils/responseHandler');
let { Authentication, Authorization } = require('../utils/authHandler');

/* GET users listing. */
router.get('/', async function(req, res, next) {
  let allUsers = await users.find({isDelete:false}).populate({
    path: 'role',
    select:'name'
  });
  Response(res,200,true,allUsers);
});
router.get('/:id', async function(req, res, next) {
  try {
    let getUser = await users.findById(req.params.id);
    if(!getUser || getUser.isDelete){
      return Response(res,404,false,'User not found');
    }
    Response(res,200,true,getUser);
  } catch (error) {
     Response(res,500,false,error);
  }
});

router.post('/', async function(req, res, next) {
  let roleName = req.body.role?req.body.role:"USER";
  let role = await roles.findOne({name:roleName});
  if(!role) return Response(res,400,false,'Invalid role');
  let roleId = role._id;
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

module.exports = router;
