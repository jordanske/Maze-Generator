window.maze = (function () {
	maze = {};

	maze.canvas = document.getElementById("myCanvas");
	maze.ctx = maze.canvas.getContext("2d");

	/* Generate the maze */

	maze.generateMaze = function (values) {

		var defaultValues = {
			cellSize: 8, //24,
			wallWidth: 2,
			rows: 100, //20,
			cols: 100, //20,
			entrance: {
				direction: 'South',
				position: 90
			},
			exit: {
				direction: 'West',
				position: 10
			}
		}

		this.cellSize = (values.cellSize ? values.cellSize : defaultValues.cellSize); // Width and Height
		this.wallWidth = (values.wallWidth ? values.wallWidth : defaultValues.wallWidth); // 2
		this.rows = (values.rows ? values.rows : defaultValues.rows); //20
		this.cols = (values.cols ? values.cols : defaultValues.cols); //20
		this.entrance = (values.entrance ? values.entrance : defaultValues.entrance);
		this.exit = (values.exit ? values.exit : defaultValues.exit);

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
		var render = true;
		[this.entrance, this.exit].forEach(function (e) {
			if (direction.name == e.direction) {
				if (direction.edgePosX >= 0) {
					if (posX == direction.edgePosX && posY == e.position) {
						render = false;
						//return;
					}
				}
				if (direction.edgePosY >= 0) {
					if (posX == e.position && posY == direction.edgePosY) {
						render = false;
						//return;
					}
				}
			}
		});
		/*if (posX == 0 && posY == 0 && direction.name == this.entrance.direction) {
			return;
		}

		if (posX == (this.cols - 1) && posY == (this.rows - 1) && direction.name == this.entrance.direction) {
			return;
		}*/
		if (render) {
			this.ctx.beginPath();
			//this.ctx.rect((posX * cellSize) + direction.wallPosition[0], (posY * cellSize) + direction.wallPosition[1], 0 + direction.wallPosition[2], 0 + direction.wallPosition[3]);
			this.ctx.rect((posX * this.cellSize) + direction.wallPosition[0], (posY * this.cellSize) + direction.wallPosition[1], 0 + direction.wallPosition[2], 0 + direction.wallPosition[3]);
			this.ctx.fillStyle = "#000000";
			this.ctx.fill();
			this.ctx.closePath();
		} else {
			maze.ctx.beginPath();
			maze.ctx.rect((posX * maze.cellSize) + (maze.cellSize / 2) - 2, (posY * maze.cellSize) + (maze.cellSize / 2) - 2, 4, 4);
			maze.ctx.fillStyle = "#FF0000";
			maze.ctx.fill();
			maze.ctx.closePath();
		}
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
				edgePosX: -1,
				startPosY: 0,
				getOpposite: function () {
					return maze.directions.South;
				}
			},
			East: {
				name: 'East',
				wallPosition: [maze.cellSize - maze.wallWidth + (maze.wallWidth / 2), 0 - (maze.wallWidth / 2), maze.wallWidth, maze.cellSize + maze.wallWidth],
				toPosition: [1, 0],
				edgePosX: this.cols - 1,
				edgePosY: -1,
				getOpposite: function () {
					return maze.directions.West;
				}
			},
			South: {
				name: 'South',
				wallPosition: [0 - (maze.wallWidth / 2), maze.cellSize - maze.wallWidth + (maze.wallWidth / 2), maze.cellSize + maze.wallWidth, maze.wallWidth],
				toPosition: [0, 1],
				edgePosX: -1,
				edgePosY: this.rows - 1,
				getOpposite: function () {
					return maze.directions.North;
				}
			},
			West: {
				name: 'West',
				wallPosition: [0 - (maze.wallWidth / 2), 0 - (maze.wallWidth / 2), maze.wallWidth, maze.cellSize + maze.wallWidth],
				toPosition: [-1, 0],
				edgePosX: 0,
				edgePosY: -1,
				getOpposite: function () {
					return maze.directions.East;
				}
			},
			GetArray: function () {
				return [
					maze.directions.North,
					maze.directions.East,
					maze.directions.South,
					maze.directions.West
				];
			},
			ByIndex: function (idx) {
				switch (idx) {
					case 0: return maze.directions.North;
					case 1: return maze.directions.East;
					case 2: return maze.directions.South;
					case 3: return maze.directions.West;
				}
			},
			ByName: function (name) {
				switch (name.toLowerCase()) {
					case 'north': return maze.directions.North;
					case 'east': return maze.directions.East;
					case 'south': return maze.directions.South;
					case 'west': return maze.directions.West;
				}
			},
			length: 4
		};

		[this.entrance, this.exit].forEach(function (e) {
			var direction = maze.directions.ByName(e.direction);
			if (direction.edgePosX >= 0) {
				e.posX = direction.edgePosX;
				e.posY = e.position;
			} else if (direction.edgePosY >= 0) {
				e.posX = e.position;
				e.posY = direction.edgePosY;
			}
		});
	}

	return maze;
})();

function GenerateRandomRange(min, max) {
	max = max - min;
	return Math.floor(Math.random() * max) + min
}
