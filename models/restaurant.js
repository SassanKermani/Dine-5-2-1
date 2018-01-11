let mongoose = require('mongoose');
let Schema = mongoose.Schema;


//builds a restaurant with the following properties.  Will be defined by Yelp.
let RestaurantSchema = new Schema({
	name: String,
	categories: [String],
	price: String,
	rating: Number,
	reviews: Number,
	image: String,
	website: String,
	address: String,
	phone: String,
	//maybe need to put a coupleId?
});

let Restaurant = mongoose.model('Restaurant',RestaurantSchema);

module.exports = Restaurant;