function onPageLoaded() {
	draw();
}

function draw() {
	var canvas = document.getElementById('game');
	var ctx = canvas.getContext('2d');

	// Fill the background.
	ctx.fillStyle = "#87CEEB";
	ctx.fill();

	// Create the spritesheet image here as opposed to inside of the drawing functions.
	// Otherwise the order of in which things are drawn is indeterminate since you are
	// waiting to load the spritesheet each time.
	var spriteSheet = new Image();
	spriteSheet.src = "assets/duckhunt.png"
	spriteSheet.onload = function() {
		// New drawings are inserted in front of old ones.
		drawTree(ctx, spriteSheet);
		drawBackground(ctx, spriteSheet);
		var numBirds = 5;
		for (var i = 0; i < numBirds; i++) {
			drawBird(ctx, spriteSheet, Math.random()*100, Math.random()*100);
		};
		drawSniffingDog(ctx, spriteSheet, 50);
	};
}

// Functions to draw sprites on the canvas. 
// Prevents having to keep track of the specific offsets.
// Everything is scaled with respect to the canvas' width.

// Draw the background image scaled to the width but offset so that it sits at the bottom of the frame.
function drawBackground(ctx, spriteSheet) {
	var scaledHeight = 500*(ctx.canvas.width/900);
	ctx.drawImage(spriteSheet, 0, 401, 900, 500, 0, ctx.canvas.height - scaledHeight, ctx.canvas.width, scaledHeight);
}

// ctx - the context to draw in.
function drawTree(ctx, spriteSheet) {
	var scaleFactor = ctx.canvas.width / 900; // Scale with the canvas.
	var visualAdjustFactor = 2.5;	// Scale so that things look visually pleasing.

	var sx = 0;
	var sy = 268;
	var sw = 80;
	var sh = 133;
	var dw = sw*scaleFactor*visualAdjustFactor;
	var dh = sh*scaleFactor*visualAdjustFactor;
	var dx = 95*scaleFactor*visualAdjustFactor - (dw/2); // Position relative to the center horizontally.
	// Position relative to the bottom of the tree vertically. 
	// Last term is an offset that handles when height of canvas is not same as the background height.
	var dy = 165*scaleFactor*visualAdjustFactor - dh + (ctx.canvas.height - 500*(ctx.canvas.width/900));

	ctx.drawImage(spriteSheet, sx, sy, sw, sh, dx, dy, dw, dh);
}

// ctx - the context to draw in.
// x - the percent of the dog's x-position in the frame. 0 is at the extreme left, 100 the extreme right.
function drawSniffingDog(ctx, spriteSheet, x) {

	var scaleFactor = ctx.canvas.width / 900; // Scale with the canvas.
	var visualAdjustFactor = 2.5;	// Scale so that things look visually pleasing.

	var sx = 0;
	var sy = 0;
	var sw = 59;
	var sh = 44;
	var dw = sw*scaleFactor*visualAdjustFactor;
	var dh = sh*scaleFactor*visualAdjustFactor;
	var dx = (x/100)*ctx.canvas.width - (dw/2);
	// Position relative to the bottom of the dog vertically. 
	// Last term is an offset that handles when height of canvas is not same as the background height.
	var dy = 185*scaleFactor*visualAdjustFactor - dh + (ctx.canvas.height - 500*(ctx.canvas.width/900));


	ctx.drawImage(spriteSheet, sx, sy, sw, sh, dx, dy, dw, dh);
}

// ctx - the context to draw in
// x - the percent of the bird's x-position in the frame.
// y - the percent of the bird's y-position between the top of the grass and the top of the canvas
function drawBird(ctx, spriteSheet, x, y) {

	var scaleFactor = ctx.canvas.width / 900; // Scale with the canvas.
	var visualAdjustFactor = 2.5;	// Scale so that things look visually pleasing.

	var sx = 4;
	var sy = 156;
	var sw = 26;
	var sh = 33;
	var dw = sw*scaleFactor*visualAdjustFactor;
	var dh = sh*scaleFactor*visualAdjustFactor;
	var dx = (x/100)*(ctx.canvas.width - dw);
	var dy = (y/100)*(ctx.canvas.height - 130*scaleFactor - dh); // 130 is the height to the top of the grass


	ctx.drawImage(spriteSheet, sx, sy, sw, sh, dx, dy, dw, dh);
}