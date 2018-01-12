let mongoose = require('mongoose');
let Restaurant = require('./restaurant');
let User = require('./user');

//this should allow for the heroku instance of mongo to take over.  If local, local will take over.
mongoose.connect( process.env.MONGODB_URI || 
                  process.env.MONGOLAB_URI || 
                  process.env.MONGOHQ_URL || 
                  "mongodb://localhost/dine5-2-1");

module.exports.Restaurant = Restaurant;
module.exports.User = User;