let mongoose = require('mongoose');
let bcrypt = require('bcrypt');
let Schema = mongoose.Schema;

//Why don't we model this?  Will figure out later
	//partner will be another user's id.  this should be better for the purpose of this app as it allows for some permanence.  
	//Otherwise I could make a collection that requires 2 ids.
let UserSchema = new Schema({
	email: String,
	password: String,
	partner: String
});

//taking out b/c passport doesn't model and it is messing with the methods portion.  I think the schema needs the methods not the model but I don't know why
// let User = mongoose.model('User',UserSchema);

//using Async versions to ensure no issues with interupting other server operations
UserSchema.pre('save',function(next){
	var user = this;
	console.log("User is:",user);
	if(!user.isModified('password')) return next();

	bcrypt.genSalt(function(err, salt){
		if(err) return next(err);
		console.log("salt:",salt);
		bcrypt.hash(user.password, salt, function(err, hash){
			if(err) return next(err);
			console.log("hash:",hash);
			user.password = hash;
			console.log('successfully created a hashed userPW');
			next();
		});
	});
});

UserSchema.methods.authPW =function(passwordAttempt, callback){
	console.log("Authorizing PW!");
	console.log("Attempt:", passwordAttempt);
	console.log("this",this);
	bcrypt.compare(passwordAttempt,this.password,function(err, isValid){
		if(err) callback(err);
		callback(null, isValid);
	});
};

let User = mongoose.model('User', UserSchema);

module.exports = User;
