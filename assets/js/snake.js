const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

class Square {
    constructor(y, x) {
        this.y = y;
        this.x = x;
    }
    equals(other) {
        return this.x == other.x && this.y == other.y;
    }
}

const DIRECTION = {
    NORTH: 0,
    EAST: 1,
    SOUTH: 2,
    WEST: 3
};

const OBJECTS = {
    EMPTY: 0,
    SNAKE: 1,
    FOOD: 2,
    SNAKE_HEAD: 3,
    SNAKE_TAIL: 4
};

class Snake {
    constructor(y, x, direction) {
        this.direction = direction;
        this.tailDirection = direction;
        this.shouldGrow = false;
        let move = this.getMove();
        this.body = [
            new Square(y, x),
            new Square(y - move.dy, x + move.dx),
            new Square(y - move.dy*2, x + move.dx*2),
        ]
    }
    grow() {
        this.shouldGrow = true;
    }
    getMove() {
        switch (this.direction) {
            case DIRECTION.NORTH:    return {dx: 0, dy: -1};
            case DIRECTION.EAST: return {dx: 1, dy: 0};
            case DIRECTION.SOUTH:  return {dx: 0, dy: 1};
            case DIRECTION.WEST:  return {dx: -1, dy: 0};
        }
    }
    selfHit() {
        for (let i = 1; i < this.body.length; i++) {
            let part = this.body[i];
            if (part.equals(this.body[0])) {
                return true;
            }
        }
        return false;
    }
    setDirection(direction) {
        if (this.direction == DIRECTION.NORTH && direction == DIRECTION.SOUTH) return;
        if (this.direction == DIRECTION.EAST && direction == DIRECTION.WEST) return;
        if (this.direction == DIRECTION.SOUTH && direction == DIRECTION.NORTH) return;
        if (this.direction == DIRECTION.WEST && direction == DIRECTION.EAST) return;
        this.direction = direction;
    }
    move() {
        let move = this.getMove();
        let x = this.body[0].x + move.dx;
        let y = this.body[0].y + move.dy;
        let newSquare = new Square(y, x);


        if (!this.shouldGrow) {
            this.body.pop();
        } else {
            this.shouldGrow = false;
        }

        this.body.unshift(newSquare);
        this.updateTailDirection();

    }

    updateTailDirection() {
        let lastTail = this.body[this.body.length-1];
        let secondLastTail = this.body[this.body.length-2];
        let dx = secondLastTail.x - lastTail.x;
        let dy = secondLastTail.y - lastTail.y;
        if (dx == 0 && dy == 1) {
            this.tailDirection = DIRECTION.SOUTH;
        } else if (dx == 0 && dy == -1) {
            this.tailDirection = DIRECTION.NORTH;
        } else if (dx == 1 && dy == 0) {
            this.tailDirection = DIRECTION.EAST;
        } else if (dx == -1 && dy == 0) {
            this.tailDirection = DIRECTION.WEST;
        }
    }
}


class Game {

    static points = 0;
    static GAME_OVER = 0;
    static GAME_RUNNING = 1;
    static GAME_STOPPED = 2;

    constructor(gameSize) {
        Game.points = 0;
        this.state = Game.GAME_RUNNING;

        this.gameSize = gameSize;
        this.gridSize = canvas.width / gameSize;

        this.fps = 6;
        this.level = 0;
        this.timeCounter = 0;
        this.lastTime = 0;

        this.grid = [];
        for (let row = 0; row < gameSize; row++) {
            this.grid.push([]);
            for (let col = 0; col < gameSize; col++) {
                this.grid[row].push(OBJECTS.EMPTY);
            }
        }

        this.scoreLabel = document.getElementById('score');

        this.snake = null;
        this.food = null;
        this.images = {};
        this.loadedImages = 0;

        this.loadImages();
        this.restart();
    }
    loadImages() {
        this.images[OBJECTS.SNAKE] = new Image(this.gridSize, this.gridSize);
        this.images[OBJECTS.SNAKE_TAIL] = new Image(this.gridSize, this.gridSize);
        this.images[OBJECTS.SNAKE_HEAD] = new Image(this.gridSize, this.gridSize);
        this.images[OBJECTS.FOOD] = new Image(this.gridSize, this.gridSize);

        this.images[OBJECTS.SNAKE_TAIL].src = '/snake/assets/images/snake_tail.svg';
        this.images[OBJECTS.SNAKE].src = '/snake/assets/images/snake_body.svg';
        this.images[OBJECTS.SNAKE_HEAD].src = '/snake/assets/images/snake_head.svg';
        this.images[OBJECTS.FOOD].src = '/snake/assets/images/food.svg';

        this.images[OBJECTS.SNAKE].onload = () => this.loadedImages++;
        this.images[OBJECTS.SNAKE_HEAD].onload = () => this.loadedImages++;
        this.images[OBJECTS.SNAKE_TAIL].onload = () => this.loadedImages++;
        this.images[OBJECTS.FOOD].onload = () => this.loadedImages++;
    }
    restart() {
        Game.points = 0;
        this.fps = 6;
        this.makeNewSnake();
        this.makeNewFood();
        this.updateGrid();
        this.render();
        keyState = KEY_STATE.UP;
        this.state = Game.GAME_STOPPED;
    }
    makeNewFood() {
        let x, y;
        do {
            x = Math.floor(Math.random() * this.gameSize);
            y = Math.floor(Math.random() * this.gameSize);
            console.log(y, x)
        } while (this.grid[y][x] != OBJECTS.EMPTY);

        if (this.food != null) {
            this.grid[this.food.y][this.food.x] = OBJECTS.EMPTY;
        }

        this.food = new Square(y, x);
        return this.food;
    }
    makeNewSnake() {
        let x = 5;
        let y = 5;
        this.snake = new Snake(x, y, DIRECTION.NORTH);
        return this.snake;
    }
    outOfBounds() {
        let head = this.snake.body[0];
        return head.x < 0 || head.x >= this.gameSize || head.y < 0 || head.y >= this.gameSize;
    }
    play() {
        show(popup);
        this.countdown(3);
    }
    start() {
        this.state = Game.GAME_RUNNING;
        this.autoUpdate(0);
    }

