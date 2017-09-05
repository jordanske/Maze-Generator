(function () {
	window.maze = {};

	maze.canvas = document.getElementById("myCanvas");
	maze.ctx = maze.canvas.getContext("2d");

	/* Generate the maze */

	maze.generateMaze = function (values) {

		var defaultValues = {
			cellSize: 8, //24,
			wallWidth: 2,
			rows: 100, //20,
			cols: 100, //20
		}

		this.cellSize = (values.cellSize ? values.cellSize : defaultValues.cellSize); // Width and Height
		this.wallWidth = (values.wallWidth ? values.wallWidth : defaultValues.wallWidth); // 2
		this.rows = (values.rows ? values.rows : defaultValues.rows); //20
		this.cols = (values.cols ? values.cols : defaultValues.cols); //20

		this.canvas.width = this.cols * this.cellSize;
		this.canvas.height = this.rows * this.cellSize;

		this.cellList = this.InitializeList();
		this.CalculateDirections();
		this.activeCells = [];

		this.doFirstGenerationStep();

		while (maze.activeCells.length > 0) {
			this.doNextGenerationStep();
		}
	}

	maze.doFirstGenerationStep = function () {
		var cell = this.CreateCell(GenerateRandomRange(0, this.cols), GenerateRandomRange(0, this.rows));
		this.activeCells.push(cell);
	}

	maze.doNextGenerationStep = function () {
		var activeIndex = this.activeCells.length - 1;
		var currentCell = this.activeCells[activeIndex];

		if (currentCell.IsFullyInitialized()) {
			this.activeCells.pop();
			return;
		}

		var direction = currentCell.GetRandomUninitializedDirection();
		var posX = currentCell.posX + direction.toPosition[0];
		var posY = currentCell.posY + direction.toPosition[1];

		if (this.IsInBounds(posX, posY)) {
			otherCell = this.GetCell(posX, posY);
			if (!otherCell) {
				var otherCell = this.CreateCell(posX, posY);
				this.CreatePassage(currentCell, otherCell, direction);
				this.activeCells.push(otherCell);
			} else {
				this.CreateWall(currentCell, otherCell, direction);
			}
		} else {
			this.CreateWall(currentCell, null, direction);
		}
	}

	/* Create Cell and return the cell obj */

	maze.CreateCell = function (posX, posY) {
		var cell = {};
		cell.posX = posX;
		cell.posY = posY;
		cell.initializedWallCount = 0;
		cell.walls = { North: -1, East: -1, South: -1, West: -1 };

		cell.IsFullyInitialized = function () {
			return this.initializedWallCount == maze.directions.length;
		}

		cell.SetWall = function (direction, type) {
			this.walls[direction.name] = type;
			this.initializedWallCount++;
		}

		cell.GetRandomUninitializedDirection = function () {
			var skips = GenerateRandomRange(0, maze.directions.length - this.initializedWallCount);
			for (i = 0; i < maze.directions.length; i++) {
				if (this.walls[maze.directions.ByIndex(i).name] < 0) {
					if (skips == 0) {
						return maze.directions.ByIndex(i);
					}
					skips -= 1;
				}
			}
			return cell.walls;
		}

		this.cellList[posX][posY] = cell;

		return cell;
	}

	maze.CreateWall = function (cell, otherCell, direction) {
		cell.SetWall(direction, 1);
		this.RenderWall(cell.posX, cell.posY, direction);
		if (otherCell) {
			otherCell.SetWall(direction.getOpposite(), 1);
			this.RenderWall(otherCell.posX, otherCell.posY, direction.getOpposite());
		}
	}

	maze.RenderWall = function (posX, posY, direction) {
		if (posX == 0 && posY == 0 && direction == this.directions.North) {
			return;
		}

		if (posX == (this.cols - 1) && posY == (this.rows - 1) && direction == this.directions.South) {
			return;
		}

		this.ctx.beginPath();
		//this.ctx.rect((posX * cellSize) + direction.wallPosition[0], (posY * cellSize) + direction.wallPosition[1], 0 + direction.wallPosition[2], 0 + direction.wallPosition[3]);
		this.ctx.rect((posX * this.cellSize) + direction.wallPosition[0], (posY * this.cellSize) + direction.wallPosition[1], 0 + direction.wallPosition[2], 0 + direction.wallPosition[3]);
		this.ctx.fillStyle = "#000000";
		this.ctx.fill();
		this.ctx.closePath();
	}

	maze.CreatePassage = function (cell, otherCell, direction) {
		cell.SetWall(direction, 0);
		otherCell.SetWall(direction.getOpposite(), 0);
	}

	maze.GetCell = function (posX, posY) {
		return this.cellList[posX] ? this.cellList[posX][posY] : null;
	}

	/* Check if the position is inside the boundary */

	maze.IsInBounds = function (posX, posY) {
		return posX >= 0 && posX < this.cols && posY >= 0 && posY < this.rows;
	}

	maze.InitializeList = function () {
		var list = [];
		for (x = 0; x < this.cols; x++) {
			list[x] = [];
			for (y = 0; y < this.rows; y++) {
				list[x][y] = null;
			}
		}
		return list;
	}

	/* Directions */

	maze.CalculateDirections = function () {

		this.directions = {
			North: {
				name: 'North',
				wallPosition: [0 - (maze.wallWidth / 2), 0 - (maze.wallWidth / 2), maze.cellSize + maze.wallWidth, maze.wallWidth], // X, Y, Width, Height
				toPosition: [0, -1],
				getOpposite: function () {
					return maze.directions.South;
				}
			},
			East: {
				name: 'East',
				wallPosition: [maze.cellSize - maze.wallWidth + (maze.wallWidth / 2), 0 - (maze.wallWidth / 2), maze.wallWidth, maze.cellSize + maze.wallWidth],
				toPosition: [1, 0],
				getOpposite: function () {
					return maze.directions.West;
				}
			},
			South: {
				name: 'South',
				wallPosition: [0 - (maze.wallWidth / 2), maze.cellSize - maze.wallWidth + (maze.wallWidth / 2), maze.cellSize + maze.wallWidth, maze.wallWidth],
				toPosition: [0, 1],
				getOpposite: function () {
					return maze.directions.North;
				}
			},
			West: {
				name: 'West',
				wallPosition: [0 - (maze.wallWidth / 2), 0 - (maze.wallWidth / 2), maze.wallWidth, maze.cellSize + maze.wallWidth],
				toPosition: [-1, 0],
				getOpposite: function () {
					return maze.directions.East;
				}
			},
			ByIndex: function (idx) {
				switch (idx) {
					case 0: return maze.directions.North;
					case 1: return maze.directions.East;
					case 2: return maze.directions.South;
					case 3: return maze.directions.West;
				}
			},
			length: 4
		};

	}

	maze.generateMaze({
		cellSize: 8,
		wallWidth: 2,
		rows: 100,
		cols: 100
	});
})();


function GenerateRandomRange(min, max) {
	max = max - min;
	return Math.floor(Math.random() * max) + min
}

console.log("Well, hello there! Seems we've got a curious one here, haha. Feel free to look at my code, though be warned, I made this without giving it much thought and just wanted to test out an algorithm. " +
	"If you want to learn from this I am sure there are much better examples you can find, somewhere. ");