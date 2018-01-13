//local vs facebook vs google
let LocalStrategy = require('passport-local').Strategy;
let User = require('../models').User;

module.exports = (passport)=>{
	passport.serializeUser((user,callback)=>{
		callback(null,user.id);
	});

	passport.deserializeUser((id,callback)=>{
		User.findById(id, (err,user)=>{
			callback(err, user);
		});
	});

	passport.use('local-signup', new LocalStrategy({
		usernameField: 'email',
		//not required, but just for learning's sake.  PasswordField's default is password
		passwordField: 'password',
		passReqToCallback: true
	}, (req, email, password, callback)=>{
		User.findOne({'email':email}, (err,user)=>{
			if(err) return callback(err);

			if(user){
				return callback(null, false, req.flash('signupMessage', 'Email already in Use'));
			} else{
				let newUser = new User();
				newUser.email = email;
				console.log(password);
				console.log(newUser.encrypt(password));
				newUser.password = newUser.encrypt(password);

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
			if(err) return callback(err);

			if(!user){
				return callback(null, false, req.flash('signupMessage', 'Email not found, please sign up'));
			}

			if(!User.authPW(password)){
				return callback(null, false, req.flash('signupMessage', 'Incorrect Password'));
			}

			return callback(null, user);
		});
	}));
};