// Create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 512;
canvas.height = 480;
document.body.appendChild(canvas);

// Background image
var bgReady = false;
var bgImage = new Image();
bgImage.onload = function () {
	bgReady = true;
};
bgImage.src = "images/background.png";

// Hero image
var heroReady = false;
var heroImage = new Image();
heroImage.onload = function () {
	heroReady = true;
};
heroImage.src = "images/hero.png";

// Monster image
var monsterReady = false;
var monsterImage = new Image();
monsterImage.onload = function () {
	monsterReady = true;
};
monsterImage.src = "images/monster.png";

// functions???
var addChildren = function(qty) {
	if (qty <= 0)
		return undefined;
	
	var child = {
		speed: 25, // movement in pixels per second
		direction: 39,
		nextDirection: 39,
		child: addChildren(qty -1)
	};
	
	return child;
};

var getLastChild = function(segment) {
	if (segment.child == undefined)
		return segment;

	return getLastChild(segment.child);
};

var setChildrenXY = function(segment) {
	if (segment.child == undefined)
		return;

	segment.child.x = segment.x;
	segment.child.y = segment.y;
	setChildrenXY(segment.child);
};


// Game objects
var hero = {
	speed: 32, // movement in pixels per second
	direction: 39,
	nextDirection: 39,
	child: addChildren(5)
};
var monster = {};
var monstersCaught = 0;

// Handle keyboard controls
var keysDown = {};

addEventListener("keydown", function (e) {
//	keysDown[e.keyCode] = true;
	keysDown = e.keyCode;
}, false);

//addEventListener("keyup", function (e) {
//	delete keysDown[e.keyCode];
//}, false);

// Reset the game when the player catches a monster
var reset = function () {
	//hero.x = canvas.width / 2;
	//hero.y = canvas.height / 2;  // we don't want to reset hero

	// Throw the monster somewhere on the screen randomly
	monster.x = 32 + (Math.random() * (canvas.width - 64));
	monster.y = 32 + (Math.random() * (canvas.height - 64));
};

var init = function () {
	hero.x = canvas.width / 2;
	hero.y = canvas.height / 2;
	setChildrenXY(hero);
};



var follow = function (hero, x, y) {
	prevx = hero.x;
	prevy = hero.y;
	hero.x = x;
	hero.y = y;
	if (hero.child != undefined){
		follow(hero.child, prevx, prevy);
	}
};

// Update game objects
var updateKeyboard = function () {
	if (38 == keysDown && hero.direction != 38 && hero.direction != 40) { // Player holding up
		hero.nextDirection = 38;
	}
	else if (40 == keysDown && hero.direction != 40 && hero.direction != 38) { // Player holding down
		hero.nextDirection = 40;
	}
	else if (37 == keysDown && hero.direction != 37 && hero.direction != 39) { // Player holding left
		hero.nextDirection = 37;
	}
	else if (39 == keysDown && hero.direction != 39 && hero.direction != 37) { // Player holding right
		hero.nextDirection = 39;
	}
};

var update = function (modifier) {
	hero.direction = hero.nextDirection;
	if (hero.direction == 38) { // Player moving up
		follow(hero, hero.x, hero.y);
		hero.y -= hero.speed * modifier;
	}
	if (hero.direction == 40) { // Player moving down
		follow(hero, hero.x, hero.y);
		hero.y += hero.speed * modifier;
	}
	if (hero.direction == 37) { // Player moving left
		follow(hero, hero.x, hero.y);
		hero.x -= hero.speed * modifier;
	}
	if (hero.direction == 39) { // Player moving right
		follow(hero, hero.x, hero.y);
		hero.x += hero.speed * modifier;
	}
	//follow(hero, hero.x, hero.y)
	// Are they touching?
	if (
		hero.x <= (monster.x + 32)
		&& monster.x <= (hero.x + 32)
		&& hero.y <= (monster.y + 32)
		&& monster.y <= (hero.y + 32)
	) {
		var lastChild = getLastChild(hero);
		lastChild.child = addChildren(1);		

		++monstersCaught;
		reset();
	}

	// is "snake" touching itself?
	collisionWithSegmentReset(hero, hero.child);
		
};

var collisionWithSegmentReset = function (head, segment) {
	if (segment == undefined) {
		return; // reached end without finding anything. just exit.
	}
	else if ((segment.x == head.x) && (segment.y == head.y)) {
		init();
		reset();
		return;
	}
	else {
		collisionWithSegmentReset(head, segment.child);
	}
};


// Draw everything
var renderHero = function(hero) {
	ctx.drawImage(heroImage, hero.x, hero.y);
	if (hero.child != undefined){
		renderSegment(hero.child);
	}
};

var renderSegment = function(segment) {
	ctx.drawImage(monsterImage, segment.x, segment.y);
	if (segment.child != undefined){
		renderSegment(segment.child);
	}
};

var render = function () {
	if (bgReady) {
		ctx.drawImage(bgImage, 0, 0);
	}

	if (heroReady) {
		renderHero(hero);
	}

	if (monsterReady) {
		ctx.drawImage(monsterImage, monster.x, monster.y);
	}

	// Score
	ctx.fillStyle = "rgb(250, 250, 250)";
	ctx.font = "24px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("Goblins caught: " + monstersCaught, 32, 32);
};



// The main game loop
var main = function () {
	var now = Date.now();
	var delta = now - then;
	var timeSinceVisualUpdate = 0;
	then = now;

	// Request to do this again ASAP
	while (timeSinceVisualUpdate < 150) {
		now = Date.now();
		timeSinceVisualUpdate = now - then;
		//console.log(timeSinceVisualUpdate);
		updateKeyboard();
	};
	update(1);
	render();
	
	requestAnimationFrame(main);
};

// Cross-browser support for requestAnimationFrame
var w = window;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

// Let's play this game!
var then = Date.now();
init();
reset();
main();
