
//Gets the canvas
var canvas = document.getElementById("myCanvas");
//instances 2d on it
var ctx = canvas.getContext("2d");

//Get Width and height of canvas
var cWidth = canvas.width;
var cHeight = canvas.height;

//Sets some base values for drawing
ctx.lineWidth = 4;
ctx.strokeStyle = 'black'
ctx.fillStyle = 'gray'

//other misc values
let velocity = 20;
//general diagonal velocity?
//adjustment to sizes with a single number
//percents of separation and alignment
//separation distance

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
	this.x = x;
	this.y = y;
	this.r = r;
	this.dx = dx;
	this.dy = dy;
}

//----------BOID FUNCTIONS----------//
Boid.prototype.draw = function(){
	ctx.beginPath();
	ctx.moveTo(this.x, this.y);
	ctx.lineTo(this.x + 4, this.y + 2);
	ctx.lineTo(this.x + 4, this.y - 2);
	//Rotate Testing
	
	ctx.closePath();
	ctx.stroke();
	ctx.fill();
}

Boid.prototype.move = function(){
	//everything will be in here
	//This is the chunk of the update function
	let result = new Coord(0,0);
	let temp = new Coord(0,0);

	temp = this.cohesion();
	result.x += temp.x;
	result.y += temp.y;

	temp = this.separation();
	result.x += temp.x;
	result.y += temp.y;

	temp = this.alignment();
	result.x += temp.x;
	result.y += temp.y;

	this.dx += result.x;
	this.dy += result.y;

	this.r = (dotProduct(this.dx, this.dy, 1, 0) * (Math.PI / 180)) + (Math.PI);
	this.x += this.dx;
	this.y += this.dy;

	//boundary checking
	if(this.x > canvas.width + 32){
		this.x = 0;
	}if(this.x < -32){
		this.x = canvas.width;
	}
	
	if(this.y > canvas.height + 32){
		this.y = 0;
	}if(this.y < -32){
		this.y = canvas.height;
	}
	
	//draw the image
	this.drawImageRot();
}

Boid.prototype.cohesion = function(){
	let result = new Coord(0,0);
	for(let i = 0; i < n; i++){
		result.x += array[i].x;
		result.y += array[i].y;
	}
	result.x /= n;
	result.y /= n;

	result.x = (result.x - this.x) / 200;
	result.y = (result.y - this.y) / 200;

	return result;
}

Boid.prototype.separation = function(){
	distance = 10;
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

	result.x = (result.x - this.dx) / 200
	result.y = (result.y - this.dy) / 200

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
    animationFrame();
	setTimeout(100);
    window.requestAnimationFrame(step);
}

//----------MAIN PROGRAM----------//
makeBoids(n);
getPositions();
window.requestAnimationFrame(step);