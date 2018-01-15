let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let Restaurant = require('./restaurant');

let CoupleSchema = new Schema({
	user1: String,
	user2: String,
	whosTurn: String,
	favorites: [Restaurant.schema]
});

CoupleSchema.methods.whosUp = function(){
	return this.whosTurn;
};

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
	this.favorites.push(Restaurant);
};

let Couple = mongoose.model('Couple', CoupleSchema);

module.exports = Couple;