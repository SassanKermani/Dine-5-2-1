$(document).ready((blah)=>{
	let restaurantsToDelete = [];

	//determines the number of restaurants send back from the server.  App logic depends on this.  Break case is only 5 were found initially.  Refactor later
	let numRestaurants = $('.card').length;

	//figures out how many card need to be left for this round of play.  If 1 redirects to /eatHere
	if(numRestaurants === 1){
		window.location.replace('/eatHere');
	}else{
		if(numRestaurants>5){
			var numToLeave = 5;
		}else{
			var numToLeave = 2;
		}
	$('#numToLeave').text(numToLeave);
	}

	$('button').click(function(){
		$.ajax({
			url: '/Restaurants/' + $(this).closest('.cardContainer').data('restaurant-id'),
			type: 'DELETE',
			success: ()=>{
				$(this).closest('.cardContainer').remove();
				if($('.card').length ===5 || $('.card'.length ===2)){
					location.reload(true);
				}else if($('.card'.length ===1)){
					location.reload(true);
				}
			}
		});
	});
});