let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let Restaurant = require('./restaurant');

let CoupleSchema = new Schema({
	user1: String,
	user2: String,
	whosTurn: String,
	favorites: [Restaurant.schema]
});

//hotfix to ensure an unregistered user 2 won't break the app
CoupleSchema.methods.whosUp = function(){
	if(this.whosTurn === this.user1){
		console.log('User 1 Is Up');
		return this.whosTurn;
	} else{
		console.log('User 2 is Up');
		return this.user2;
	}
	
};

//changes starting user.  need to SAVE after calling this or it reverts.
CoupleSchema.methods.swap = function(){
	if (this.whosTurn===this.user1){
		console.log('User 1 turn is over.  User 2 is up');
		this.whosTurn = this.user2;
	} else{
		console.log('User 2 turn is over.  User 1 is up');
		this.whosTurn = this.user1;
	}
};

CoupleSchema.methods.addToFavorites = function(Restaurant){
	console.log('adding restaurant',Restaurant.name,'to favorites!');
	//probably need to update this Restaurant's ID to fav+_id...  maybe connect and disconnect to save it?
	this.favorites.push(Restaurant);
};

let Couple = mongoose.model('Couple', CoupleSchema);

module.exports = Couple;