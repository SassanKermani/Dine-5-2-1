let mongoose = require('mongoose');
let bcrypt = require('bcrypt');
let Schema = mongoose.Schema;

//Why don't we model this?  Will figure out later
let User = new Schema({
	user: String,
	password:String,
	//partner will be another user's id.  this should be better for the purpose of this app as it allows for some permanence.  
	//Otherwise I could make a collection that requires 2 ids.
	partner: String
});

//taking out b/c passport doesn't model and it is messing with the methods portion.  I think the schema needs the methods not the model but I don't know why
// let User = mongoose.model('User',UserSchema);

//using Async versions to ensure no issues with interupting other server operations
User.methods.encrypt = function(password){
	bcrypt.genSalt(function(err, salt){
		if(err) console.log('There has been an error making Salt:',err);
		bcrypt.hash(password, salt, function(err,hash){
			if(err) console.log('There has been an error making Hash:',err);
			this.password = hash;
		});
	});
};

User.methods.authPW =function(passwordAttempt){
	bcrypt.compare(passwordAttempt,this.password,function(err, result){
		return result;
	});
};