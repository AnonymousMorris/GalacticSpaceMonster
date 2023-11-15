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
    update(dx, dy){
        if(dist(this.x, this.y, 0, 0) < WORLD_RADIUS){
            this.x += dx;
            this.y += dy;
        }
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
        this.context.moveTo(this.x, this.y);
        this.context.arc(-this.player.x + centerX, -this.player.y + centerY, this.radius, 0, 2* Math.PI);
        // this.context.fill();
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
        this.world.update();

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

function createMouseMoveHandler(player) {
    return (e) =>{
        const relativeX = e.clientX - canvas.offsetLeft;
        const relativeY = e.clientY - canvas.offsetTop;
        let distance = 0;
        if(dist){
            distance = dist(relativeX, relativeY);
        }
        const dx = relativeX / distance;
        const dy = relativeY / distance;
        player.update(dx, dy)
    }
}
const mouseMoveHandler = createMouseMoveHandler(game.player)
canvas.addEventListener("mousemove", mouseMoveHandler, false);