# JSMinesweeper
I was bored. So I scribbled Minesweeper in JavaScript while there are already more than enough implementations. Has everything but highscores because who needs highscores.

See a live demo here: https://thisancog.github.io/JSMinesweeper/demo.html

## Usage ##
```<script src="minesweeper.js" type="text/javascript"></script>
<script>
  var options = {…};
  var minesweeper = new Minesweeper(options);
</script>
```

You can pass options as a JavaScript object, if you like:

* _width_: number of cells per row (default: 30, minimum: 10)
* _height_: number of cells per column (default: 16, minimum: 10)
* _numMines_: number of mines to hide on the board (default: 18% of cell total)
* _cellSize_: width and height of cells in pixels (default: 30)
* _canvas_: pass a HTML5 canvas element as reference (default: automatically creates a new element)
* _spritePath_: path to a custom sprite. see code and example for layout.
