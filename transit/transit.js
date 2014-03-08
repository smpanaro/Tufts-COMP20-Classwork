var lineToCoordLists = {
	"red": redLineCoordinates,
	"blue": blueLineCoordinates,
	"orange": orangeLineCoordinates,
	"green": greenLineCoordinates,
	"silver": silverLineCoordinates
};
var lineToStations = {
	"red": redLineStations,
	"blue": blueLineStations,
	"orange": orangeLineStations,
	"green": greenLineStations,
	"silver": silverLineStations
};
var lineToColor = {
	"red": "#FA2D27",
	"blue": "#2F5DA6",
	"orange": "#FD8A03",
	"green": "#008150",
	"silver": "#9A9C9D"
};
var line;
var schedule;

var infoWindow;
var map;

var userLoc;

// Set debug to true, and debugLine to "orange", "red", or "blue"
// to force the appearance of that line.
var debug = false;
var debugLine = "orange";

function onPageLoad() {
	var mapOptions = {
	  center: new google.maps.LatLng(42.3581, -71.0636),
	  zoom: 14
	};
	map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);

	makeRodeoRequest(function(responseText) {
		var rodeoObj = JSON.parse(responseText);
		line = rodeoObj['line'];
		schedule = rodeoObj['schedule'];

		displayTLine(rodeoObj['line']);
		displayTStations(rodeoObj['line']);
	});

	getUserLocation(displayUser);

	// displayAllLines();
	// displayAllStations();
}

function displayTLine(lineName) {
	var colorWeight = 2.7;

	for (var i = 0; i < lineToCoordLists[lineName].length; i++) {
		if (lineName == "silver" || lineName == "orange") {
			var subwayBorderPath = new google.maps.Polyline({
				path: lineToCoordLists[lineName][i],
				geodesic: true,
				strokeColor: "#575757",
				strokeOpacity: 1.0,
				strokeWeight: colorWeight
			});
			subwayBorderPath.setMap(map);
		}

		var subwayPath = new google.maps.Polyline({
			path: lineToCoordLists[lineName][i],
			geodesic: true,
			strokeColor: lineToColor[lineName],
			strokeOpacity: 1.0,
			strokeWeight: (lineName == "silver" || lineName == "orange") ? colorWeight - 1 : colorWeight
		});

		subwayPath.setMap(map);
	}
}

function displayTStations(lineName) {
	var tIcon = {
		url: "t-marker.png",
		scaledSize: new google.maps.Size(20, 40)
	};

	infoWindow = new google.maps.InfoWindow({
		content: ""
	});

	for (var i = 0; i < lineToStations[lineName].length; i++) {
		var stationName = fixStationName(lineToStations[lineName][i]['name']);

		var marker = new google.maps.Marker({
			position: lineToStations[lineName][i]['loc'],
			map: map,
			title: stationName,
			icon: tIcon
		});
		marker.setMap(map);

		google.maps.event.addListener(marker, 'click', function() {
			infoWindow.close();
			infoWindow.setContent(generateInfoWindowContent(this.title)); // title is the station name or "user"
			infoWindow.open(map,this);
		});
	}
}

function displayAllLines() {
	for (lineName in lineToCoordLists) {
		displayTLine(lineName);
	}
}

function displayAllStations() {
	for (lineName in lineToCoordLists) {
		displayTStations(lineName);
	}
}

