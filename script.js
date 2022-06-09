
//TODO 
	//Add sliders/editors for the values associated with separation, cohesion, and alignment.\
	//add better UI
	//trace path?
	//on click boids travel towards the cursor

//Gets the canvas
var canvas = document.getElementById("myCanvas");

//instances 2d on it
var ctx = canvas.getContext("2d");

//set width
function setWidth() {
	canvas.width = window.innerWidth * 6 / 7;
}
setWidth();

//Get Width and height of canvas
var cWidth = canvas.width;
var cHeight = canvas.height;

//Sets some base values for drawing
ctx.lineWidth = 4;
ctx.strokeStyle = 'black'
ctx.fillStyle = 'gray'

//Base Velocity to keep boids moving around
let velocity = 10;

//boundary switch case tracker
let boundaryCase = 0;


//number of boids prompting
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

//----------BOID OBJECT----------//
function Boid(x, y, r, dx, dy){
	//position
	this.x = x;
	this.y = y;
	//rotation (radians)
	this.r = r;
	//velocity
	this.dx = dx;
	this.dy = dy;
}

//----------BOID FUNCTIONS----------//
Boid.prototype.draw = function(){
	//shape drawing
	ctx.beginPath();
	//coordinates for point of triangle
	ctx.moveTo(this.x, this.y);
	ctx.lineTo(this.x + 4, this.y + 2);
	ctx.lineTo(this.x + 4, this.y - 2);
	ctx.closePath();
	ctx.stroke();
	ctx.fill();
}

Boid.prototype.move = function(){
	//result is used as a vector containing the new velocity of the boid
	let result = new Coord(0,0);
	let temp = new Coord(0,0);
	
	//gets cohesion calculation and adds it to result;
	temp = this.cohesion();
	result.x += temp.x;
	result.y += temp.y;

	//gets separation calculation and adds it to result;
	temp = this.separation();
	result.x += temp.x;
	result.y += temp.y;

	//gets alignment calculation and adds it to result
	temp = this.alignment();
	result.x += temp.x;
	result.y += temp.y;
	
	
	//console.log(result.x + ", " + result.y);

	//adds to current velocity
	this.dx += result.x;
	this.dy += result.y;

	this.speedlimit();

	//rotation calculation done again
	this.r = (dotProduct(this.dx, this.dy, 1, 0) * (Math.PI / 180)) + (Math.PI);
	
	//update position based on velocity
	this.x += this.dx;
	this.y += this.dy;

	//boundary checking
		//first case is to allow boids to loop around boundaries. Ex: Go off left side and appear on right side
		//second case is to allow boids to bounce off the boundaries.
	switch(boundaryCase){
		//Case 0
		case 0:
			if(this.x > canvas.width + 32){
				this.x = 0;
			}
			if(this.x < -32){
				this.x = canvas.width;
			}
	
			if(this.y > canvas.height + 32){
				this.y = 0;
			}
			if(this.y < -32){
				this.y = canvas.height;
			}
			break;
		//Case 1
		case 1:
			if(this.x > canvas.width || this.x < 0){
				this.dx *= -1;
			}
			if(this.y > canvas.height || this.y < 0){
				this.dy *= -1;
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
	//0 - 600 | start 100
	distance = 100;
	let t = 0;
	//calculates center of mass
	let result = new Coord(0,0);
	for(let i = 0; i < n; i++){
		if(this.dist(array[i]) < distance){
			result.x += array[i].x;
			result.y += array[i].y;
			t++;
		}
	}
	result.x /= t;
	result.y /= t;

	//divides by 200 to get percentage to move towards (0.5% at 200)
		//This only affects speed which they travel
	result.x = (result.x - this.x) / 200;
	result.y = (result.y - this.y) / 200;

	return result;
}

Boid.prototype.separation = function(){
	//0 - 50 | start 15
	distance = 25;
	let result = new Coord(0,0);
	for(let i = 0; i < n; i++){
		if(array[i].x == this.x && array[i].y == this.y && array[i].r == this.r){
			continue;
		}
		else if(this.dist(array[i]) < distance){
			result.x -= (array[i].x - this.x);
			result.y -= (array[i].y - this.y);
		}
	}
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

	result.x = (result.x - this.dx) / 300;
	result.y = (result.y - this.dy) / 300;

	return result;
}

Boid.prototype.drawImageRot = function(){
    // Store the current context state (i.e. rotation, translation etc..)
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
		let rx = Math.floor(Math.random() * cWidth);
		let ry = Math.floor(Math.random() * cHeight);
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
	setWidth();
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
}

function velocitySlider(num){
	console.log("HERE");
	velocity = parseInt(num,10);
}

function separationDistance(num){
	
}

function separationPercent(num){
	
}

function cohesionDistance(num){
	
}

function cohesionPercent(num){
	
}

function alignmentPercent(num){
	
}
//----------MAIN PROGRAM----------//
makeBoids(n);
getPositions();
window.requestAnimationFrame(step);