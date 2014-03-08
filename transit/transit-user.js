function getUserLocation(successCallback) {
	if (navigator.geolocation) { // the navigator.geolocation object is supported on your browser
		navigator.geolocation.getCurrentPosition(function(position) {
			lat = position.coords.latitude;
			lon = position.coords.longitude;
			successCallback(lat, lon);
		});
	}
	else {
		alert("Geolocation is not supported by your web browser.  What a shame!");
	}
}

function displayUser(lat, lon) {
	userLoc = new google.maps.LatLng(lat, lon);
	map.panTo(userLoc);

	var marker = new google.maps.Marker({
		position: userLoc,
		map: map,
		title: "user"
	});
	marker.setMap(map);

	google.maps.event.addListener(marker, 'click', function() {
		infoWindow.close();
		infoWindow.setContent(generateInfoWindowContent(this.title)); // title is the station name or "user"
		infoWindow.open(map,this);
	});

	openUserInfoWindow(map, marker);

}

function openUserInfoWindow(map, marker) {
	if (typeof line === 'undefined') {
		setTimeout(function() { openUserInfoWindow(map, marker) }, 1000);
	}
	else {
		infoWindow.setContent(generateInfoWindowContent("user"));
		infoWindow.open(map, marker);
	}
}

function findClosestStation(line, lat, lon) {
	var stations = lineToStations[line];

	var closest_dist = 100000000;
	var closest_station = {};
	for (var i = 0; i < stations.length; i++) {
		var s = stations[i];
		var dist = calcHaversine(s['loc'].lat(), s['loc'].lng(), lat, lon);
		if (dist < closest_dist) {
			closest_station = s;
			closest_dist = dist;
		}
	}
	return closest_station;
}

function generateUserInfoWindowContent() {
	var closestStation = findClosestStation(line, userLoc.lat(), userLoc.lng());
	var c = "<p>I am here at: " + userLoc.lat().toFixed(8) + ", " + userLoc.lng().toFixed(8) + "</p>";
	c += "<p>The closest T station is: " + closestStation['name'];
	c += " which is " +
		calcHaversine(userLoc.lat(), userLoc.lng(), closestStation['loc'].lat(), closestStation['loc'].lng()).toFixed(3)
		+ " miles away.</p>";
	return c;
}
