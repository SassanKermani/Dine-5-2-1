let mongoose = require('mongoose');
let Schema = mongoose.Schema;


//builds a restaurant with the following properties.  Will be defined by Yelp.
let RestaurantSchema = new Schema({
	name: String,
	category: [String],
	cost: Number,
	rating: Number,
	reviews: Number,
	image: String,
	website: String,
	address: String,
	phone: String
});

let Restaurant = mongoose.model('Restaurant',RestaurantSchema);

module.exports = Restaurant;