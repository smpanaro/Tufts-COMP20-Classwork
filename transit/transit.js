var lineToCoordLists = {
	"red": redLineCoordinates,
	"blue": blueLineCoordinates,
	"orange": orangeLineCoordinates,
	"green": greenLineCoordinates,
	"silver": silverLineCoordinates
};
var lineToColor = {
	"red": "#FA2D27",
	"blue": "#2F5DA6",
	"orange": "#FD8A03",
	"green": "#008150",
	"silver": "#9A9C9D"
};
console.log(lineToCoordLists);
var map;

function onPageLoad() {
	var mapOptions = {
	  center: new google.maps.LatLng(42.3581, -71.0636),
	  zoom: 14
	};
	map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);

	displayAllLines();
}

function displayTLine(lineName) {
	var colorWeight = 2.7;

	for (var i = 0; i < lineToCoordLists[lineName].length; i++) {
		if (lineName == "silver") {
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
			strokeWeight: (lineName == "silver") ? colorWeight - 0.1 : colorWeight
		});

		subwayPath.setMap(map);
	}
}

function displayAllLines() {
	for (lineName in lineToCoordLists) {
		displayTLine(lineName);
	}
}