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
var map;

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

	var infoWindow = new google.maps.InfoWindow({
		content: ""
	});

	for (var i = 0; i < lineToStations[lineName].length; i++) {
		var stationName = lineToStations[lineName][i]['name'];

		var marker = new google.maps.Marker({
			position: lineToStations[lineName][i]['loc'],
			map: map,
			title: stationName,
			icon: tIcon
		});
		marker.setMap(map);

		google.maps.event.addListener(marker, 'click', function() {
			infoWindow.close();
			infoWindow.setContent(generateInfoWindowContent(this.title)); // title is the station name
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
	return content.outerHTML;
}

// "destination" => [time 1 (in seconds), time 2,...]
function getUpcomingArrivalTimes(stationName) {
	var arrivalTimes = {};
	for (var tripIdx = 0; tripIdx < schedule.length; tripIdx++) {
		var trip = schedule[tripIdx];
		var dest = trip['Destination'];

		for (var stopIdx = 0; stopIdx < trip['Predictions'].length; stopIdx++) {
			var stop = trip['Predictions'][stopIdx];
			// See if the station starts with desired stationName - there's a few discrepancies:
			// "Central" vs. "Central Square"
			// Tufts is spelled wrong (Tuffs) too. (wow)
			// TODO: pick a consistent station naming scheme
			if (stop['Stop'].slice(0, stationName.length) == stationName) {
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

function minuteStringFromSeconds(sec) {
	var str = "";
	if (sec < 0) {
		str += "-";
		sec *= -1;
	}

	min = Math.floor(sec/60);
	s = sec % 60
	str += min + ":" + ((s<10) ? "0" : "") + s
	return str;
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

	var halfOfRedLineStops = ['Alewife', 'Davis', 'Porter', 'Harvard', 'Central', 'Kendall', 'Charles/MGH', 'Park Street', 'Downtown Crossing'];

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

	var halfOfOrangeLineStops = ['Oak Grove', 'Malden Center', 'Wellington', 'Sullivan Square', 'Community College', 'North', 'Haymarket', 'State', 'Downtown Crossing'];
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
