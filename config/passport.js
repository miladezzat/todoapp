var passport					=	require('passport');
var User						=	require('../models/user');
var LocalStrategy 				=	require('passport-local').Strategy;
var FacebookStrategy 			=	require('passport-facebook').Strategy;

passport.serializeUser(function (user, done) {
	done(null, user.id);
});

passport.deserializeUser(function(id, done){
	User.findById(id, function(err, user) {
		done(err, user);
	});
});

passport.use('local.signup', new LocalStrategy({
	usernameField: 'email',
	passwordField: 'password',
	passReqToCallback: true
}, function(req, email, password, done) {

	req.checkBody('fullName','The fullName field can not emapty.').notEmpty();
	req.checkBody('email','The Email field can not emapty.').notEmpty();
	req.checkBody('email','The Email you entered is invalid, please try again.').isEmail();
	req.checkBody('password','The Email field can not emapty.').notEmpty();

	var errors = req.validationErrors();
	if (errors) {
		var messages = [];
		errors.forEach(function(error){
			messages.push(error.msg);
		});
		return done(null, false, req.flash('error', messages));
	}

	User.findOne({'email': email}, function(err, user){
		if (err) {
			return done(err);
		}
		if (user) {
			return done(null, false, {message: ' Email is already in use'});
		}

		var newUser = new User();
		newUser.fullName 		= req.body.fullName;			
		newUser.email 			= email;			
		newUser.password 		= newUser.encryptPassword(password);
		newUser.save(function (err, result) {
			if (err) {
				return done(err);
			}
			return done(null, newUser);
		});
		
	});

}));

passport.use('local.signin', new LocalStrategy({
	usernameField: 'email',
	passwordField: 'password',
	passReqToCallback: true
}, function(req, email, password, done) {
	req.checkBody('email','The Email field can not emapty.').notEmpty();
	req.checkBody('email','The Email you entered is invalid, please try again.').isEmail();
	req.checkBody('email','Email address must be between 4-100 characters long, please try again.').len({min:4,max:100});

	req.checkBody('password','Password must be between 8-100 characters long, please try again.').len({min:4,max:100});
	var errors = req.validationErrors();
	if (errors) {
		var messages = [];
		errors.forEach(function(error){
			messages.push(error.msg);
		});
		return done(null, false, req.flash('error', messages));
	}

	User.findOne({'email': email}, function(err, user){
		if (err) {
			return done(err);
		}
		if (!user) {
			return done(null, false, {message: ' User Not founded'})
		}
		if (!user.validPassword(password)) {
			return done(null, false, {message: ' Password Not Valid'})
		}
			return done(null, user);
		});
}));
