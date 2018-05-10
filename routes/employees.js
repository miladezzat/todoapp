var express               = require('express');
var router                = express.Router();
var User                  =	require('../models/user.js');
var Rules                  =	require('../models/rules.js');
//All methods for control users
var methodsController     = require("../controllers/methods");
var Project               = require("../models/projects");

/* GET home page. */
router.get('/employeeprofile',methodsController.isLoggedIn, function(req, res, next) {
  User.findOne({email: req.user.email}, function(err, user) {
    if (err) {
       throw err;
    }
    Rules.findOne({ruleid: user.rule_id}, function(error, rule){
      if(error) {
        throw error;
      }
      Project.findOne({projectManagerId: user._id}, function(err2, project){
        res.render('profile/employees/employeeProfile', { title: 'IT Task Manager', user: user});
      });
    });    
  });
});

router.get('/projects', function(req,res,next){
  User.findOne({email: req.user.email}, function(err, user) {
    if (err) {
       throw err;
    }
    Project.find({projectManagerId: user._id}, function(err, projects){
      res.render('profile/employees/projects',{title:'ITC Task Manager', projects: projects, user:user});
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
        
        var teamMembersId = project.employees;

        var temaMembers = new Array();
        
        for (let index = 0; index < teamMembersId.length; index++) {
          User.findOne({ _id: teamMembersId[index]}, function(error3, member){
            
            temaMembers.push(member);
      
            if (teamMembersId.length == temaMembers.length){
              res.render('profile/employees/projectDetails',{title: 'IT Task Manager',project: project, manager: manager, user:user, temaMembers:temaMembers});
            }
          });
        }

      });
    });
  });
});

//update project
router.get('/projectUpdate/:id', function(req, res, next){
  User.findOne({email: req.user.email}, function(err, user) {
    Project.findOne({_id: req.params.id}, function(err, project){
      if (err) {
        throw err;
      }
      User.findOne({_id:project.projectManagerId}, function(err, manager){
        if(err) {
          throw err;
        }
        User.find({}, function(err, employees){
          res.render('profile/employees/projectUpdate',{title: 'IT Task Manager',project: project, manager: manager, employees:employees, user: user});
        });
      });
    });
  });
});
router.post('/projectUpdate/:id', function(req, res, next){
  console.log(req.body.employees[0]);
  
  Project.findOneAndUpdate({_id:req.params.id},
		{
			$set: {
        projectName			: 	req.body.projectName,
				startDate			  :		req.body.startDate,
				endDate	        : 	req.body.endDate,
				employees			  : 	req.body.employees,
			}
		}, null, function(err){
		if (err) {
		  throw err;
		}
		res.redirect('/employees/employeeprofile');
	  });
});
module.exports = router;
