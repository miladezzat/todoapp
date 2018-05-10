var express               = require('express');
var router                = express.Router();
var passport	          =	require('passport');
var User                  =	require('../models/user.js');


router.post('/signup', function (req, res) {
    var fullName = req.body.fullName;
    var email     = req.body.email;
    var password  = req.body.password;

    User.findOne({'email': email}, function(err, user){
		if (err) {
			res.json({status:0, message: err});
		}
		if (user) {
			res.json({status: 0, message: ' Email is already in use'});
        } else {
            
            var newUser = new User();
            newUser.fullName 		= req.body.fullName;			
            newUser.email 			= email;			
            newUser.password 		= newUser.encryptPassword(password);
            newUser.save(function (err, result) {
                if (err) {
                    res.json({status: 0, message: err});
                } else {
                    res.json({status: 1, message: "success"});
                }
            });
        }
		
	});
  });


router.post('/login', function (req, res) {
    var email     = req.body.email;
    var password  = req.body.password;
  
    User.findOne({'email': email}, function(err, user){
        if (err) {
            res.json({status: 0, message: err});
        }
        if (!user) {
            res.json({status: 0, message: ' User Not founded'});
        }
        if(user){
            if (!user.validPassword(password)) {
                return res.json({status: 0, message: ' Password Not Valid'})
            } 
            res.json({status:1, message: "success"});
        }
    });
  });


module.exports = router;
