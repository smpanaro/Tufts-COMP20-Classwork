function addTransitExtraFeatures() {
	addShowAllLinesControl();
}

function addShowAllLinesControl() {
	var allLinesButton = buildExtraControlButton('Show all lines', 'Click to display all T lines');

	google.maps.event.addDomListener(allLinesButton, 'click', function() {
		displayAllLines();
		allLinesButton.style.display = 'none';
	});

	// allLinesButton.index = 1;
	map.controls[google.maps.ControlPosition.TOP_RIGHT].push(allLinesButton);
}

// modified slightly from: https://developers.google.com/maps/documentation/javascript/controls
function buildExtraControlButton(innerHTML, title) {
	// Create a div to hold the control.
	var controlDiv = document.createElement('div');

	// Set CSS styles for the DIV containing the control
	// Setting padding to 5 px will offset the control
	// from the edge of the map.
	controlDiv.style.padding = '5px';

	// Set CSS for the control border.
	var controlUI = document.createElement('div');
	controlUI.style.backgroundColor = 'white';
	controlUI.style.borderColor = 'gray';
	controlUI.style.borderStyle = 'solid';
	controlUI.style.borderWidth = '1px';
	controlUI.style.borderRadius = '2px';
	controlUI.style.cursor = 'pointer';
	controlUI.style.textAlign = 'center';
	controlUI.style.padding = '1px 6px';
	controlUI.title = title;
	controlDiv.appendChild(controlUI);

	// Set CSS for the control interior.
	var controlText = document.createElement('div');
	controlText.style.fontFamily = 'Roboto, Arial,sans-serif';
	controlText.style.fontSize = '11px';
	controlText.innerHTML = innerHTML;
	controlUI.appendChild(controlText);

	return controlDiv;
}