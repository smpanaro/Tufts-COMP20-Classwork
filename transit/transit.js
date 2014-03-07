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
var map;

function onPageLoad() {
	var mapOptions = {
	  center: new google.maps.LatLng(42.3581, -71.0636),
	  zoom: 14
	};
	map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);

	makeRodeoRequest(function(responseText) {
		// console.log("we done it.");
		// console.log(JSON.parse(responseText));
	});

	displayAllLines();
	displayAllStations();
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
	for (var i = 0; i < lineToStations[lineName].length; i++) {
		var marker = new google.maps.Marker({
			position: lineToStations[lineName][i]['loc'],
			map: map,
			title: lineToStations[lineName][i]['name'],
			icon: tIcon
		});
		marker.setMap(map);
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
