function solve(maze) {
	if (!maze) {
		return;
	}

	var steps = 0;
	var mazeEntrance = maze.entrance;
	var mazeExit = maze.exit;
	var directionsArray = maze.directions.GetArray();
	var cellToExit = [];

	function checkCell(posX, posY, directionName, step) {
		var currentCell = maze.GetCell(posX, posY);
		if (posX == mazeExit.posX && posY == mazeExit.posY) {
			cellToExit.push(currentCell);
			return true;
		}
		var exitFound = false;
		//var checkedDirections = {North: false, East: false, South: false, West: false};

		//directionsArray.forEach(function(direction) {
		for (var direction of directionsArray) {
			if (direction.getOpposite().name != directionName) {
				var currentWall = currentCell.walls[direction.name];
				if (currentWall == 0) {
					var nextPosX = currentCell.posX + direction.toPosition[0];
					var nextPosY = currentCell.posY + direction.toPosition[1];
					exitFound = checkCell(nextPosX, nextPosY, direction.name, step + 1);

					if (exitFound) {
						break;
					}
				}
			}
			//checkedDirections[direction.name] = true;
		};

		if (exitFound) {
			cellToExit.push(currentCell);
		}
		return exitFound;
	}


	var exitFound = checkCell(mazeEntrance.posX, mazeEntrance.posY, '', 0);
	console.log(cellToExit);
	for (var cell of cellToExit) {

		maze.ctx.beginPath();
		maze.ctx.rect((cell.posX * maze.cellSize) + (maze.cellSize / 2) - 2, (cell.posY * maze.cellSize) + (maze.cellSize / 2) - 2, 4, 4);
		maze.ctx.fillStyle = "#00FF00";
		maze.ctx.fill();
		maze.ctx.closePath();
	}
}