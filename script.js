
//Gets the canvas
var canvas = document.getElementById("myCanvas");
//instances 2d on it
var ctx = canvas.getContext("2d");

//Get Width and height of canvas
var cWidth = canvas.width;
var cHeight = canvas.height;

//Sets some base values for drawing
ctx.lineWidth = 10;
ctx.strokeStyle = 'black'
ctx.fillStyle = 'gray'

//number of boids prompting
let n = prompt("Enter number of Boids", "");
while(isNaN(parseInt(n))){
	n = prompt("Enter number of Boids", "");
}

//initialize boid array
const array = new Array(n);

//----------BOID OBJECT----------//
function Boid(x, y, r){
	this.x = x;
	this.y = y;
	this.r = r;
}

//----------BOID FUNCTIONS----------//
Boid.prototype.draw = function(){
		ctx.beginPath();
		ctx.moveTo(this.x, this.y);
		ctx.lineTo(this.x + 16, this.y + 8);
		ctx.lineTo(this.x + 16, this.y - 8);
		ctx.closePath();
		ctx.stroke();
		ctx.fill();
}

Boid.prototype.move = function(){
	this.x = this.x + 1;
	this.y = this.y + 1;
	this.draw();
}

//----------HELPER FUNCTIONS----------//
function makeBoids(n){
	for(let i = 0; i < n; i++){
		let rx = Math.random() * (cWidth + 1) - 1;
		let ry = Math.random() * cHeight;
		let rr = Math.random() * 360;
		let temp = new Boid(rx, ry, rr);
		array[i] = temp;
		array[i].draw();
	}
}

function animationFrame(){
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	for(let i = 0; i < array.length; i++){
		array[i].move();
	}
}

function step() {
    animationFrame();
	console.log("HERE");
    window.requestAnimationFrame(step);
}

//----------MAIN PROGRAM----------//
makeBoids(n);
window.requestAnimationFrame(step);

