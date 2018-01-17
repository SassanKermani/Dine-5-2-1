$(document).ready(()=>{
	//reloads page every 15 seconds.  If it is the user's turn it will redirect them to removeRestaurants(on the back end)
	setInterval(function(){
		location.reload();
	}, 15000);
});
