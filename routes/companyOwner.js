var express               = require('express');
var router                = express.Router();
var passport	            =	require('passport');
var User                  =	require('../models/user.js');
var Rules                 = require("../models/rules");
var Project               = require("../models/projects");



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
});
 
var upload = multer({ storage: storage });


///////////////////////
//The user is admin or not
function isOwnerCompany (req, res, next){
  User.findOne({email: req.user.email}, function(err, results) {
    if (err) {
      throw err;
    }
    if (results.rule_id === '0' ) {
      return next();
    } 
    res.redirect('/')
  });
}



//import the controller of users
var userController        = require("../controllers/userController");

//All methods for control users
var methodsController     = require("../controllers/methods");

//Get Profile of owner company
router.get('/profile',methodsController.isLoggedIn, function(req, res, next) {
  User.findOne({email: req.user.email}, function(err, user) {
    if (err) {
       throw err;
    }
    res.redirect('/employees/employeeprofile');
  });
});

//Get Employees Page
router.get('/employees', methodsController.isLoggedIn,isOwnerCompany,function(req, res, next) {
  User.findOne({email: req.user.email}, function(err, user) {
    if (err) {
     throw err;
    }
    User.find({}, function(err, users) {
    if (err) {
       throw err;
    }
    Rules.find({}, function(err, rules){
      if(err) {throw err;}
      if(user.rule_id === '0'){
        res.render('profile/companyOwner/employees',{ title:'ITC Task Manager',users:users, rules:rules, user:user});
      } else {
        res.redirect('/');
      }
    });
    });
  });
});

//Add New Employee 
router.get('/addemployee', methodsController.isLoggedIn,isOwnerCompany, function(req, res, next) {  
  User.findOne({email: req.user.email}, function(err, user) {
    if (err) {
       throw err;
    }
    Rules.find({}, function(err, rules){
      if(err) {throw err;}
      if(user.rule_id === '0') {
        res.render('profile/companyOwner/addemployee', { title: 'IT Task Manager', user: user,rules:rules}); 
      } else {
        res.redirect('/')
      }
    });
  });
});

router.post('/addemployee',methodsController.isLoggedIn,isOwnerCompany,(req, res, next) => {
	User.findOne({'email': req.body.email}, function(err, user){
    var errorMessage = '';
    var hasError = false;
    var userfound = {};
		if (err) {
			throw err;
    }
    if (user) {
      errorMessage = "Email is Already Using";
      hasError = true;
      userfound = user;
    }
    
    User.findOne({'username' : req.body.username}, function(err2, user2) {
      if (err2) {
        throw err2;
      } 
      if(user2) {
        errorMessage = "Username is Already Using";
        hasError = true;
        userfound = user2;
      }
      if(hasError) {
        res.render('profile/companyOwner/addemployee', { title:'ITC Task Manager', user: userfound, errorMessage: errorMessage});
      } else {
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
        res.redirect('/companyOwner/employees');
      }
    });

	});

});

//Account Settings
router.get('/setting/:id',methodsController.isLoggedIn, function(req, res, next) {
  User.findOne({_id: req.params.id}, function(err, user) {
		if (err) {
		   throw err;
    }  
		res.render('profile/companyOwner/settings',{title:'ITC Task Manager',user:user});
	  });
});

router.post('/setting/:id', upload.any(), methodsController.isLoggedIn, function(req, res){
  var updateUser = new User();
	if(req.body.password && req.body.password !== null){
    var pass = updateUser.encryptPassword(req.body.password);
    User.findOneAndUpdate({_id:req.params.id},
      {
        $set: {
          password	: 	pass,
        }
      }, null, function(err){
      if (err) {
        throw err;
      }
      });
  }
  if ( req.files[0]) {
    var path = req.files[0].path.slice(7);
    User.findOneAndUpdate({_id:req.params.id},
      {
        $set: {
          picture   : 	path,
        }
      }, null, function(err){
      if (err) {
        throw err;
      }
      });
  }
	User.findOneAndUpdate({_id:req.params.id},
		{
			$set: {
        fname			: 	req.body.fname,
				lname			:		req.body.lname,
				username	: 	req.body.username,
				email			: 	req.body.email,
				phone			: 	req.body.phone,
				birthday	: 	req.body.birthday,
			}
		}, null, function(err){
		if (err) {
		  throw err;
		}
		res.redirect('/companyOwner/profile');
	  });
});

//Add new Prject
router.get('/addproject', methodsController.isLoggedIn,isOwnerCompany ,function(req, res,next ){
  User.findOne({email: req.user.email}, function(err, user) {
    if (err) {
       throw err;
    }
    User.find({}, function(err2, users) {
      if (err2) { throw err2}
      res.render('profile/companyOwner/project',{title: 'ITC Task Manager',user: user, users: users});
    });
  });
});

router.post('/addproject',methodsController.isLoggedIn,isOwnerCompany ,function(req, res, next) {
    var project = new Project();
    project.projectName       = req.body.projectName;
    project.projectManagerId  = req.body.projectManagerId;
    project.startDate         = req.body.startDate;
    project.endDate           = req.body.endDate;
  
    project.save(function(err){
      if (err) {
        throw err;
      }
      res.redirect('/companyOwner/projects');
    });
});

router.get('/projects', function(req,res,next){
  User.findOne({email: req.user.email}, function(err, user) {
    if (err) {
       throw err;
    }
    Project.find({}, function(err, projects){
      res.render('profile/companyOwner/projects',{title:'ITC Task Manager', projects: projects, user:user});
    });
  });
});

///project details
router.get('/details/:id', function(req, res, next){
  User.findOne({email: req.user.email}, function(err, user) {
    Project.findOne({_id: req.params.id}, function(err, project){
      if (err) {
        throw err;
      }
      User.findOne({_id:project.projectManagerId}, function(err, manager){
        if(err) {
          throw err;
        }
        res.render('profile/companyOwner/projectDetails',{title: 'IT Task Manager',project: project, manager: manager, user:user});
      });
    });
  });
});
router.get('/deleteproject/:id', function(req, res, next){
  Project.findOneAndRemove({_id:req.params.id}, function(err){
    if(err){throw err}
    res.redirect('/companyOwner/projects'); 
  });
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
		successRedirect: '/companyOwner/profile',
		failureRedirect: '/companyOwner/login',
		failureFlash: true
}));

router.get('/signup', function(req, res, next){
  res.render('home/signup');
});

router.post('/signup', passport.authenticate('local.signup', {
  successRedirect: '/companyOwner/profile',
  failureRedirect: '/companyOwner/signup',
  failureFlash: true
}));

module.exports = router;
