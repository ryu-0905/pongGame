"use strict";
{
  class Block {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = this.canvas.getContext("2d");
      this.blockWidth = 70;
      this.blockHeight = 50;
      this.row_num = 999; //priority_blockHeight
      this.col_num = 999; //priority_blockWidth
      this.blocks = [];
      this.setBlock();
      this.AllCleared = false;
    }
    getBlocks() {
      return this.blocks;
    }

    rainbowColored(num) {
      switch (num % (this.row_num !== 7 ? 7 : 6)) {
        case 0:
          return "red";
          break;
        case 1:
          return "orange";
          break;
        case 2:
          return "yellow";
          break;
        case 3:
          return "yellowgreen";
          break;
        case 4:
          return "blue";
          break;
        case 5:
          return "indigo";
          break;
        case 6:
          return "purple";
          break;
        default:
          return "white";
          break;
      }
    }
    setBlock() {
      if (this.canvas.width <= this.blockWidth * this.row_num) {
        this.row_num = Math.floor(this.canvas.width / this.blockWidth);
      }
      if (this.canvas.height - 200 < this.blockHeight * this.col_num) {
        this.col_num = Math.floor(
          (this.canvas.height - 200) / this.blockHeight
        );
      }
      const block_num = this.row_num * this.col_num;
      for (let i = 0; i < block_num; i++) {
        const row = i % this.row_num;
        const col = Math.floor(i / this.row_num);
        this.blocks.push({
          x:
            this.blockWidth * row +
            (this.canvas.width - this.blockWidth * this.row_num) / 2,
          y:
            this.blockHeight * col +
            (this.canvas.height - 200 - this.blockHeight * this.col_num) / 2 +
            50,
          w: this.blockWidth,
          h: this.blockHeight,
          color: this.rainbowColored(i),
          getX() {
            return this.x;
          },
          getY() {
            return this.y;
          },
          getW() {
            return this.w;
          },
          getH() {
            return this.h;
          },
          clear() {
            this.x = -this.w;
            this.y = -this.h;
          },
        });
      }
    }

    draw() {
      this.blocks.forEach((block) => {
        this.ctx.fillStyle = block.color;
        this.ctx.fillRect(block.x, block.y, block.w, block.h);
      });
    }

    isAllCleared() {
      if (!this.blocks.length) {
        return;
      }
      this.AllCleared = true;
      for (let i = 0; i < this.blocks.length; i++) {
        if (this.blocks[i].x >= 0) {
          this.AllCleared = false;
        }
      }
      return this.AllCleared;
    }
  }
  class Racket {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = this.canvas.getContext("2d");
      this.w = 100;
      this.h = 20;
      this.x = this.canvas.width / 2 - this.w / 2;
      this.y = this.canvas.height - this.h - 30;
    }
    getX() {
      return this.x;
    }
    getY() {
      return this.y;
    }
    getW() {
      return this.w;
    }
    getH() {
      return this.h;
    }

    update() {
      document.addEventListener("mousemove", (e) => {
        const rect = this.canvas.getBoundingClientRect();
        this.x = e.clientX - rect.left - this.w / 2;
      });
      document.addEventListener("touchmove", (e) => {
        const rect = this.canvas.getBoundingClientRect();
        this.x = e.touches[0].pageX - rect.left - this.w / 2;
      });

      if (this.x < 0) {
        this.x = 0;
      }
      if (this.x > this.canvas.width - this.w) {
        this.x = this.canvas.width - this.w;
      }
    }
    draw() {
      this.ctx.fillStyle = "white";
      this.ctx.fillRect(this.x, this.y, this.w, this.h);
    }
  }
  class Ball {
    constructor(canvas, game) {
      this.canvas = canvas;
      this.ctx = this.canvas.getContext("2d");
      this.game = game;
      this.r = 10;
      this.x = this.canvas.width / 2;
      this.y = this.canvas.height - 50 - this.r;
      this.v_min = 3;
      this.v_max = 7;
      this.v_x =
        Math.floor(Math.random() * (this.v_max - this.v_min) + this.v_min) *
        (Math.random() > 0.5 ? 1 : -1);
      this.v_y =
        Math.floor(Math.random() * (this.v_max - this.v_min) + this.v_min) * -1;
      console.log(`Vx:${this.v_x} Vy:${this.v_y}`);
    }

    isMissed() {
      if (this.y + this.r > this.canvas.height) {
        return true;
      }
    }
    hit(x, y, width, height) {
      const w = width / 2;
      const h = height / 2;
      if (this.x > x - w && this.x < x + w) {
        if (y > this.y && y - this.y < h + this.r && this.v_y > 0) {
          this.v_y *= -1;
          this.y = y - h - this.r;
          return true;
        }
        if (this.y > y && this.y - y < h + this.r && this.v_y < 0) {
          this.v_y *= -1;
          this.y = y + h + this.r;
          return true;
        }
      }
      if (this.y > y - h && this.y < y + h) {
        if (x > this.x && x - this.x < w + this.r && this.v_x > 0) {
          this.v_x *= -1;
          this.x = x - w - this.r;
          return true;
        }
        if (this.x > x && this.x - x < w + this.r && this.v_x < 0) {
          this.v_x *= -1;
          this.x = x + w + this.r;
          return true;
        }
      }
      return false;
    }

    update(racket, blocks) {
      this.x += this.v_x;
      this.y += this.v_y;

      if (this.x - this.r < 0 || this.x + this.r > this.canvas.width) {
        this.v_x *= -1;
      }
      if (this.y - this.r < 0 || this.y + this.r > this.canvas.height) {
        this.v_y *= -1;
      }

      if (
        this.hit(
          racket.getX() + racket.getW() / 2,
          racket.getY() + racket.getH() / 2,
          racket.getW(),
          racket.getH()
        )
      ) {
        console.log("ok");
      }

      blocks.getBlocks().forEach((block) => {
        if (
          this.hit(
            block.getX() + block.getW() / 2,
            block.getY() + block.getH() / 2,
            block.getW(),
            block.getH()
          )
        ) {
          block.clear();
          this.game.addScore();
        }
      });
    }
    draw() {
      this.ctx.beginPath();
      this.ctx.fillStyle = "white";
      this.ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
      this.ctx.fill();
    }
  }
  class Game {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = this.canvas.getContext("2d");
      this.ball = new Ball(this.canvas, this);
      this.racket = new Racket(this.canvas);
      this.block = new Block(this.canvas);
      this.score = 0;
      this.isStarted = false;
      this.isGameCleared = false;
      this.isGameOvered = false;
    }
    addScore() {
      this.score++;
    }

    start() {
      const button = document.getElementById("button");
      button.addEventListener("click", () => {
        if (this.isStarted) {
          if (this.isGameCleared || this.isGameOvered) {
            location.reload();
          }
        } else {
          this.isStarted = true;
          button.textContent = "RESET";
          button.classList.add("activ");
        }
      });
    }

    update() {
      if (!this.isStarted) {
        return;
      }
      this.racket.update();
      this.ball.update(this.racket, this.block);

      if (this.block.isAllCleared()) {
        this.isGameCleared = true;
      }
      if (this.ball.isMissed()) {
        this.isGameOvered = true;
      }

      const button = document.getElementById("button");
      if (this.isGameCleared || this.isGameOvered) {
        button.classList.remove("activ");
      }
    }
    drawScore() {
      this.ctx.font = "24px bold";
      this.ctx.fillStyle = "white";
      this.ctx.fillText(this.score, 24, 24);
    }
    drawMask() {
      this.ctx.fillStyle = "rgba(255,255,255,.3)";
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = "white";
      this.ctx.fillRect(
        this.canvas.width / 2 - 150,
        this.canvas.height / 2 - 30,
        300,
        60
      );
      this.ctx.font = "32px 'Arial Black'";
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      this.ctx.fillStyle = "tomato";
      this.ctx.fillText(
        this.isStarted
          ? this.isGameCleared
            ? "Game Clear"
            : "Game Over"
          : "click to START",
        this.canvas.width / 2,
        this.canvas.height / 2
      );
    }
    draw() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.block.draw();
      this.racket.draw();
      this.ball.draw();
      this.drawScore();
      if (!this.isStarted || this.isGameCleared || this.isGameOvered) {
        this.drawMask();
        return;
      }
    }

    run() {
      if (this.isGameCleared || this.isGameOvered) {
        return;
      }
      this.update();
      this.draw();
      // setTimeout(() => {
      //   this.run();
      // }, 300);
      requestAnimationFrame(() => {
        this.run();
      });
    }
  }

  function main() {
    const canvas = document.querySelector("canvas");
    if (typeof canvas.getContext === undefined) {
      return;
    }
    const game = new Game(canvas);
    game.start();
    game.run();
  }
  main();
}
