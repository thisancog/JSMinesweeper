"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Minesweeper = function () {
	function Minesweeper(args) {
		var _this = this;
		_classCallCheck(this, Minesweeper);
		var defaults = { width: 30, height: 16, numMines: null, cellSize: 30, canvas: null, spritePath: 'sprite.png' };

		this.headerHeight = 100;
		this.sprites = {
			unrevealed: [500, 0],
			pressed: [450, 0],
			flagged: [300, 150],
			empty: [400, 0],
			one: [0, 0],
			two: [50, 0],
			three: [100, 0],
			four: [150, 0],
			five: [200, 0],
			six: [250, 0],
			seven: [300, 0],
			eight: [350, 0],
			mine: [400, 150],
			mineExploded: [350, 150],
			lcd1: [0, 50],
			lcd2: [50, 50],
			lcd3: [100, 50],
			lcd4: [150, 50],
			lcd5: [200, 50],
			lcd6: [250, 50],
			lcd7: [300, 50],
			lcd8: [350, 50],
			lcd9: [400, 50],
			lcd0: [450, 50],
			lcdminus: [500, 50],
			buttonDefault: [0, 125],
			buttonPressed: [75, 125],
			buttonGameOver: [150, 125],
			buttonWon: [225, 125]
		};

		this.args = Object.assign(defaults, args);
		if (this.args.width < 10) this.args.width = 10;
		if (this.args.height < 10) this.args.height = 10;

		this.revealedCount = this.args.width * this.args.height;
		this.args.numMines = this.args.numMines === null ? Math.floor(0.18 * this.revealedCount) : this.args.numMines;
		if (this.args.numMines > this.revealedCount - 9) this.args.numMines = this.revealedCount - 9;

		// create canvas if necessary
		if (this.args.canvas === null) {
			this.args.canvas = document.createElement('canvas');
			document.body.appendChild(this.args.canvas);
		}

		this.ctx = this.args.canvas.getContext('2d');
		this.args.canvas.width = this.args.width * this.args.cellSize + 16;
		this.args.canvas.height = this.headerHeight + this.args.height * this.args.cellSize + 16;
		this.ctx.fillStyle = '#BFBFBF';
		this.ctx.fillRect(0, 0, this.args.canvas.width, this.args.canvas.height);

		// draw border
		var border = [{
			color: '#797979', points: [
				[0, this.args.canvas.height], [this.args.canvas.width, this.args.canvas.height],
				[this.args.canvas.width, 0], [this.args.canvas.width - 4, 4],
				[this.args.canvas.width - 4, this.args.canvas.height - 4],
				[4, this.args.canvas.height - 4]
			]}, {
			color: '#DDD', points: [
				[0, this.args.canvas.height], [0, 0],
				[this.args.canvas.width, 0], [this.args.canvas.width - 4, 4],
				[4, 4], [4, this.args.canvas.height - 4]]
			}];

		border.forEach(function (item) {
			this.ctx.fillStyle = item.color;
			this.ctx.beginPath();
			this.ctx.moveTo(item.points[0][0], item.points[0][1]);

			for (var p = 1; p < item.points.length; p++) {
				this.ctx.lineTo(item.points[p][0], item.points[p][1]);
			}

			this.ctx.closePath();
			this.ctx.fill();
		}, this);

		this.sprite = new Image();
		this.sprite.onload = function() { return _this.start(); };
		this.sprite.src = this.args.spritePath;

		this.args.canvas.addEventListener('mousedown', function (e) { return _this.cellDown(e); });
		this.args.canvas.addEventListener('click', function (e) { return _this.cellClick(e); });
		this.args.canvas.addEventListener('contextmenu', function (e) { return _this.setFlag(e); });
	}

	_createClass(Minesweeper, [{
		key: 'start',
		value: function start() {
			this.startTime = null;
			this.revealedCount = this.args.width * this.args.height;
			this.minesLeft = this.args.numMines;
			this.gameover = false;
			this.won = false;
			this.cells = [];

			for (var x = 0; x < this.args.width; x++) {
				var row = [];
				for (var y = 0; y < this.args.height; y++) {
					row.push(new Cell(x, y));
				}
				this.cells.push(row);
			}

			this.drawCells();
			this.drawClock();
			this.drawButton();
			this.drawMinesCounter();
		}
	}, {
		key: 'buttonClicked',
		value: function buttonClicked(e) {
			var size = 1.5 * this.args.cellSize;
			return  e.offsetY >= 0.5 * (this.headerHeight - size) + 8  && e.offsetY <= 0.5 * (this.headerHeight + size) + 8 &&
					e.offsetX >= 0.5 * (this.args.canvas.width - size) && e.offsetX <= 0.5 * (this.args.canvas.width + size);
		}
	}, {
		key: 'cellDown',
		value: function cellDown(e) {
			if (e.offsetY <= this.headerHeight + 8) {
				if (this.buttonClicked(e)) this.drawButton(1);
				return;
			}

			var coords = this.getCoords(e);
			this.pressed = this.cells[coords.x][coords.y];
			this.pressed.pressed = true;
			if (this.gameover === false && this.won === false && !this.cells[coords.x][coords.y].revealed) this.drawButton(1);
			this.drawCells();
		}
	}, {
		key: 'cellClick',
		value: function cellClick(e) {
			if (e.offsetY <= this.headerHeight + 8 || this.won !== false || this.gameover !== false) {
				if (this.buttonClicked(e)) {
					this.drawButton();
					this.start();
				}
				return;
			}

			var coords = this.getCoords(e);

			if (this.cells[coords.x][coords.y].flagged || this.cells[coords.x][coords.y].revealed) return;
			this.pressed.pressed = false;
			this.drawButton(0);

			if (this.startTime !== null)
				this.revealCell(coords.x, coords.y);
			else
				this.spreadMines(coords.x, coords.y);
		}
	}, {
		key: 'setFlag',
		value: function setFlag(e) {
			e.preventDefault();
			if (e.offsetY < this.headerHeight + 8 || this.gameover !== false || this.won !== false) return;

			var coords = this.getCoords(e);
			if (this.cells[coords.x][coords.y].revealed) return;
			this.pressed.pressed = false;
			this.drawButton(0);

			if (this.cells[coords.x][coords.y].flagged) {
				this.cells[coords.x][coords.y].flagged = false;
				this.minesLeft++;
			} else {
				this.cells[coords.x][coords.y].flagged = true;
				this.minesLeft--;
			}

			this.drawMinesCounter();
			this.drawCells();
		}
	}, {
		key: 'getCoords',
		value: function getCoords(e) {
			return {
				x: Math.floor((e.offsetX - 8) * this.args.width / (this.args.canvas.width - 16)),
				y: Math.floor((e.offsetY - this.headerHeight - 8) * this.args.height / (this.args.canvas.height - this.headerHeight - 16))
			};
		}
	}, {
		key: 'spreadMines',
		value: function spreadMines(x, y) {
			var mines = 0;

			while (mines < this.args.numMines) {
				var randx = Math.floor(Math.random() * this.args.width),
				    randy = Math.floor(Math.random() * this.args.height);

				if (!(Math.abs(randx - x) <= 1 && Math.abs(randy - y) <= 1) && this.cells[randx][randy].content !== -1) {
					this.cells[randx][randy].content = -1;

					for (var i = -1; i < 2; i++) {
						for (var j = -1; j < 2; j++) {
							var neighX = randx + i,
							    neighY = randy + j;

							if (neighX > -1 && neighX < this.args.width && neighY > -1 && neighY < this.args.height &&
								!(neighX == randx && neighY == randy) && this.cells[neighX][neighY].content !== -1)
								this.cells[neighX][neighY].content++;
						}
					}

					mines++;
				}
			}

			this.startTime = Date.now();
			this.floodReveal(x, y);
			this.drawCells();
		}
	}, {
		key: 'drawCells',
		value: function drawCells() {
			var contentArray = [this.sprites.mine, this.sprites.empty, this.sprites.one, this.sprites.two, this.sprites.three, this.sprites.four, this.sprites.five, this.sprites.six, this.sprites.seven, this.sprites.eight];

			for (var x = 0; x < this.args.width; x++) {
				for (var y = 0; y < this.args.height; y++) {
					var cell = this.cells[x][y],
					    sprite;

					if (cell.flagged) {
						sprite = this.sprites.flagged;
					} else if (this.gameover !== false) {
						sprite = cell.exploded ? this.sprites.mineExploded : contentArray[cell.content + 1];
					} else if (!cell.revealed) {
						sprite = cell.pressed ? this.sprites.pressed : this.sprites.unrevealed;
					} else {
						sprite = contentArray[cell.content + 1];
					}

					this.ctx.drawImage(
						this.sprite, sprite[0], sprite[1], 50, 50,
						8 + x * this.args.cellSize, 8 + this.headerHeight + y * this.args.cellSize,
						this.args.cellSize, this.args.cellSize
					);
				}
			}
		}
	}, {
		key: 'drawClock',
		value: function drawClock() {
			var time;

			if (this.gameover !== false)
				time = Math.floor((this.gameover - this.startTime) / 1000);
			else if (this.won !== false)
				time = Math.floor((this.won - this.startTime) / 1000);
			else
				time = this.startTime === null ? 0 : Math.floor((Date.now() - this.startTime) / 1000);

			time = ('000' + time.toString()).substr(-3);
			for (var i = 0; i < 3; i++) {
				var sprite = this.sprites['lcd' + time.substr(i, 1)];
				this.ctx.drawImage(
					this.sprite, sprite[0], sprite[1], 50, 75,
					8 + this.args.cellSize * i, 8 + 0.5 * (this.headerHeight - this.args.cellSize * 1.5),
					this.args.cellSize, this.args.cellSize * 1.5
				);
			}
			requestAnimationFrame(this.drawClock.bind(this));
		}
	}, {
		key: 'drawMinesCounter',
		value: function drawMinesCounter() {
			var minesLeft = ('000' + Math.abs(this.minesLeft).toString()).substr(-3);
			minesLeft = Math.sign(this.minesLeft) < 0 ? '-' + minesLeft.substr(1, 2) : minesLeft;

			for (var i = 0; i < 3; i++) {
				var index = minesLeft.substr(i, 1) !== '-' ? [minesLeft.substr(i, 1)] : 'minus',
				    sprite = this.sprites['lcd' + index];

				this.ctx.drawImage(
					this.sprite, sprite[0], sprite[1], 50, 75,
					this.args.canvas.width - 8 + this.args.cellSize * (i - 3), 8 + 0.5 * (this.headerHeight - this.args.cellSize * 1.5),
					this.args.cellSize, this.args.cellSize * 1.5
				);
			}
		}
	}, {
		key: 'drawButton',
		value: function drawButton() {
			var index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

			var sprites = ['buttonDefault', 'buttonPressed', 'buttonGameOver', 'buttonWon'],
			    size = 1.5 * this.args.cellSize;

			this.ctx.drawImage(
				this.sprite, this.sprites[sprites[index]][0], this.sprites[sprites[index]][1], 75, 75,
				0.5 * (this.args.canvas.width - size), 8 + 0.5 * (this.headerHeight - size),
				size, size
			);
		}
	}, {
		key: 'revealCell',
		value: function revealCell(x, y) {
			if (this.cells[x][y].reveal()) {
				this.updateCounter();
				this.gameOver();
			} else {
				this.floodReveal(x, y);
				this.drawCells();
			}
		}
	}, {
		key: 'floodReveal',
		value: function floodReveal(x, y) {
			this.cells[x][y].reveal();
			this.updateCounter();

			if (this.cells[x][y].content === 0) {
				for (var i = -1; i < 2; i++) {
					for (var j = -1; j < 2; j++) {
						var newx = x + i,
						    newy = y + j;

						if ( newx > -1 && newx < this.args.width && newy > -1 && newy < this.args.height &&
							!(newx == x && newy == y) && !this.cells[newx][newy].flagged &&
							!this.cells[newx][newy].revealed) {
								this.floodReveal(newx, newy);
						}
					}
				}
			}
		}
	}, {
		key: 'updateCounter',
		value: function updateCounter() {
			this.revealedCount--;
			if (this.revealedCount === this.args.numMines) this.win();
		}
	}, {
		key: 'win',
		value: function win() {
			this.won = Date.now();
			for (var x = 0; x < this.args.width; x++) {
				for (var y = 0; y < this.args.height; y++) {
					this.cells[x][y].reveal();
				}
			}
			this.minesLeft = 0;
			this.drawMinesCounter();
			this.drawButton(3);
			this.drawCells();
		}
	}, {
		key: 'gameOver',
		value: function gameOver() {
			this.gameover = Date.now();
			this.drawButton(2);
			this.drawCells();
		}
	}]);

	return Minesweeper;
}();

var Cell = function () {
	function Cell(x, y) {
		_classCallCheck(this, Cell);

		this.x = x;
		this.y = y;
		this.revealed = false;
		this.content = 0; // 0: empty, -1: mine, 1+: neighbours
		this.flagged = false;
		this.pressed = false;
		this.exploded = false;
	}

	_createClass(Cell, [{
		key: 'reveal',
		value: function reveal(grid) {
			this.revealed = true;
			if (this.content === -1) {
				this.exploded = true;
				return true;
			}

			return;
		}
	}]);

	return Cell;
}();