// Make a request to the rodeo url. We know that sometimes it 500s, so retry in that case.
function makeRodeoRequest(successCallback) {
	var rodeoUrl = "http://mbtamap.herokuapp.com/mapper/rodeo.json";

	var request;

	// Create a request, even if we're in IE.
	try {
	  request = new XMLHttpRequest();
	}
	catch (ms1) {
		try {
			request = new ActiveXObject("Msxml2.XMLHTTP");
		}
		catch (ms2) {
			try {
				request = new ActiveXObject("Microsoft.XMLHTTP");
			}
			catch (ex) {
				request = null;
			}
		}
	}
	if (request == null) {
		alert("Error creating request object --Ajax not supported?");
		return;
	}

	request.open('get', rodeoUrl);
	request.onreadystatechange = function() {
		if (request.readyState == 4) {
			if(request.status == 200) {
				if (debug && JSON.parse(request.responseText)['line'] != debugLine) {
					self.setTimeout(makeRodeoRequest(successCallback), 100);
					return;
				}
				successCallback(request.responseText);
			}
			// We are expecting the server to err sometimes, so retry when that happens.
			else if (request.status == 500) {
				// console.log("Request failed with status code: " + request.status + "\nbody: " + request.responseText);
				setTimeout(makeRodeoRequest(successCallback), 100);
			}
		}
	};
	request.send(null);
}

// Generate an DOM tree containing the information to be displayed in the info window.
function generateInfoWindowContent(stationName) {
	if (stationName == "user") {
		var closestStation = findClosestStation(line, userLoc.lat(), userLoc.lng());
		var c = "<p>I am here at: " + userLoc.lat().toFixed(8) + ", " + userLoc.lng().toFixed(8) + "</p>";
		c += "<p>The closest T station is: " + closestStation['name'];
		c += " which is " +
			calcHaversine(userLoc.lat(), userLoc.lng(), closestStation['loc'].lat(), closestStation['loc'].lng()).toFixed(3)
			+ " miles away.</p>";
		return c;
	}

	var content = document.getElementById('info-content-template').cloneNode(true);
	content.removeAttribute('id');

	// Set station name.
	getFirstElementByClass(content, 'p', 'station-title').textContent = stationName;

	var arrivalTimes = getUpcomingArrivalTimes(stationName);

	var directionGroupTemplate = content.getElementsByTagName('div')[0];
	content.removeChild(directionGroupTemplate);

	// Display the direction and times for each end destination.
	for (destination in arrivalTimes) {
		var destGroup = directionGroupTemplate.cloneNode(true);

		var destNameElem = getFirstElementByClass(destGroup, 'p', 'destination-name');
		destNameElem.textContent = destination;

		var directionElem = getFirstElementByClass(destGroup, 'p', 'destination-direction');
		switch(getDirection(line, stationName, destination)) {
			case "inbound":
				directionElem.textContent = "INBOUND to";
				break;
			case "outbound":
				directionElem.textContent = "OUTBOUND to";
				break;
			default:
				directionElem.textContent = "HEADED to";
		}

		var timeTemplate = getFirstElementByClass(destGroup, 'p', 'destination-time');
		destGroup.removeChild(timeTemplate);

		for (var timeIdx = 0; timeIdx < arrivalTimes[destination].length; timeIdx++) {
			var newTimeElem = timeTemplate.cloneNode(true);
			newTimeElem.textContent = minuteStringFromSeconds( arrivalTimes[destination][timeIdx] );
			destGroup.appendChild(newTimeElem);
		}
		content.appendChild(destGroup);
	}
	if (Object.keys(arrivalTimes).length > 0) {
		var noDataElem = getFirstElementByClass(content, 'p', 'no-data-message');
		content.removeChild(noDataElem);
	}

	return content.outerHTML;
}

// "destination" => [time 1 (in seconds), time 2,...]
function getUpcomingArrivalTimes(stationName) {
	console.log("get arrivals for: " + stationName);
	var arrivalTimes = {};
	for (var tripIdx = 0; tripIdx < schedule.length; tripIdx++) {
		var trip = schedule[tripIdx];
		var dest = fixStationName(trip['Destination']);
		// console.log("dest: " + dest)

		for (var stopIdx = 0; stopIdx < trip['Predictions'].length; stopIdx++) {
			var stop = trip['Predictions'][stopIdx];
			var stopName = fixStationName(stop['Stop']);
			if (stopName == stationName) {
				if (arrivalTimes.hasOwnProperty(dest) == false) arrivalTimes[dest] = [];
				arrivalTimes[dest].push(stop['Seconds']);
			}
		}
	}

	for (destination in arrivalTimes) {
		// Sort by arrival time. By default, JavaScript sorts by character.
		arrivalTimes[destination].sort(function (x, y) { return x - y; });
	}

	return arrivalTimes;
}

