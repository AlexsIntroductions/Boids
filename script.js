//TODO
	//on click boids travel towards the cursor

//Gets the canvas
const canvas = document.getElementById("myCanvas");
//instances 2d on it
const ctx = canvas.getContext("2d");

//set canvas size
window.addEventListener('resize', () => {
	canvas.width = parent.innerWidth * 2 / 3;
	canvas.height = canvas.width / 2;
});

//Sets some base values for drawing
ctx.lineWidth = 4;
ctx.strokeStyle = 'black';

//Base Values for Sliders and Boids
let velocity = 10;
let cohDist = 100;
let cohPerc = 600;
let sepDist = 50;
let sepPerc = 200;
let alnPerc = 100;

//boundary switch case tracker
let boundaryCase = 0;

//number of boids prompting
//TODO - TURN THIS INTO A FORM OR SOMETHING
let n = prompt("Enter number of Boids", "");
while(isNaN(parseInt(n))){
	n = prompt("Enter number of Boids", "");
}

n = Math.floor(n);

//initialize boid array
const array = new Array(n);

//----------COORD OBJECT----------//
function Coord(x, y){
	this.x = x;
	this.y = y;
}

Coord.prototype.add(coord){
	this.x += coord.x;
	this.y += coord.y;
}

//----------BOID OBJECT----------//
function Boid(x, y, r, dx, dy){
	//position
	this.pos = new Coord(x,y);
	//rotation (radians)
	this.r = r;
	//velocity
	this.vel = new Coord(dx, dy);
}

//----------BOID FUNCTIONS----------//
Boid.prototype.move = function(){
	//result is used as a vector containing the new velocity of the boid
	let result = new Coord(0,0);
	let temp = new Coord(0,0);
	
	//gets cohesion calculation and adds it to result;
	temp = this.cohesion();
	result.add(temp);

	//gets separation calculation and adds it to result;
	temp = this.separation();
	result.add(temp);

	//gets alignment calculation and adds it to result
	temp = this.alignment();
	result.add(temp);
	
	//console.log(result.x + ", " + result.y);

	//adds to current velocity
	this.vel.add(result);

	this.speedlimit();

	//rotation calculation done again
	this.r = (dotProduct(this.dx, this.dy, 1, 0) * (Math.PI / 180)) + (Math.PI);
	
	//update position based on velocity
	this.pos.add(this.vel);

	//boundary checking
		//first case is to allow boids to loop around boundaries. Ex: Go off left side and appear on right side
		//second case is to allow boids to bounce off the boundaries.
	switch(boundaryCase){
		//Case 0
		case 0:
			if(this.pos.x > canvas.width + 32){
				this.pos.x = 0;
			}
			if(this.pos.x < -32){
				this.pos.x = canvas.width;
			}
	
			if(this.pos.y > canvas.height + 32){
				this.pos.y = 0;
			}
			if(this.pos.y < -32){
				this.pos.y = canvas.height;
			}
			break;
		//Case 1
		case 1:
			if(this.pos.x > canvas.width){
				this.dx *= -1;
				this.pos.x = canvas.width;
			}
			else if(this.pos.x < 0){
				this.dx *= -1;
				this.pos.x = 0;
			}
			if(this.pos.y > canvas.height){
				this.dy *= -1;
				this.pos.y = canvas.height;
			}
			else if(this.pos.y < 0){
				this.dy *= -1;
				this.pos.y = 0;
			}
			break;
		default:
			console.log("Something Wrong in Boundary Checking");
			break;
	}
	
	//draw the image based on new position and rotation
	this.drawImageRot();
}

Boid.prototype.cohesion = function(){
	//number of boids within distance
	let t = 0;
	//calculates center of mass
	let result = new Coord(0,0);
	for(let i = 0; i < n; i++){
		if(this.dist(array[i]) < cohDist){
			result.add(array[i].pos);
			t++;
		}
	}
	//divides based on the number of boids nearby
	result.x /= t;
	result.y /= t;

	//divides by 200 to get percentage to move towards (0.5% at 200)
		//This only affects speed which they travel
	result.x = (result.x - this.x) / cohPerc;
	result.y = (result.y - this.y) / cohPerc;

	return result;
}

Boid.prototype.separation = function(){
	let result = new Coord(0,0);
	for(let i = 0; i < n; i++){
		if(array[i].x == this.x && array[i].y == this.y && array[i].r == this.r){
			continue;
		}
		else if(this.dist(array[i]) < sepDist){
			result.x -= (array[i].x - this.x);
			result.y -= (array[i].y - this.y);
		}
	}

	result.x = result.x / sepPerc;
	result.y = result.y / sepPerc;

	return result;
}

