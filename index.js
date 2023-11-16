const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
const WORLD_RADIUS = 500;
const spriteAssets = document.getElementById("sprites");
const homePlanetAsset = spriteAssets.querySelector("#home-planet");
//resize canvas to fill window
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
//todo clean this up
canvas.lineWidth = 5;
centerX = canvas.width / 2;
centerY = canvas.height / 2;
function dist(x1, y1, x2, y2){
    if(x2){
        if(y2){
            return Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
        }
    }
    return Math.sqrt(x1*x1 + y1*y1);
}
const mousePos = {
    x : 0,
    y : 0,
    relativeX : this.x - centerX,
    relativeY : this.y - centerY
}

class planet{
    constructor(canvas, ctx, x, y, radius, player) {
        this.canvas = canvas;
        this.context = ctx;
        this.absX = x;
        this.absY = y;
        this.radius = radius;
        this.player = player;
        this.relativeX = -this.player.x - this.absX;
        this.relativeY = -this.player.y - this.absY;
    }
    update(){
        this.relativeX = -this.player.x - this.absX;
        this.relativeY = -this.player.y - this.absY;
    }
    render(){
        const screenX = this.relativeX + centerX;
        const screenY = this.relativeY + centerY;
        this.context.drawImage(homePlanetAsset, screenX, screenY, this.radius, this.radius);
        // this.context.beginPath();
        // this.context.lineWidth = 20;
        // this.context.arc( screenX, screenY, this.radius, 0, 2* Math.PI);
        // this.context.stroke();
    }
}

class Player {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.context = ctx;
        this.x = 0;
        this.y = 0;
        this.angle = 0;
    }
    update(){
        this.updatePos();
        this.updateAngle();
    }
    updatePos() {
        let distance = 0;
        if(dist){ //check to make sure the function exists before using
            distance = dist(mousePos.relativeX, mousePos.relativeY);
        }
        // normalize the dx and dy
        let dx = mousePos.relativeX / distance;
        let dy = mousePos.relativeY / distance;
        // create a dampening effect when mouse is close to player
        if(distance < 100){
            dx *= distance / 150;
            dy *= distance / 150;
        }
        if(dist(this.x + dx, this.y + dy, 0, 0) < WORLD_RADIUS){
            this.x += dx;
            this.y += dy;
        }
    }
    updateAngle(){
        //todo point sprite to the mouse
        this.angle = Math.atan(mousePos.relativeY / mousePos.relativeX);
        if(mousePos.relativeX < 0){
            this.angle += Math.PI;
        }
    }
    render(){
        this.context.save();
        this.context.translate(centerX, centerY);
        this.context.rotate(this.angle);
        this.context.beginPath();
        this.context.moveTo(0, 0);
        this.context.lineTo(-30, 10);
        this.context.lineTo(-30, -10);
        this.context.lineTo(0, 0);
        this.context.fill();
        this.context.closePath();
        this.context.restore();
    }
}
class world{
    constructor(canvas, ctx, radius, player) {
        this.canvas = canvas;
        this.context = ctx;
        this.radius =radius;
        this.player = player;
    }
    update(){
        this.x = -this.player.x + centerX;
        this.y = -this.player.y + centerY;
    }
    render(){
        this.context.beginPath();
        this.context.lineWidth = 20;
        this.context.arc(-this.player.x + centerX, -this.player.y + centerY, this.radius, 0, 2* Math.PI);
        this.context.stroke();
    }
}
class Game{
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.context = ctx;
        //radius is the size of the world since our world is a circle
        this.player = new Player(this.canvas, this.context);
        this.world = new world(canvas, ctx, WORLD_RADIUS, this.player);
        this.planet = new planet(canvas, ctx, 200, 400, 50, this.player);
    }
    update(){
        this.player.update();
        this.world.update();
        this.planet.update();
    }
    render(){
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.player.render();
        this.world.render();
        this.planet.render();
    }
}

game = new Game(canvas, ctx);
animate();
function animate(){
    game.update();
    game.render();
    requestAnimationFrame(animate)
}


canvas.addEventListener("mousemove", e => {
    mousePos.x = e.clientX - canvas.offsetLeft;
    mousePos.y = e.clientY - canvas.offsetTop;
    mousePos.relativeX = mousePos.x - centerX;
    mousePos.relativeY = mousePos.y - centerY;
}, false);