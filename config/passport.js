//local vs facebook vs google
let LocalStrategy = require('passport-local').Strategy;
let db = require('../models');
let User = db.User;
let Couple = db.Couple;

module.exports = function(passport){
	passport.serializeUser(function(user,callback){
		callback(null,user.id);
	});

	passport.deserializeUser(function(id,callback){
		User.findById(id, function(err,user){
			callback(err, user);
		});
	});

	passport.use('local-signup', new LocalStrategy({
		usernameField: 'email',
		//not required, but just for learning's sake.  PasswordField's default is password
		passwordField: 'password',
		passReqToCallback: true
	}, function(req, email, password, callback){
		User.findOne({'email':email}, function(err,user){
			if(err) return callback(err);

			if(user){
				return callback(null, false, req.flash('signupMessage', 'Email already in Use'));
			} else{
				let newUser = new User();
				newUser.email = email;
				newUser.password = password;
				newUser.save((err)=>{
					if(err) return callback(err);
					//if there is a couple created, user 2 is temporarily stored as email(identified by user1).  Once found converted to id.
					Couple.findOne({user2:newUser.email}, function(err, couple){
						if(err) return callback(err);
						if(couple){
							couple.user2 = newUser._id;
							couple.save((err)=>{
								if(err)return console.log("Error in saving Couple", err);
							});
							newUser.couple = couple._id;
							newUser.save((err=>{
								if(err) return console.log("error in saving User", err);
								return callback(null, newUser);
							}));
						}else{
							let newCouple = new Couple();
							newCouple.user1 = newUser._id;
							newCouple.user2 = req.body.partner;
							newCouple.whosTurn = newUser._id;
							newCouple.save((err)=>{
								if(err) return console.log("error in creating new couple", err);
							});
							newUser.couple = newCouple._id;
							newUser.save((err)=>{
								if(err) return console.log("error in saving newUser CoupleId",err);
								return callback(null, newUser);
							});
						}
					});
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

			user.authPW(password,(err,isMatch)=>{
				if(err) return callback(err);
				if(!isMatch) callback(null, false, req.flash('signupMessage', 'Incorrect Password'));
				return callback(null, user);
			});
		});
	}));
};