function getFirstElementByClass(node, tagName, className) {
	var matchingElems = node.getElementsByTagName(tagName);
	for (var i = 0; i < matchingElems.length; i++) {
		if (matchingElems[i].className == className) return  matchingElems[i];
	}
	return null;
}

function minuteStringFromSeconds(totalSeconds) {
	var sign = ""
	if (totalSeconds < 0) {
		sign = "-";
		totalSeconds *= -1;
	}

	min = Math.floor(totalSeconds/60);
	secs = totalSeconds % 60
	return sign + min + ":" + ((secs<10) ? "0" : "") + secs
}

// Returns "inbound", "outbound" or "neither"
function getDirection(lineName, stationName, destinationName) {
	// This is not well defined for the center city stops.
	// Inbound is always toward downtown Boston, and Outbound is away from it.
	// In the subway system, Inbound is toward four stations:
	//   Park Street, State, Downtown Crossing and Government Center.
	// (Within those four stations, Inbound and Outbound are not used.)

	var inbound = "inbound";
	var outbound = "outbound";
	var neither = "neither";

	var halfOfRedLineStops = ['Alewife', 'Davis', 'Porter', 'Harvard', 'Central', 'Kendall/MIT', 'Charles/MGH', 'Park Street', 'Downtown Crossing'];

	if (lineName.toUpperCase() == "RED") {
		console.log("stat: " + stationName)
		var loc = halfOfRedLineStops.indexOf(stationName);
		console.log(loc)
		if (loc == -1) return (destinationName == 'Alewife') ? inbound : outbound;
		else if (loc < halfOfRedLineStops.indexOf('Park Street')) return (destinationName == "Alewife") ? outbound : inbound;
		else return neither;
	}

	var halfOfBlueLineStops = ['Bowdoin', 'Government Center'];
	if (lineName.toUpperCase() == "BLUE") {
		console.log("stat: " + stationName)
		var loc = halfOfBlueLineStops.indexOf(stationName);
		console.log(loc)
		if (loc == -1) return (destinationName == 'Bowdoin') ? inbound : outbound;
		else return neither;
	}

	var halfOfOrangeLineStops = ['Oak Grove', 'Malden Center', 'Wellington', 'Sullivan', 'Community College', 'North Station', 'Haymarket', 'State', 'Downtown Crossing'];
	if (lineName.toUpperCase() == "ORANGE") {
		console.log("stat: " + stationName)
		var loc = halfOfOrangeLineStops.indexOf(stationName);
		console.log(loc)
		if (loc == -1) return (destinationName == 'Oak Grove') ? inbound : outbound;
		else if (loc < halfOfOrangeLineStops.indexOf('Downtown Crossing')) return (destinationName == "Oak Grove") ? outbound : inbound;
		else return neither;
	}

	return neither;
}

// Fix inconsistencies between different sources of data for T station names.
// Known inconsistencies:
// - Sullivan, Jackson have a trailing space
// - Central, Porter, Harvard, Jackson, Sullivan sometimes have "Square" attached, this is removed.
// - State Street => State
function fixStationName(name) {
	if (name == "State Street") name = "State";
	if (name == "Tufts Medical") name = "Tufts Medical Center";
	if (name == "Massachusetts Ave") name = "Mass Ave";
	return name.replace("Square", "").trim();
}

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

// Returns distance in miles.
function calcHaversine(lat1, lon1, lat2, lon2) {
	function toRad(x) {
		return x * Math.PI / 180;
	}

    var R = 6371; // km
    var dLat = toRad(lat2-lat1);
    var dLon = toRad(lon2-lon1);
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
                    Math.sin(dLon/2) * Math.sin(dLon/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c;

    return d*0.621371192; // convert from km to miles
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
