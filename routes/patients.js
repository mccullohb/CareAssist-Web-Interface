var express = require('express');
var router = express.Router();
var Patient = require('../models/Patient');

/** GET new patient form */

router.get('/new',function(req,res,next){
  res.render('pages/patient/new')
});

/** POST new patient form */
router.post('/',function(req,res,next){
  var newPatient = new Patient({
    firstName: req.body.firstName,
    lastName: req.body.lastName
  })
  patient.save(function(err,newPatient){
    if(err) return console.log(err);
    else res.send("Successfully created  and saveda new patient!")
  })
});

/* GET patients listing. */
router.get('/', function(req, res, next) {
  res.render('pages/patient/index');
});

/* SHOW individual patient */
router.get('/:id', function(req, res, next) {
  res.render('pages/patient/show');
});



module.exports = router;
