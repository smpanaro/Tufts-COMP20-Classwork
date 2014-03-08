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

// Returns distance in miles between two points on the earth.
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

function getFirstElementByClass(node, tagName, className) {
	var matchingElems = node.getElementsByTagName(tagName);
	for (var i = 0; i < matchingElems.length; i++) {
		if (matchingElems[i].className == className) return  matchingElems[i];
	}
	return null;
}
