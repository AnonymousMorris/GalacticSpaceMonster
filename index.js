const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
const backgroundCanvas = document.getElementById("background-canvas")
const backgroundContext = backgroundCanvas.getContext("2d");
const WORLD_RADIUS = 3000;
const spriteAssets = document.getElementById("sprites");
const homePlanetAsset = spriteAssets.querySelector("#home-planet");
const backgroundImage = document.getElementById("background-image");
const MAX_PLANET_RADIUS = 100;
let PLAYER_SPEED = 5;
//resize canvas to fill window
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
backgroundCanvas.width = window.innerWidth;
backgroundCanvas.height = window.innerHeight;
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
        for(let i = 0; i < this.numX; i++){
            this.planetPool[i] = []
            const offsetX = i * this.blockWidth - WORLD_RADIUS;
            for(let j = 0; j < this.numY; j++){
                this.planetPool[i][j] = [];
                const offsetY = j * this.blockHeight - WORLD_RADIUS;
                const n = Math.round(Math.random() * 5);
                for(let k = 0; k < n; k++){
                    const planetPosX = Math.random() * this.blockWidth + offsetX;
                    const planetPosY = Math.random() * this.blockHeight + offsetY;
                    const planetRadius = Math.random() * MAX_PLANET_RADIUS / 2 + MAX_PLANET_RADIUS / 2;
                    if(dist(planetPosX, planetPosY) < WORLD_RADIUS - planetRadius){
                        this.planetPool[i][j].push(new planet(this.game, planetPosX, planetPosY, planetRadius))
                    }
                }
            }
        }
    }
    update(){
        const col = Math.floor((this.game.player.x + WORLD_RADIUS) / this.blockWidth);
        const row = Math.floor((this.game.player.y + WORLD_RADIUS) / this.blockHeight);
        for(let i = Math.max(0, col - 1); i < Math.min(this.numX, col + 2); i++){
            for(let j = Math.max(0, row - 1); j < Math.min(this.numY, row + 2); j++){
                this.planetPool[i][j].forEach((planet) => planet.update());
            }
        }
    }
    render(){

        const col = Math.floor((this.game.player.x + WORLD_RADIUS) / this.blockWidth);
        const row = Math.floor((this.game.player.y + WORLD_RADIUS) / this.blockHeight);
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
            && screenY > -this.radius && screenY < this.game.height + this.radius){
            this.game.context.drawImage(homePlanetAsset, screenX - this.radius, screenY - this.radius, 2 * this.radius, 2 * this.radius);
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
class background{
    constructor(game, img, canvas, ctx){
        this.game = game;
        this.player = this.game.player;
        this.img = img;
        this.canvas = canvas;
        this.context = ctx;
        this.imgWidth = img.width;
        this.imgHeight = img.height;
        this.imgX = 0;
        this.imgY = 0;
    }
    update(){
        this.imgX = (this.player.x - centerX) % this.imgWidth;
        if(this.player.x - centerX < 0){
            this.imgX = this.imgWidth + this.imgX;
        }
        this.imgY = (this.player.y - centerY) % this.imgHeight;
        if(this.player.y - centerY < 0){
            this.imgY = this.imgHeight + this.imgY;
        }
    }
    render(){
        const orientationX = !!(Math.floor((this.player.x - centerX) / this.imgWidth) % 2);
        const orientationY = !!(Math.floor((this.player.y - centerY) / this.imgHeight) % 2);
        const sx = Math.floor(this.imgX);
        const sy = Math.floor(this.imgY);
        const sw = Math.min(this.imgWidth - sx, this.canvas.width);
        const sh = Math.min(this.imgHeight - sy, this.canvas.height);
        this.context.clearRect(0, 0, this.game.width, this.game.height);
        this.renderWithOrientation(sx, sy, sw, sh, 0, 0, sw, sh, orientationX, orientationY);
        if(sw < this.game.width){
            this.renderWithOrientation(0, sy, this.game.width - sw, sh, sw, 0, this.game.width - sw, sh, !orientationX, orientationY);
        }
        if(sh < this.game.height){
            // console.log("something wrong with your height")
             this.renderWithOrientation(sx, 0, sw, this.game.height - sh, 0, sh, sw, this.game.height - sh, orientationX, !orientationY);
        }
        if(sh < this.game.height && sw < this.game.width){
            this.renderWithOrientation(0, 0, this.game.width - sw, this.game.height - sh, sw, sh, this.game.width - sw, this.game.height - sh, !orientationX, !orientationY);
        }
    }
    renderWithOrientation(sx, sy, sw, sh, dx, dy, dw, dh, orientationX, orientationY){
        if(orientationX && orientationY){
            this.renderFlippedHorizontallyAndVertically(sx, sy, sw, sh, dx, dy, dw, dh);
        }
        else if(orientationX){
            this.renderFlippedHorizontally(sx, sy, sw, sh, dx, dy, dw, dh);
        }
        else if(orientationY){
            this.renderFlippedVertically(sx, sy, sw, sh, dx, dy, dw, dh);
        }
        else{
            this.context.drawImage(this.img, sx, sy, sw, sh, dx, dy, dw, dh);
        }
    }
    renderFlippedHorizontally(sx, sy, sw, sh, dx, dy, dw, dh){
        this.context.save();
        this.context.fill();
        this.context.scale(-1, 1);
        this.context.translate( - this.canvas.width, 0);
        this.context.drawImage(this.img, this.imgWidth - sx, sy, -sw, sh, this.canvas.width - dx, dy, -dw, dh);
        this.context.restore();
    }
    renderFlippedVertically(sx, sy, sw, sh, dx, dy, dw, dh){
        this.context.save();
        this.context.scale(1, -1);
        this.context.translate(0, - this.game.height);
        this.context.drawImage(this.img, sx, this.imgHeight - sy, sw, -sh, dx, this.canvas.height - dy, dw, -dh);
        this.context.restore();
    }
    renderFlippedHorizontallyAndVertically(sx, sy, sw, sh, dx, dy, dw, dh){
        this.context.save();
        this.context.scale(-1, -1);
        this.context.translate(-this.canvas.width, -this.canvas.height);
        this.context.drawImage(this.img, this.imgWidth - sx, this.imgHeight - sy, -sw, -sh, this.canvas.width - dx, this.canvas.height - dy, -dw, -dh);
        this.context.restore();
    }
}
class Game{
    constructor(canvas, ctx, backgroundCanvas, backgroundContext, img) {
        this.canvas = canvas;
        this.context = ctx;
        this.width = canvas.width;
        this.height = canvas.height;
        //radius is the size of the world since our world is a circle
        this.player = new Player(this.canvas, this.context);
        this.world = new world(canvas, ctx, WORLD_RADIUS, this.player);
        this.planetPool = new planetPool(this);
        this.background = new background(this, img, backgroundCanvas, backgroundContext);
    }
    update(){
        this.player.update();
        this.world.update();
        this.planetPool.update();
        this.background.update();
    }
    render(){
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.player.render();
        this.world.render();
        this.planetPool.render();
        this.background.render();
    }
}

game = new Game(canvas, ctx, backgroundCanvas, backgroundContext, backgroundImage);
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