var express = require('express');
var router = express.Router();
let roleSchema = require('../schemas/role')
let { Response } = require('../utils/responseHandler');
let { Authentication, Authorization } = require('../utils/authHandler');

/* GET users listing. */
router.get('/', Authentication, Authorization('USER','MOD','ADMIN'), async function(req, res, next) {
  let roles = await roleSchema.find({isDelete:false});
  Response(res,200,true,roles);
});
router.get('/:id', async function(req, res, next) {
  try {
    let role = await roleSchema.findById(req.params.id);
    if(!role || role.isDelete) return Response(res,404,false,'Role not found');
    Response(res,200,true,role);
  } catch (error) {
    Response(res,500,false,error);
  }
 
});

router.post('/', async function(req, res, next) {
  let newRole = new roleSchema({
    name:req.body.name
  })
  await newRole.save();
  Response(res,201,true,newRole)
});

module.exports = router;
