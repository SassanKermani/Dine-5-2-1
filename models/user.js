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
UserSchema.methods.encrypt =(password)=>{
	return bcrypt.hashSync(password, bcrypt.genSaltSync());
	// this is causing an async error.  Refactor later but get running thru sync right now
	// bcrypt.genSalt((err, salt)=>{
	// 	if(err) console.log('There has been an error making Salt:',err);
	// 	console.log("salt:",salt);
	// 	bcrypt.hash(password, salt, (err, hash)=>{
	// 		if(err) console.log('There has been an error making Hash:',err);
	// 		console.log("hash:",hash);
	// 		return hash;
	// 	});
	// });
};

UserSchema.methods.authPW =(passwordAttempt)=>{
	return bcrypt.compareSync(passwordAttempt,this.password);
};

let User = mongoose.model('User', UserSchema);

module.exports = User;
