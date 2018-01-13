// router is setting the routes!
const router = require('express').Router();

const passport = require('passport');

let mainController = require('../controllers/mainController');

let authenticateUser = (req,res,next)=>{
	if(req.isAuthenticated()) return next();

	res.redirect('/');
};

//landing page for router.  Login functionality, checks if there's a session in play and allows for a new session search queries.
router.get('/',(req,res)=>{
	res.send('you got here!');
});

router.route('/signup')
	.get(mainController.getSignup)
	.post(mainController.postSignup);

router.route('/login')
	.get(mainController.getLogin)
	.post(mainController.postLogin);

//req.session.passport.user.id FTW!
router.route('/newSession')
	 .get(authenticateUser, mainController.getNewSession);

 router.route('/Restaurants/:id')
 	.delete(authenticateUser, mainController.deleteRestaurants);

 //Main functional page of the app.  Will detect user and display appropriate information.  If not that user's turn will display Shakeitspeare poems(Stretch).
//Needs to determine how many restaurants there are.  If >5, reduce to 5.  If >2, reduce to 2.  If >1, reduce to 1.  If 1, That's where you go!
router.route('/Restaurants')
 	.get(authenticateUser, mainController.getRestaurants);

router.route('/logout')
	.get(mainController.getLogout);

//catch all bad pages
router.route('*')
	.get(mainController.getBadRoutes);


module.exports = router;