var express = require('express');
var router = express.Router();

/* GET landing page. */
router.get('/', function(req, res, next) {
  res.render('pages/landing/index');
});


/* GET login page */
router.get('/login',function(req,res,next){
  res.render('pages/landing/login');
});

/* GET loader page */
router.get('/:state/loader',function(req,res,next){
  var state = '';
  if (req.params.state == 'login'){
    state = "Setting things up for you!";
  } else if(req.params.state == 'logout'){
    state = "Logging you out!"
  }

  res.render('pages/landing/loader',{state:state});
});


module.exports = router;
