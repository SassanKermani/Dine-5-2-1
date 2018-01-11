
//Fluff:
//What am I making?  An app to help decide where to eat
//Why am I making it in the first place?  Because couples have a hard time deciding where to eat
//Why would people use it?  Couples need assistance deciding where to eat
//What kind of people will use it?  Couples who can't decide what to eat
//How do I make it the best resource for them?  Keep it simple, stupid!

//Features:
//Users will be able to call restaurants based on location and price criteria.
//App will call the yelp API and get a list of ~30-50 restaurants and display to screen
//Users will reduce this list to 5, then be prompted to hand control to their partner
//Next user will reduce list to 2, then be prompted again
//Original user will reduce to the restaurant you're going to.  
//Control will be handed over via the app?


//This will provide JSON Restaurant Data
	let options = {
		url: 'https://api.yelp.com/v3/businesses/search?location=12955+Lafayette+St,Thornton,Co,80241&radius=8000&price=1,2,3&sort_by=rating&term=food&open_now=true&limit=50',
		auth:{
			bearer: bearerToken
		}
	};
	request.get(options, (err, reqApi, body)=>{
		if(err) console.log('there has been an error', err);
		let restaurantData = JSON.parse(body);
		console.log('we got info back!');
		console.log(restaurantData);
		res.send(restaurantData);
	});