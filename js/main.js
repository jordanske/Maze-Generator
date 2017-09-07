$(function () {
	$(".open-side-nav").sideNav();

	$mazeInputX = $("#maze_input_x");
	$mazeInputY = $("#maze_input_y");
	$mazeDirSelect = $("#maze_dir_select");
	$mazeDirSelect.material_select();

	$mazeInputX.val(20);
	$mazeInputY.val(20);
	$mazeDirSelect.val("");

	maze.generateMaze({
		rows: 20,
		cols: 20
	});

	$menuButtonGenerate = $("#menu_button_generate");
	$menuButtonSolve = $("#menu_button_solve");

	$menuButtonGenerate.click(function () {
		var x = parseInt($mazeInputX.val());
		var y = parseInt($mazeInputY.val());

		var x = Math.min(Math.max(x, 2), 130);
		var y = Math.min(Math.max(y, 2), 130);

		$mazeInputX.val(x);
		$mazeInputY.val(y);

		if (x > 0 && y > 0) {
			maze.generateMaze({
				rows: x,
				cols: y,
				entrance: $mazeDirSelect.val()
			});
		}
	});

	$menuButtonSolve.click(function () {
		solve(maze);
	});

	/* Calculate canvas dimensions */

	$main = $("main");
	$canvas = $("#maze-canvas");
	$(window).resize(function () {
		calculateCanvasSize();
	});

	function calculateCanvasSize() {
		var width = $main.width();
		var height = $main.height();
		var size = 0;
		if (width > height) {
			size = height - 20;
		} else {
			size = width - 20;
		}
		$canvas.width(size);
		$canvas.height(size);
	}

	calculateCanvasSize();
});

console.log("Well, hello there! Seems we've got a curious one here, haha. Feel free to look at my code, though be warned, I made this without giving it much thought and just wanted to test out an algorithm. " +
	"If you want to learn from this I am sure there are much better examples you can find, somewhere. ");
