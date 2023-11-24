let game;
const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
const backgroundCanvas = document.getElementById("background-canvas")
const backgroundContext = backgroundCanvas.getContext("2d");
const WORLD_RADIUS = 3000;
let imgLoaded = 0;
const NUM_IMAGES = 3;
let spriteSheet = new Image();
let homePlanetImage = new Image();
let backgroundImage = new Image();
spriteSheet.src = "/assets/enemy_sprite_sheet.svg";
homePlanetImage.src = "/assets/Planets/planet00.png";
backgroundImage.src = "/assets/space_background.png";
spriteSheet.onload = handleImageLoad;
homePlanetImage.onload = handleImageLoad;
backgroundImage.onload= handleImageLoad;
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
function dot(v1, v2, u1, u2){
    return v1* u1 + v2 * u2;
}
function pos(x, y){
    this.x = x;
    this.y = y;
}

class debug{
    constructor(game){
        this.pointLocations = [];
        this.game = game;
    }
    render(){
        this.pointLocations.forEach(loc => {
            const relativeX = loc.x - this.game.x + centerX;
            const relativeY = loc.y - this.game.y + centerY;
            this.game.canvas.fillRect(relativeX, relativeY, 30, 30)
        });
    }
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
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.player = game.player;
        this.relativeX = this.x + centerX;
        this.relativeY = this.y + centerY;
    }
    update(){
        this.relativeX = this.x - this.player.x;
        this.relativeY =  this.y - this.player.y;
    }
    render(){
        const screenX = this.relativeX + centerX;
        const screenY = this.relativeY + centerY;
        if(screenX > -this.radius && screenX < this.game.width + this.radius
            && screenY > -this.radius && screenY < this.game.height + this.radius){
            this.game.context.drawImage(homePlanetImage, screenX - this.radius, screenY - this.radius, 2 * this.radius, 2 * this.radius);
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
        this.angle = Math.atan2(mousePos.relativeY, mousePos.relativeX);
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
        if(dist(this.x, this.y) + dist(this.canvas.width, this.canvas.height) >= WORLD_RADIUS){
            this.context.beginPath();
            this.context.lineWidth = 20;
            this.context.arc(-this.player.x + centerX, -this.player.y + centerY, this.radius, 0, 2* Math.PI);
            this.context.stroke();
        }
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
class enemyPool{
    constructor(game, img, row, col, speed, turningSpeed, numberOfEnemies){
        this.game = game;
        this.img = img;
        this.num = numberOfEnemies;
        this.enemies = [];
        // todo change the initalX and initalY to starting home planet or something
        for(let i = 0; i < this.num; i++){
            this.enemies.push(new enemy(this.game, this.img, row, col, speed, turningSpeed, 100 * i, 0));
        }
    }
    updateAndRender() {
        this.enemies.forEach((enemy) => {
            enemy.update();
            enemy.render();
        });
    }
}
class enemy{
    constructor(game, img, row, col, speed, turningSpeed, initialX, initialY) {
        this.game = game;
        this.player = this.game.player;
        this.canvas = this.game.canvas;
        this.context = this.game.context;
        this.img = img;
        this.row = row - 1;
        this.col = col - 1;
        this.x = initialX;
        this.y = initialY;
        this.speed = speed
        this.turningSpeed = turningSpeed;
        this.angle = 0;
        this.dx = 0;
        this.dy = 0;
        this.dtheta = 0;
    }
    update(){
        const diffX = this.player.x - this.x;
        const diffY = this.player.y - this.y;
        // prevent division by 0
        let diffAngle = Math.atan2(diffY, diffX) - this.angle;
        if(diffAngle > Math.PI){
            diffAngle = -(2* Math.PI - diffAngle);
        }
        this.dtheta = diffAngle;
        this.dtheta = Math.min(this.dtheta, 0.01 * this.turningSpeed);
        this.dtheta = Math.max(this.dtheta, -0.01 * this.turningSpeed);
        this.dx = Math.cos(this.angle) * this.speed;
        this.dy = Math.sin(this.angle) * this.speed;
        if(Math.abs(diffAngle )> Math.PI / 2){
            this.dx = 0;
            this.dy = 0;
        }
        this.angle += this.dtheta;
        if(Math.abs(diffX) < this.game.width && Math.abs(diffY) < this.game.height){
            const col = Math.floor((this.x + WORLD_RADIUS) / this.game.planetPool.blockWidth);
            const row = Math.floor((this.y + WORLD_RADIUS) / this.game.planetPool.blockHeight);
            for(let i = Math.max(0, col - 1); i < Math.min(this.game.planetPool.numX, col + 2); i++){
                for(let j = Math.max(0, row - 1); j < Math.min(this.game.planetPool.numY, row + 2); j++){
                    this.game.planetPool.planetPool[i][j].forEach((planet) => this.nudge(diffX, diffY, planet));
                }
            }
        }
        this.x += this.dx;
        this.y += this.dy;
    }
    nudge(dx, dy, planet){
        const distance = dist(dy, dx);
        // orthogonal slope = -dx / dy
        // vector u is parallel to slope
        // vector v is orthogonal to slope
        const u1 = dx / distance;
        const u2 = dy / distance;
        const v1 = dy / distance;
        const v2 = -dx / distance;
        const relativeX = planet.x - this.x;
        const relativeY = planet.y - this.y;
        const relativeU = dot(u1, u2, relativeX, relativeY)
        const relativeV = dot(v1, v2, relativeX, relativeY);
        const a = 2 * planet.radius;
        const b = 1 * planet.radius;
        const enemyDistance = dist(Math.abs(relativeU) / a, Math.abs(relativeV) / b);
        // ellipse: x^2 / a^2 + y^2 / b^2 = 1
        if(enemyDistance < 1){
            // nudge is the distance of enemy from the edge of the ellipse in terms of V
            let nudge = Math.sqrt((a*a - relativeU * relativeU) * b * b / (a * a))
            nudge -= Math.abs(relativeV);
            this.x += -v1 * nudge * relativeV / Math.abs(relativeV);
            this.y += -v2 * nudge * relativeV / Math.abs(relativeV);
            if(isNaN(nudge)){
                console.log(distance, u1, u2, v1, v2, relativeX, relativeY, relativeU, relativeV, enemyDistance)
            }
            console.log("_________________________________")
            console.log("diff: ", dx, dy)
            console.log("u: ", u1, u2)
            console.log("v: ", v1, v2)
            console.log(v1*nudge, v2*nudge);
            console.log(this.game.player.x, this.game.player.y)
            console.log(this.x, this.y)
        }
    }
    render(){
        // todo change spriteWidth and height when actually rendering the real sprite.
        const spriteWidth = 5;
        const spriteHeight = 5;
        const relativeX = this.x - this.player.x + centerX - spriteWidth;
        const relativeY = this.y - this.player.y + centerY - spriteHeight
        this.context.save();
        this.context.translate(relativeX, relativeY);
        this.context.rotate(-Math.PI / 2 + this.angle);
        this.renderSprite();
        this.context.restore();
    }
    renderSprite(){
        const sw = this.img.width / 8;
        const sh = this.img.height / 6;
        const spriteWidth = sw / 8;
        const spriteHeight = sh / 6;
        const sx = this.col * spriteWidth;
        const sy = this.row * spriteHeight;
        this.context.fillRect(0, 0, 10, 10);
        this.context.closePath();
        // this.context.drawImage(this.img, sx, sy, spriteWidth, spriteHeight, 0, 0, this.width, this.height);
    }
}
class Game{
    constructor(canvas, ctx, backgroundCanvas, backgroundContext, img, sprite_sheet) {
        this.canvas = canvas;
        this.context = ctx;
        this.width = canvas.width;
        this.height = canvas.height;
        //radius is the size of the world since our world is a circle
        this.debug = new debug(this);
        this.player = new Player(this.canvas, this.context);
        this.world = new world(canvas, ctx, WORLD_RADIUS, this.player);
        this.planetPool = new planetPool(this);
        this.background = new background(this, img, backgroundCanvas, backgroundContext);
        this.enemyPool = new enemyPool(this, sprite_sheet, 1, 6, 2, 1, 3);
    }
    update(){
        this.player.update();
        this.world.update();
        this.planetPool.update();
        // this.background.update();
        this.enemyPool.updateAndRender();
    }
    render(){
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.player.render();
        this.world.render();
        this.planetPool.render();
        // this.background.render();
        this.enemyPool.updateAndRender();
        this.debug.render();
    }
}
function handleImageLoad(){
    imgLoaded++;
    if(imgLoaded === NUM_IMAGES){
        initializeGame();
    }
}
function initializeGame(){
    spriteSheet.width = 512;
    spriteSheet.height = 385;
    game = new Game(canvas, ctx, backgroundCanvas, backgroundContext, backgroundImage, spriteSheet);
    animate();
}
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