Boid.prototype.alignment = function(){
	//change how quickly they align
	//1 - 600 | start 100
	let result = new Coord(0,0);
	for(let i = 0; i < n; i++){
		if(array[i].x == this.x && array[i].y == this.y && array[i].r == this.r){
			continue;
		}
		else{
			result.x += array[i].dx;
			result.y += array[i].dy;
		}
	}
	result.x /= n;
	result.y /= n;

	result.x = (result.x - this.dx) / alnPerc;
	result.y = (result.y - this.dy) / alnPerc;

	return result;
}

Boid.prototype.drawImageRot = function(){
    // Store the current context state (i.e. rotation, translation etc..)
	ctx.fillStyle = 'gray';
    ctx.save();
	
    //Set the origin to the center of the image
    ctx.translate(this.x, this.y);

    //Rotate the canvas around the origin
    ctx.rotate(this.r);

    //draw the image
	ctx.beginPath();
	ctx.moveTo(0, 0);
	ctx.lineTo(16, 8);
	ctx.lineTo(16, -8);
	
	ctx.closePath();
	ctx.stroke();
	ctx.fill();
	
    // Restore canvas state as saved from above
    ctx.restore();
}
	
Boid.prototype.dist = function(boid){
	return Math.sqrt(Math.pow((boid.x - this.x),2) + Math.pow((boid.y - this.y),2));
}

Boid.prototype.speedlimit = function(){
	let curSpeed = magnitude(this.dx, this.dy);
	if(curSpeed > velocity){
		this.dx = (this.dx / curSpeed) * velocity;
		this.dy = (this.dy / curSpeed) * velocity;
	}
}

//----------HELPER FUNCTIONS----------//
function makeBoids(n){
	for(let i = 0; i < n; i++){
		let rx = Math.floor(Math.random() * canvas.width);
		let ry = Math.floor(Math.random() * canvas.height);
		let dx = Math.floor(Math.random() * 10 - 5);
		let dy = Math.floor(Math.random() * 10 - 5);
		let rr = (dotProduct(dx, dy, 1, 0) * (Math.PI / 180)) + (Math.PI);
		let temp = new Boid(rx, ry, rr, dx, dy);
		array[i] = temp;
		array[i].drawImageRot();
	}
}

function animationFrame(){
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = "LightSkyBlue";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	for(let i = 0; i < n; i++){
		array[i].move();
	}
}

function getPositions(){
	console.log("CANVAS SIZE: " + canvas.width + ", " + canvas.height);
	for(let i = 0; i < array.length; i++){
		let angle = array[i].r * 180 / Math.PI;
		console.log("BOID AT " + (i + 1) + ": " + array[i].x + ", " + 
			array[i].y + " | With Velocities: " + array[i].dx + ", " + array[i].dy 
			+ " | and rotation: " + angle);
	}
}

function magnitude(x, y){
	return Math.sqrt( Math.pow(x, 2) + Math.pow(y, 2) );
}

function dotProduct(x, y, dx, dy){
	return (Math.atan2(y, x) - Math.atan2(dy, dx)) * 180 / (Math.PI);
}

function step() {
    animationFrame();
	setTimeout(100);
    window.requestAnimationFrame(step);
}

//----------ELEMENT FUNCTIONS----------//
function buttonClick(){
	if(boundaryCase == 0){
		boundaryCase = 1;
		for(let i = 0; i < n; i++){
			if(array[i].x > canvas.width){
				array[i].x = 0;
			}
			if(array[i].x < 0){
				array[i].x = canvas.width;
			}
	
			if(array[i].y > canvas.height){
				array[i].y = 0;
			}
			if(array[i].y < 0){
				array[i].y = canvas.height;
			}
		}
	}
	else{
		boundaryCase = 0;
	}
	//
	var elem = document.getElementById("myButton");
	if(elem.innerHTML =="Wrap Around: On"){
		elem.innerHTML = "Wrap Around: Off";
	}
	else if(elem.innerHTML =="Wrap Around: Off"){
		elem.innerHTML = "Wrap Around: On";
	}
}

//----------SLIDER FUNCTIONS----------//
function velocitySlider(num){
	console.log("Velocity: " + num);
	velocity = parseInt(num);
}

function separationDistance(num){
	console.log("Sep Dist: " + num);
	sepDist = parseInt(num);
}

function separationPercent(num){
	console.log("Sep Percent: " + num);
	sepPerc = parseInt(num);
}

function cohesionDistance(num){
	console.log("Coh Dist: " + num);
	cohDist = parseInt(num);
}

function cohesionPercent(num){
	console.log("Coh Percent: " + num);
	cohPerc = parseInt(num);
}

function alignmentPercent(num){
	console.log("Alignment Percent: " + num);
	alnPerc = parseInt(num);
}

//----------MAIN PROGRAM START----------//
makeBoids(n);
getPositions();
window.requestAnimationFrame(step);