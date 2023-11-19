const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
const WORLD_RADIUS = 500;
const spriteAssets = document.getElementById("sprites");
const homePlanetAsset = spriteAssets.querySelector("#home-planet");
const MAX_PLANET_RADIUS = 100;
let PLAYER_SPEED = 1;
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
class planetPool{
    constructor(game){
        this.game = game;
        this.planetPool = [];
        this.blockWidth = Math.round(game.canvas.width / 2) + MAX_PLANET_RADIUS;
        this.blockHeight = Math.round(game.canvas.height / 2) + MAX_PLANET_RADIUS;
        this.numX = Math.floor(WORLD_RADIUS * 2 / this.blockWidth ) + 1;
        this.numY = Math.floor(WORLD_RADIUS * 2 / this.blockHeight) + 1;
        console.log("block width:" + this.blockWidth);
        console.log("numX: " + this.numX);
        console.log("block height:" + this.blockHeight);
        console.log("numY: " + this.numY);
        for(let i = 0; i < this.numX; i++){
            this.planetPool[i] = []
            const offsetX = i * this.blockWidth - WORLD_RADIUS;
            for(let j = 0; j < this.numY; j++){
                this.planetPool[i][j] = [];
                const offsetY = -j * this.blockHeight + WORLD_RADIUS;
                // const n = Math.round(Math.random() * 5);
                const n = 50;
                for(let k = 0; k < n; k++){
                    const planetPosX = Math.random() * this.blockWidth + offsetX;
                    // const planetPosX = offsetX;
                    const planetPosY = offsetY;
                    // const planetPosY = -Math.random() * this.blockHeight + offsetY;
                    const planetRadius = Math.random() * MAX_PLANET_RADIUS / 2 + MAX_PLANET_RADIUS / 2;
                    //logging some stuff
                    this.planetPool[i][j].push(new planet(this.game, planetPosX, planetPosY, planetRadius))
                }
                console.log(offsetX);
                console.log(offsetY);
            }
        }
    }
    update(){
        const col = Math.floor((this.game.player.x + WORLD_RADIUS) / this.blockWidth);
        const row = Math.floor((-this.game.player.y + WORLD_RADIUS) / this.blockHeight);
        for(let i = Math.max(0, col - 1); i < Math.min(this.numX, col + 2); i++){
            for(let j = Math.max(0, row - 1); j < Math.min(this.numY, row + 2); j++){
                this.planetPool[i][j].forEach((planet) => planet.update());
            }
        }
    }
    render(){

        const col = Math.floor((this.game.player.x + WORLD_RADIUS) / this.blockWidth);
        const row = Math.floor((-this.game.player.y + WORLD_RADIUS) / this.blockHeight);
        for(let i = Math.max(0, col - 1); i < Math.min(this.numX, col + 2); i++){
            for(let j = Math.max(0, row - 1); j < Math.min(this.numY, row + 2); j++){
                this.planetPool[i][j].forEach((planet) => planet.render());
            }
        }
    }
}
class planet{
    constructor(game, x, y, radius) {
        this.game = game;
        this.absX = x;
        this.absY = y;
        this.radius = radius;
        this.player = game.player;
        this.relativeX = this.absX + centerX;
        this.relativeY = this.absY + centerY;
    }
    update(){
        this.relativeX = this.absX - this.player.x;
        this.relativeY =  this.absY - this.player.y;
    }
    render(){
        const screenX = this.relativeX + centerX;
        const screenY = this.relativeY + centerY;
        if(screenX > -this.radius && screenX < this.game.width + this.radius
            && screenY > -this.radius && screenY < this.game.height){
            this.game.context.drawImage(homePlanetAsset, screenX, screenY, this.radius, this.radius);
            this.game.context.fillText(this.absX, screenX, screenY);
        }
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
        let dx = PLAYER_SPEED * mousePos.relativeX / distance;
        let dy = PLAYER_SPEED * mousePos.relativeY / distance;
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
        this.width = canvas.width;
        this.height = canvas.height;
        //radius is the size of the world since our world is a circle
        this.player = new Player(this.canvas, this.context);
        this.world = new world(canvas, ctx, WORLD_RADIUS, this.player);
        this.planetPool = new planetPool(this);
    }
    update(){
        this.player.update();
        this.world.update();
        this.planetPool.update();
    }
    render(){
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.player.render();
        this.world.render();
        this.planetPool.render();
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