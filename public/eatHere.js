$(document).ready(()=>{
	$('button').click(function(){
		alert('Added to Favorites!');
		$.post('/favorites', {favorite: $(this).closest('.cardContainer').data('restaurant-id')});
	});
});