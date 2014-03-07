function onPageLoad() {
	var mapOptions = {
	  center: new google.maps.LatLng(42.3581, -71.0636),
	  zoom: 14
	};
	var map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
}