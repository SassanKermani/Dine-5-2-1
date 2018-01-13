// let auths = require('./config/env');
const express = require('express');
const app = express();
const path = require('path');
const passport = require('passport');
const flash = require('connect-flash');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const session = require('express-session');
const router = require('./config/routes');



//using morgan in dev mode to log every route request.  Hopefully it will help me find out where I break things
app.use(morgan('dev'));

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//setting up ejs
app.set('views', path.join(__dirname, 'views'));
app.engine('ejs',require('ejs').renderFile);
app.set('view engine', 'ejs');

//sends up css files to users
app.use(express.static('public'));

//Session is used to genereate a hash.  Users denied without the secret.
//sets up passport
app.use(session({ secret: 'This is a long string of stuff to generate a hash' })); 
app.use(passport.initialize());
app.use(passport.session()); 
app.use(flash());


// //basically, perform the passport.js function, which assigns authorization/authentication functionality
require('./config/passport')(passport);

// //asigning currentUser
// app.use((req,res,next)=>{
// 	res.locals.currentUser = req.user;
// 	next();
// });


app.use('/', router);


//Server starting up
app.listen(process.env.PORT || 3000, ()=>{
	console.log("Potato Server is running on port", process.env.port || 3000);
});
