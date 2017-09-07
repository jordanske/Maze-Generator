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
			if (direction.GetOpposite().name != directionName) {
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
	var idx = 0;
	var lineWidth = (maze.cellSize / 8);

	/*	maze.ctx.beginPath();
	
		for (var cell of cellToExit) {
			if (idx == 0) {
				maze.ctx.moveTo((cell.posX * maze.cellSize) + (maze.cellSize / 2), (cell.posY * maze.cellSize) + (maze.cellSize / 2));
			} else if (idx == cellToExit.length - 1) {
				maze.ctx.lineTo((cell.posX * maze.cellSize) + (maze.cellSize / 2), (cell.posY * maze.cellSize) + (maze.cellSize / 2));
			} else {
	
				var prevCell = cellToExit[idx - 1];
				var nextCell = cellToExit[idx + 1];
	
				maze.ctx.lineTo((cell.posX * maze.cellSize) + (maze.cellSize / 2), (cell.posY * maze.cellSize) + (maze.cellSize / 2));
				//maze.ctx.rect((cell.posX * maze.cellSize) + (maze.cellSize / 2) - (lineWidth / 2), (cell.posY * maze.cellSize) + (maze.cellSize / 2) - (lineWidth / 2), lineWidth, lineWidth);
	
			}
			idx++;
		}
		var grad = maze.ctx.createLinearGradient(0, 0, 1200, 1200);
		grad.addColorStop(0, "red");
		grad.addColorStop(1, "green");
	
		maze.ctx.strokeStyle = grad;
		maze.ctx.lineWidth = lineWidth;
		//maze.ctx.strokeStyle = "#b71c1c";
		maze.ctx.stroke();
		maze.ctx.closePath();
	*/
	var points = [];

	for (var cell of cellToExit) {
		points.push([(cell.posX * maze.cellSize) + (maze.cellSize / 2), (cell.posY * maze.cellSize) + (maze.cellSize / 2)]);
	}

	generateLine(points, maze.ctx, lineWidth);
	maze.RenderMaze();

	//generateLine([[0, 0], [100, 100], [1000, 100], [1000, 1000], [100, 1000], [100, 100]], maze.ctx, lineWidth);
}

function generateLine(points, ctx, lineWidth) {
	var percentColors = [
		{ pct: 0.0, color: { r: 244, g: 67, b: 54 } },
		//{ pct: 0.5, color: { r: 0xff, g: 0xff, b: 0 } },
		{ pct: 1.0, color: { r: 3, g: 169, b: 244 } }
	];

	if (points.length > 2) {

		ctx.lineWidth = lineWidth;

		for (var index = 0; index < points.length - 1; index++) {
			var fromPoint = points[index];
			var toPoint = points[index + 1];
			if (fromPoint && toPoint) {
				var fromX = fromPoint[0];
				var fromY = fromPoint[1];
				var toX = toPoint[0];
				var toY = toPoint[1];

				if (fromX < toX) { // to east
					fromX = fromPoint[0] - (lineWidth / 2);
					fromY = fromPoint[1];
					toX = toPoint[0] + (lineWidth / 2);
					toY = toPoint[1];
				}
				if (fromX > toX) { // To west
					fromX = fromPoint[0] + (lineWidth / 2);
					fromY = fromPoint[1];
					toX = toPoint[0] - (lineWidth / 2);
					toY = toPoint[1];
				}
				if (fromY < toY) { // To south
					fromX = fromPoint[0];
					fromY = fromPoint[1] - (lineWidth / 2);
					toX = toPoint[0];
					toY = toPoint[1] + (lineWidth / 2);
				}
				if (fromY > toY) { // To north
					fromX = fromPoint[0];
					fromY = fromPoint[1] + (lineWidth / 2);
					toX = toPoint[0];
					toY = toPoint[1] - (lineWidth / 2);
				}

				ctx.beginPath();
				var grad = ctx.createLinearGradient(fromX, fromY, toX, toY);

				/* From:   3, 169, 244
				     To: 244,  67,  54
				*/

				grad.addColorStop(0, getColorForPercentage(1 / points.length * index, percentColors));
				grad.addColorStop(1, getColorForPercentage(1 / points.length * (index + 1), percentColors));

				/*var red = 255 - (255 / points.length * index);
				var blue = (255 / points.length * index);
				grad.addColorStop(0, "rgb(" + Math.round(red) + ", 0, " + Math.round(blue) + ")");

				var red = 255 - (255 / points.length * (index + 1));
				var blue = (255 / points.length * (index + 1));
				grad.addColorStop(1, "rgb(" + Math.round(red) + ", 0, " + Math.round(blue) + ")");*/

				ctx.strokeStyle = grad;

				CTXMoveTo(fromX, fromY);
				CTXLineTo(toX, toY);
				ctx.stroke();
				ctx.closePath();
			}
		}

	}
}


var getColorForPercentage = function (pct, percentColors) {
	for (var i = 1; i < percentColors.length - 1; i++) {
		if (pct < percentColors[i].pct) {
			break;
		}
	}
	var lower = percentColors[i - 1];
	var upper = percentColors[i];
	var range = upper.pct - lower.pct;
	var rangePct = (pct - lower.pct) / range;
	var pctLower = 1 - rangePct;
	var pctUpper = rangePct;
	var color = {
		r: Math.floor(lower.color.r * pctLower + upper.color.r * pctUpper),
		g: Math.floor(lower.color.g * pctLower + upper.color.g * pctUpper),
		b: Math.floor(lower.color.b * pctLower + upper.color.b * pctUpper)
	};
	return 'rgb(' + [color.r, color.g, color.b].join(',') + ')';
	// or output as hex if preferred
}

function test(points, ctx) {
	if (points.length > 2) {
		var x, y;
		x = points[1][0];
		y = points[1][1];
		//ctx = canvas.getContext('2d');
		//ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.beginPath();
		ctx.moveTo(x, y);
		for (var count = 0; count < points.length; count++) {
			ctx.beginPath();
			ctx.moveTo(x, y);
			var newX = points[count][0];
			var newY = points[count][1];
			var f = 0.005;
			var blue = 0; //Math.sin(f * count + 0) * 127 + 128;
			var red = (255 / points.length * count); //Math.sin(f * count + 2) * 127 + 128;
			var green = 0; //Math.sin(f * count + 4) * 127 + 128;
			ctx.strokeStyle = 'rgb(' + Math.round(red) + ', ' + Math.round(green) + ', ' + Math.round(blue) + ')';


			var grad = ctx.createLinearGradient(x, y, newX, newY);

			var red = (255 / points.length * count);
			var green = 255 - (255 / points.length * count);
			console.log(red, green);
			grad.addColorStop(0, "rgb(" + Math.round(red) + ", " + Math.round(red) + ", 0)");

			var red = (255 / points.length * count);
			var green = 255 - (255 / points.length * count);
			grad.addColorStop(1, "rgb(" + Math.round(red) + ", " + Math.round(red) + ", 0)");

			ctx.strokeStyle = grad;

			x = newX;
			y = newY;
			ctx.lineTo(x, y);
			ctx.stroke();
			ctx.closePath();
		}
		ctx.stroke();
		ctx.closePath();
	}
}