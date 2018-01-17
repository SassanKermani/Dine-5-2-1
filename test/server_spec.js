let expect = require('chai').expect;
let request = require('request');
let bearerToken = require('../config/env').bearerToken;

let options = {
	//removing &radius=8000 to see if i get better results
	url: 'https://api.yelp.com/v3/businesses/search?location=denver,colorado&price=1,2,3,4&sort_by=rating&term=food&open_now=true&limit=25',
	auth:{
		bearer: bearerToken
	}
};

describe('Yelp API Call', function(){
	var yelpError;
	var yelpResponse;
	var yelpBody;
	before(function(done){
		request.get(options,(err, res, body)=>{
			yelpError = err;
			yelpResponse = res;
			yelpBody = JSON.parse(body);
			done();
		});
	});
	it("Shouldn't return an error", function(){
		expect(yelpError).to.not.be.true;
	});
	it("Should return a status Code of 200 Okay", function(){
		expect(yelpResponse.statusCode).to.eq(200);
	});
	it("Should return an array of more than 5 businesses", function(){
		expect(yelpBody.businesses.length).to.be.at.least(6);
	});
	it("Should return restaurants in the general area of the requested location", function(){
		let randChoice = Math.floor(Math.random()*yelpBody.businesses.length);
		expect(yelpBody.businesses[randChoice].location.state).to.eq("CO");
	});
	it("Should return a photo for every restaurant", function(){
		for(let i = 0; i < yelpBody.businesses.length; ++i){
			expect(yelpBody.businesses[i].image_url).to.exist;
		}
	});
});
