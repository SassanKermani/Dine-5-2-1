//local vs facebook vs google
let LocalStrategy = require('passport-local').Strategy;
let User = require('../models').User;

module.exports = function(passport){
	passport.serializeUser(function(user,callback){
		console.log('serializing user');
		callback(null,user.id);
	});

	passport.deserializeUser(function(id,callback){
		console.log('deserializing user');
		User.findById(id, function(err,user){
			callback(err, user);
		});
	});

	passport.use('local-signup', new LocalStrategy({
		usernameField: 'email',
		//not required, but just for learning's sake.  PasswordField's default is password
		passwordField: 'password',
		passReqToCallback: true
	}, (req, email, password, callback)=>{
		User.findOne({'email':email}, function(err,user){
			if(err) return callback(err);

			if(user){
				return callback(null, false, req.flash('signupMessage', 'Email already in Use'));
			} else{
				let newUser = new User();
				newUser.email = email;
				console.log(password);
				newUser.password = password;
				newUser.save((err)=>{
					if(err) return callback(err);
					return callback(null, newUser);
				});
			}
		});
	}));

	passport.use('local-login', new LocalStrategy({
		usernameField: 'email',
		passwordField: 'password',
		passReqToCallback: true
	}, (req, email, password, callback)=>{
		User.findOne({'email': email}, (err, user)=>{
			console.log(user);
			if(err) return callback(err);

			if(!user){
				return callback(null, false, req.flash('signupMessage', 'Email not found, please sign up'));
			}

			user.authPW(password,(err,isMatch)=>{
				if(err) return callback(err);
				if(!isMatch) callback(null, false, req.flash('signupMessage', 'Incorrect Password'));
				return callback(null, user);
			});
		});
	}));
};