    countdown(count) {
        popupText.innerHTML = count;
        console.log(count)
        if (count > 0) {
            setTimeout(() => this.countdown(count-1), 1000, []);
        } else {
            hide(popup);
            this.start();
        }
    }
    autoUpdate(time) {
        if (this.state != Game.GAME_RUNNING)
            return;

        let elapsedTime = time - this.lastTime;
        this.lastTime = time;

        let delay = (1 / this.fps) * 1000;
        if (this.timeCounter > delay) {
            this.update();
            this.timeCounter = 0;
        }

        this.timeCounter += elapsedTime;
        requestAnimationFrame(time => this.autoUpdate(time));
    }

    update() {
        if (this.state == Game.GAME_OVER) {
            return;
        }

        this.snake.setDirection(keyState);
        this.snake.move();
        if (this.snake.selfHit() || this.outOfBounds()) {
            this.gameOver();
            return;
        }

        let head = this.snake.body[0];
        if (head.equals(this.food)) {
            this.snake.grow();
            this.addPoint();
            this.makeNewFood();
        }

        this.updateScore();
        this.updateGrid();
        this.render();
    }

    gameOver() {
        this.state = Game.GAME_OVER;
        finalScore.innerHTML = Game.points;
        show(popupRestart);
    }
    updateScore() {
        this.scoreLabel.innerHTML = Game.points;
    }
    renderGrid(row, col) {
        let y = row * this.gridSize;
        let x = col * this.gridSize;
        ctx.beginPath();
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;

        let obj = this.grid[row][col];

        if (obj == OBJECTS.EMPTY) {
            ctx.fillStyle = 'black';
            ctx.fillRect(x, y, x+this.gridSize, y+this.gridSize);
            ctx.fill();
        } else {
            let image = this.images[obj];

            if (obj == OBJECTS.SNAKE_HEAD || obj == OBJECTS.SNAKE_TAIL) {
                let direction = obj == OBJECTS.SNAKE_HEAD ? this.snake.direction : this.snake.tailDirection;
                let degrees;

                switch (direction) {
                    case DIRECTION.NORTH: degrees = 0; break;
                    case DIRECTION.EAST: degrees = 90; break;
                    case DIRECTION.SOUTH: degrees = 180; break;
                    case DIRECTION.WEST: degrees = -90; break;
                }

                ctx.save();
                ctx.translate(x+this.gridSize/2, y+this.gridSize/2);
                ctx.rotate(degrees * Math.PI / 180);
                ctx.drawImage(image, -image.width / 2, -image.height / 2);
                ctx.restore();
            } else {
                ctx.drawImage(this.images[obj], x, y);
            }
        }

    }
    updateGrid() {
        for (let row = 0; row < this.gameSize; row++) {
            for (let col = 0; col < this.gameSize; col++) {
                this.grid[row][col] = OBJECTS.EMPTY;
            }
        }

        this.grid[this.food.y][this.food.x] = OBJECTS.FOOD;

        for (let i = 0; i < this.snake.body.length; i++) {
            let part = this.snake.body[i];
            if (i == 0) {
                this.grid[part.y][part.x] = OBJECTS.SNAKE_HEAD;
            } else if (i == this.snake.body.length-1) {
                this.grid[part.y][part.x] = OBJECTS.SNAKE_TAIL;
            } else {
                this.grid[part.y][part.x] = OBJECTS.SNAKE;
            }
        }
    }
    addPoint() {
        Game.points++;
        this.FPS_LIMIT = 15;
        this.fps += .5;
        if (this.fps > this.FPS_LIMIT) {
            this.fps = FPS_LIMIT;
        }
    }
    render() {
        if (this.loadedImages < 4) {
            setInterval(() => this.render(), 50);
        }
        for (let row = 0; row < this.gameSize; row++) {
            for (let col = 0; col < this.gameSize; col++) {
                this.renderGrid(row, col);
            }
        }
    }
}


let GAME_SIZE = 10;

const game = new Game(GAME_SIZE);

document.getElementById('restart').addEventListener('click', () => {
    hide(popupRestart);
    game.restart();
    game.play();
})

game.play();