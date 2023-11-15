canvas = document.getElementById("game-canvas");
ctx = canvas.getContext("2d");

//resize canvas to fill window
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Player {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.context = ctx;
        this.canvasPosX = this.canvas.width / 2;
        this.canvasPosY = this.canvas.height / 2;
    }
    render(context){
        context.beginPath();
        context.moveTo(this.canvasPosX, this.canvasPosY);
        context.lineTo(this.canvasPosX - 20, this.canvasPosY);
        context.lineTo(this.canvasPosX, this.canvasPosY - 40);
        context.lineTo(this.canvasPosX + 20, this.canvasPosY);
        context.fill();
        context.closePath();
    }
}

class Game{
    player;
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.context = ctx;
        this.player = new Player(this.canvas, this.context);
        this.render(this.context);
    }
    render(context){
        context.beginPath();
        context.arc(400, 400, 150, 0, Math.PI);
        context.stroke();
        context.closePath();
        this.player.render(context);
    }
}

game = new Game(canvas, ctx);

// function animate(){
//     // game.();
//     game.render();
//     requestAnimationFrame(animate)
// }
//
// canvas.addEventListener("mousemove", e=>{
//
// })