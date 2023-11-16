const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
const WORLD_RADIUS = 500;
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
    y : 0
}

class ball{
    canvas;
    context;
    x;
    y;
    constructor(canvas, ctx, x, y) {
        this.canvas = canvas;
        this.context = ctx;
        this.x = x;
        this.y = y;
    }
    render(player){
        //todo
    }
}

class Player {
    canvas;
    context;
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.context = ctx;
        this.canvasPosX = this.canvas.width / 2;
        this.canvasPosY = this.canvas.height / 2;
        this.x = 0;
        this.y = 0;
    }
    //todo change the method so that it can be called in the game update function instead of by even listener so that it is consistent.
    update(){
        this.updatePos();
    }
    updatePos() {
        const relativeX = mousePos.x - centerX;
        const relativeY = mousePos.y - centerY;
        let distance = 0;
        if(dist){ //check to make sure the function exists before using
            distance = dist(relativeX, relativeY);
        }
        // normalize the dx and dy
        let dx = relativeX / distance;
        let dy = relativeY / distance;
        // create a dampening effect when mouse is close to player
        if(distance < 10){
            dx *= distance / 15;
            dy *= distance / 15;
        }
        if(dist(this.x + dx, this.y + dy, 0, 0) < WORLD_RADIUS){
            this.x += dx;
            this.y += dy;
        }
    }
    updateDirection(){
        //todo point sprite to the mouse
    }
    render(){
        this.context.beginPath();
        this.context.moveTo(this.canvasPosX, this.canvasPosY);
        this.context.lineTo(this.canvasPosX - 20, this.canvasPosY);
        this.context.lineTo(this.canvasPosX, this.canvasPosY - 40);
        this.context.lineTo(this.canvasPosX + 20, this.canvasPosY);
        this.context.fill();
        this.context.closePath();
    }
}
class world{
    radius;
    canvas;
    context;
    x;
    y;
    player;
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
    world;
    player;
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.context = ctx;
        //radius is the size of the world since our world is a circle
        this.player = new Player(this.canvas, this.context);
        this.world = new world(canvas, ctx, WORLD_RADIUS, this.player);
    }
    update(){
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.world.update();
        this.player.update();

    }
    render(){
        this.world.render();
        this.player.render();
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
}, false);