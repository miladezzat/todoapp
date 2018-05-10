var express		            =	require('express');
var router 		            =	express.Router();
//var csrf		            =	require('csurf');
var passport	            =	require('passport');
var User                  =	require('../models/user.js');
var Rule                  =	require('../models/rules.js');

//import the controller of users
var userController        = require("../controllers/userController");

//All methods for control users
var methodsController     = require("../controllers/methods");

//var csrfProtection        = csrf();
//router.use(csrfProtection);



//route user profile page
router.get('/profile', methodsController.isLoggedIn,userController.profille);

/* GET Add new Employee. */
router.get('/addemployee',methodsController.isLoggedIn,methodsController.isOwnerCompany,userController.addemployee);

/* Authenticated Register. */
router.post('/addemployee',methodsController.isLoggedIn,methodsController.isOwnerCompany,(req, res, next) => {
	User.findOne({'email': req.body.email}, function(err, user){
		if (err) {
			return done(err);
		}
		if (user) {
			return done(null, false, {message: ' Email is already in use'});
		}

		User.findOne({'username': req.body.username}, function(err, user){
			if (err) {
				return done(err);
			}

			if (user) {
				return done(null, false, {message: ' Username is already in use'});
			}
			let newUser = new User();
			newUser.fname 			= req.body.fname;
			newUser.lname 			= req.body.lname;
			newUser.email 			= req.body.email;
			newUser.username 		= req.body.username;
			newUser.phone 			= req.body.phone;
			newUser.birthday 		= req.body.birthday;
			newUser.gender 			= req.body.gender;
			newUser.rule_id 		= req.body.job;
			newUser.password 		= newUser.encryptPassword(req.body.password);
			newUser.save();
			res.redirect('/account/employees')
		});
	});

});

//update Employee
var multer        = require('multer')
//var upload        = multer({ dest: 'filesUploaded/' });
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/filesUploaded')
  },
  filename: function (req, file, cb) {
    var extension = file.mimetype;
    extension = extension.substring(extension.indexOf("/")+1, extension.length);
    cb(null, req.params.id+'.'+extension)
  }
})
 
var upload = multer({ storage: storage });


router.get('/setting/:id',methodsController.isLoggedIn, function(req, res){
	User.findOne({_id: req.params.id}, function(err, user) {
		if (err) {
		   throw err;
		}

		res.render('profile/settings',{user:user});
	  });
});

router.post('/setting/:id', upload.any(), methodsController.isLoggedIn, function(req, res){
	var path =req.files[0].path.slice(7);

	var updateUser = new User();
	if(req.body.password){
		var pass = updateUser.encryptPassword(req.body.password);
	}
	User.findOneAndUpdate({_id:req.params.id},
		{
			$set: {
				fname			: 	req.body.fname,
				lname			:		req.body.lname,
				username	: 	req.body.username,
				email			: 	req.body.email,
				phone			: 	req.body.phone,
				picture   : 	path,
				password	: 	pass,
				birthday	: 	req.body.birthday,
			}
		}, null, function(err){
		if (err) {
		  throw err;
		}
		res.redirect('/account/profile');
	  });
});

//Find All Employees in company
router.get('/employees',methodsController.isLoggedIn,methodsController.isOwnerCompany, function(req, res){
	if(req.user && methodsController.isLoggedIn){
		User.findOne({email: req.user.email}, function(err, user) {
		  if (err) {
			 throw err;
		  }
		  User.find({}, function(err, users) {
			if (err) {
			   throw err;
			}
			Rule.find({}, function(err, rules){
				if(err) {throw err;}
				res.render('profile/employees',{users:users, rules:rules, user:user});
			});
		  });
		});
	  }
});


//logout user
router.get('/logout', methodsController.isLoggedIn ,userController.userLogout);

router.use('/', methodsController.notLoggedIn, function(req, res, next) {
  next();
});



/* GET Login Page. */
router.get('/login', userController.login);

/* Authenticated Login*/
router.post('/login', passport.authenticate('local.signin', {
		successRedirect: '/account/profile',
		failureRedirect: '/account/login',
		failureFlash: true
}));



module.exports = router;
