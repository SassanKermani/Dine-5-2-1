$(document).ready((blah)=>{
	console.log('removeRestaurants up and running');
	let restaurantsToDelete = [];

	//determines the number of restaurants send back from the server.  App logic depends on this.  Break case is only 5 were found initially.  Refactor later
	let numRestaurants = $('.card').length;
	console.log("The Number of Restaurants is",numRestaurants);

	//figures out how many card need to be left for this round of play
	if(numRestaurants === 1){
		//SWITCH IT UP BRO!
	}else{
		console.log("Howdy",numRestaurants);
		if(numRestaurants>5){
			var numToLeave = 5;
		}else{
			var numToLeave = 2;
		}
	$('#numToLeave').text(numToLeave);
	}
	console.log("NumToLeavePotato:",numToLeave);
	$('button').click(function(){
		console.log(this,'button clicked!');
		console.log($(this).closest('.cardContainer'),'is the closest card container!');
		console.log($(this).closest('.cardContainer').data('restaurant-id'));
	});
	// console.log(typeof($('button')));
	// $('.cardContainer').on('click', 'button',(e)=>{
	// 	console.log('button clicked!');
	// 	console.log(this);
	// 	console.log(e.target);
	// });
});