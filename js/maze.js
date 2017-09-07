window.maze = (function () {
	maze = {};

	maze.canvas = document.getElementById("maze-canvas");
	maze.ctx = maze.canvas.getContext("2d");

	/* Generate the maze */

	maze.generateMaze = function (values) {

		var defaultValues = {
			rows: 100,
			cols: 100,
			entrance: ""
		}

		this.cellSize = 10;
		this.wallWidth = 2;
		this.rows = (values.rows ? values.rows : defaultValues.rows);
		this.cols = (values.cols ? values.cols : defaultValues.cols);
		this.entranceLocation = (values.entrance ? values.entrance : defaultValues.entrance);

		this.canvas.width = 1200;
		this.canvas.height = 1200;

		this.cellSize = 1200 / (this.rows > this.cols ? this.rows : this.cols);
		this.wallWidth = this.cellSize * 0.2;

		this.cellList = this.InitializeList();
		this.CalculateDirections();
		this.activeCells = [];

		this.setRandomGateways();

		this.doFirstGenerationStep();

		while (maze.activeCells.length > 0) {
			this.doNextGenerationStep();
		}

		this.RenderMaze();
	}

	maze.setRandomGateways = function () {
		this.entrance = {
			color: "#03a9f4",
			isExit: false
		};
		this.exit = {
			color: "#f44336",
			isExit: true
		};
		var direction = null;

		[this.entrance, this.exit].forEach(function (e) {
			if (!direction) {
				if (!maze.entranceLocation || maze.entranceLocation == "") {
					direction = maze.directions.ByIndex(GenerateRandomRange(0, maze.directions.length));
				} else {
					direction = maze.directions.ByName(maze.entranceLocation);
				}
				e.direction = direction;
			} else {
				e.direction = direction.GetOpposite();
			}

			if (e.direction.edgePosX >= 0) {
				e.posX = e.direction.edgePosX;
				e.posY = GenerateRandomRange(0, maze.rows);
			} else if (e.direction.edgePosY >= 0) {
				e.posX = GenerateRandomRange(0, maze.cols);
				e.posY = e.direction.edgePosY;
			}
		});
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

		cell.IsWall = function (direction) {
			return this.walls[direction.name] == 1;
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

	/* Create a wall */

	maze.CreateWall = function (cell, otherCell, direction) {
		cell.SetWall(direction, 1);
		//this.RenderWall(cell.posX, cell.posY, direction);
		if (otherCell) {
			otherCell.SetWall(direction.GetOpposite(), 1);
			//this.RenderWall(otherCell.posX, otherCell.posY, direction.GetOpposite());
		}
	}

	maze.RenderWall = function (posX, posY, direction) {
		/*var isGateway = false;
		//var color = "#000000";
		[this.entrance, this.exit].forEach(function (e) {
			if (direction.name == e.direction.name) {
				if (posX == e.posX && posY == e.posY) {
					//color = e.color;
					isGateway = true;
				}
			}
		});*/

		var gateway = maze.IsGateway(posX, posY, direction);

		if (!gateway) {
			this.ctx.beginPath();
			this.ctx.rect((posX * this.cellSize) + direction.wallPosition[0], (posY * this.cellSize) + direction.wallPosition[1], 0 + direction.wallPosition[2], 0 + direction.wallPosition[3]);
			this.ctx.fillStyle = "#000000";
			this.ctx.fill();
			this.ctx.closePath();
		}/* else {
			var gatewaySize = maze.cellSize - maze.wallWidth;
			maze.ctx.beginPath();
			maze.ctx.rect((posX * maze.cellSize) + (maze.cellSize / 2) - (gatewaySize / 2), (posY * maze.cellSize) + (maze.cellSize / 2) - (gatewaySize / 2), gatewaySize, gatewaySize);
			maze.ctx.fillStyle = color;
			maze.ctx.fill();
			maze.ctx.closePath();
		}*/
	}

	maze.RenderCell = function (posX, posY, direction) {
		var gateway = maze.IsGateway(posX, posY);

		if (gateway) {
			if (!gateway.isExit) {
				gateway.direction.DrawGateway(posX, posY, gateway);
			} else {
				gateway.direction.GetOpposite().DrawGateway(posX, posY, gateway);
			}
		}
	}

	maze.RenderMaze = function () {

		/* Render Cells */

		for (x = 0; x < this.cols; x++) {
			for (y = 0; y < this.rows; y++) {
				var cell = this.GetCell(x, y);
				if (cell) {
					this.RenderCell(cell.posX, cell.posY);
				}
			}
		}

		/* Render Wall */

		var directions = this.directions.GetArray();

		for (x = 0; x < this.cols; x++) {
			for (y = 0; y < this.rows; y++) {
				var cell = this.GetCell(x, y);
				if (cell) {
					for (var direction of directions) {
						if (cell.IsWall(direction)) {
							this.RenderWall(cell.posX, cell.posY, direction);
						}
					}
				}
			}
		}
	}

	maze.CreatePassage = function (cell, otherCell, direction) {
		cell.SetWall(direction, 0);
		otherCell.SetWall(direction.GetOpposite(), 0);
	}

	maze.GetCell = function (posX, posY) {
		return this.cellList[posX] ? this.cellList[posX][posY] : null;
	}

	maze.IsGateway = function (posX, posY, direction) {
		var gateway = null;
		[this.entrance, this.exit].forEach(function (e) {
			if (!direction || direction.name == e.direction.name) {
				if (posX == e.posX && posY == e.posY) {
					gateway = e;
				}
			}
		});

		return gateway;
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
				edgePosY: 0,
				GetOpposite: function () {
					return maze.directions.South;
				},
				DrawGateway: function (posX, posY, gateway) {
					var gatewaySize = maze.cellSize - maze.wallWidth;
					maze.ctx.beginPath();

					maze.ctx.moveTo((posX * maze.cellSize) + (maze.wallWidth / 2), (posY * maze.cellSize) + (maze.wallWidth / 2));
					maze.ctx.lineTo((posX * maze.cellSize) + gatewaySize + (maze.wallWidth / 2), (posY * maze.cellSize) + (maze.wallWidth / 2));
					maze.ctx.lineTo((posX * maze.cellSize) + (maze.cellSize / 2), (posY * maze.cellSize) + gatewaySize);

					maze.ctx.fillStyle = gateway.color;
					maze.ctx.fill();
					maze.ctx.closePath();
				}
			},
			East: {
				name: 'East',
				wallPosition: [maze.cellSize - maze.wallWidth + (maze.wallWidth / 2), 0 - (maze.wallWidth / 2), maze.wallWidth, maze.cellSize + maze.wallWidth],
				toPosition: [1, 0],
				edgePosX: this.cols - 1,
				edgePosY: -1,
				GetOpposite: function () {
					return maze.directions.West;
				},
				DrawGateway: function (posX, posY, gateway) {
					var gatewaySize = maze.cellSize - maze.wallWidth;
					maze.ctx.beginPath();

					maze.ctx.moveTo((posX * maze.cellSize) + (maze.wallWidth / 2), (posY * maze.cellSize) + (maze.cellSize / 2));
					maze.ctx.lineTo((posX * maze.cellSize) + gatewaySize + (maze.wallWidth / 2), (posY * maze.cellSize) + (maze.wallWidth / 2));
					maze.ctx.lineTo((posX * maze.cellSize) + gatewaySize + (maze.wallWidth / 2), (posY * maze.cellSize) + gatewaySize + (maze.wallWidth / 2));

					maze.ctx.fillStyle = gateway.color;
					maze.ctx.fill();
					maze.ctx.closePath();
				}
			},
			South: {
				name: 'South',
				wallPosition: [0 - (maze.wallWidth / 2), maze.cellSize - maze.wallWidth + (maze.wallWidth / 2), maze.cellSize + maze.wallWidth, maze.wallWidth],
				toPosition: [0, 1],
				edgePosX: -1,
				edgePosY: this.rows - 1,
				GetOpposite: function () {
					return maze.directions.North;
				},
				DrawGateway: function (posX, posY, gateway) {
					var gatewaySize = maze.cellSize - maze.wallWidth;
					maze.ctx.beginPath();

					maze.ctx.moveTo((posX * maze.cellSize) + (maze.cellSize / 2), (posY * maze.cellSize) + (maze.wallWidth / 2));
					maze.ctx.lineTo((posX * maze.cellSize) + gatewaySize + (maze.wallWidth / 2), (posY * maze.cellSize) + gatewaySize + (maze.wallWidth / 2));
					maze.ctx.lineTo((posX * maze.cellSize) + (maze.wallWidth / 2), (posY * maze.cellSize) + gatewaySize + (maze.wallWidth / 2));

					maze.ctx.fillStyle = gateway.color;
					maze.ctx.fill();
					maze.ctx.closePath();
				}
			},
			West: {
				name: 'West',
				wallPosition: [0 - (maze.wallWidth / 2), 0 - (maze.wallWidth / 2), maze.wallWidth, maze.cellSize + maze.wallWidth],
				toPosition: [-1, 0],
				edgePosX: 0,
				edgePosY: -1,
				GetOpposite: function () {
					return maze.directions.East;
				},
				DrawGateway: function (posX, posY, gateway) {
					var gatewaySize = (maze.cellSize - maze.wallWidth);
					maze.ctx.beginPath();

					maze.ctx.moveTo((posX * maze.cellSize) + (maze.wallWidth / 2), (posY * maze.cellSize) + (maze.wallWidth / 2));
					maze.ctx.lineTo((posX * maze.cellSize) + gatewaySize + (maze.wallWidth / 2), (posY * maze.cellSize) + (maze.cellSize / 2));
					maze.ctx.lineTo((posX * maze.cellSize) + (maze.wallWidth / 2), (posY * maze.cellSize) + gatewaySize + (maze.wallWidth / 2));

					maze.ctx.fillStyle = gateway.color;
					maze.ctx.fill();
					maze.ctx.closePath();
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
	}

	return maze;
})();

function GenerateRandomRange(min, max) {
	max = max - min;
	return Math.floor(Math.random() * max) + min
}
