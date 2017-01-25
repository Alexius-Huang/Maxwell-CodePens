var $canvas = {
  element: null,
  width: null,
  height: null
};
var $ctx = null;
var $grid = {
  maxRow: NaN,
  maxCol: NaN,
  unitSize: NaN,
  unitGap: NaN
};
var $snake = {
  head: null,
  body: [],
  direction: null,
  speed: NaN,
  distribution: []
};
var $apple = {
  row: NaN,
  col: NaN
}
var $gameIntervalID;

/* Helpers */
  function drawLine(fromX, fromY, toX, toY, style, width) {
    $ctx.strokeStyle = style ? style : '#ddd';
    $ctx.lineWidth = width ? width : 1;
    $ctx.beginPath();
    $ctx.moveTo(fromX, fromY);
    $ctx.lineTo(toX, toY);
    $ctx.stroke();
  }

  function drawStrokedSquare(row, col, style) {
    var position = {
      left:   ($grid.unitGap + $grid.unitSize) * col - $grid.unitSize,
      right:  ($grid.unitGap + $grid.unitSize) * col,
      top:    ($grid.unitGap + $grid.unitSize) * row - $grid.unitSize,
      bottom: ($grid.unitGap + $grid.unitSize) * row
    }
    drawLine(position.left, position.top, position.right, position.top);
    drawLine(position.right, position.top, position.right, position.bottom);
    drawLine(position.right, position.bottom, position.left, position.bottom);
    drawLine(position.left, position.bottom, position.left, position.top);
  }

  function drawFilledSquare(row, col, style) {
    var position = {
      left:   ($grid.unitGap + $grid.unitSize) * col - $grid.unitSize,
      right:  ($grid.unitGap + $grid.unitSize) * col,
      top:    ($grid.unitGap + $grid.unitSize) * row - $grid.unitSize,
      bottom: ($grid.unitGap + $grid.unitSize) * row
    }
    $ctx.fillStyle = style ? style : '#ddd';
    $ctx.beginPath();
    $ctx.moveTo(position.left, position.top);
    $ctx.lineTo(position.right, position.top);
    $ctx.lineTo(position.right, position.bottom);
    $ctx.lineTo(position.left, position.bottom);
    $ctx.fill();
  }

  function clearAll() {
    $ctx.clearRect(0, 0, $canvas.width, $canvas.height);
  }

  function drawGridBasis() {
    for (var row = 1; row <= $grid.maxRow; row++) {
      for (var col = 1; col <= $grid.maxCol; col++) {
        drawStrokedSquare(row, col);
      }
    }
  }

  function drawApple() {
    if ($apple) {
      drawFilledSquare($apple.row, $apple.col, '#f96868');
    }
  }

  function pythagorean(sideA, sideB) {
    return Math.sqrt(Math.pow(sideA, 2) + Math.pow(sideB, 2));
  }

/* Main Functions */
  function initializeGridSystem() {
    var diagonal = pythagorean(screen.width, screen.height);
    if (diagonal < pythagorean(480, 720)) {
      $grid.unitGap = 4;
      $grid.unitSize = 14;
    } else if (diagonal < pythagorean(640, 960)) {    
      $grid.unitGap = 4;
      $grid.unitSize = 16;
    } else if (diagonal < pythagorean(720, 1080)) {
      $grid.unitGap = 5;
      $grid.unitSize = 18;
    } else if (diagonal < pythagorean(960, 1440)) {
      $grid.unitGap = 5;
      $grid.unitSize = 20;
    } else {
      $grid.unitGap = 6;
      $grid.unitSize = 25;
    }
    $grid.maxRow = parseInt(screen.height * (screen.width > screen.height ? 0.65 : 0.75) / ($grid.unitSize + $grid.unitGap));
    $grid.maxCol = parseInt(screen.width  * (screen.width > screen.height ? 0.75 : 0.65) / ($grid.unitSize + $grid.unitGap));
    $canvas.width  = $grid.unitGap * ($grid.maxCol + 1) + $grid.unitSize * $grid.maxCol;
    $canvas.height = $grid.unitGap * ($grid.maxRow + 1) + $grid.unitSize * $grid.maxRow;
    $canvas.element.width  = $canvas.width;
    $canvas.element.height = $canvas.height;
  }

  function initializeSnake() {
    $snake.head = { row: parseInt($grid.maxRow / 2) + 1, col: parseInt($grid.maxCol / 2) };
    $snake.body = ['r', 'r'];
    $snake.direction = 'left';
    $snake.speed = 100;
    updateSnakeDistributionData();
    generateNewApple();
  }

  function setGameInterval() {
    $gameIntervalID = setInterval(function() {
      var nextRow, nextCol;
      switch($snake.direction) {
        case 'left':  nextRow = $snake.head.row;     nextCol = $snake.head.col - 1; break;
        case 'right': nextRow = $snake.head.row;     nextCol = $snake.head.col + 1; break;
        case 'up':    nextRow = $snake.head.row - 1; nextCol = $snake.head.col;     break;
        case 'down':  nextRow = $snake.head.row + 1; nextCol = $snake.head.col;     break;
      }
      if (ensureNoCrashOnBorder(nextRow, nextCol) && ensureNoCrashOnSelf(nextRow, nextCol)) {
        var lastBodyPart = updateSnakeHeadAndBodyPart();
        if (isAppleBeingEaten(nextRow, nextCol)) {
          $snake.body.push(lastBodyPart);
          generateNewApple();
        }
        updateSnakeDistributionData();
      } else {
        /* Game Over */
        unsetGameInterval();
        swal({
          title: 'Game Over !',
          confirmButtonText: 'Try Again !',
          confirmButtonColor: '#04a29c',
          allowEscapeKey: false,
          allowOutsideClick: false
        }).then(function() {
          initializeSnake();
          setGameInterval();
        });
      }
    }, $snake.speed);
  }

  function unsetGameInterval() {
    clearInterval($gameIntervalID);
    $gameIntervalID = null;
  }

  function ensureNoCrashOnBorder(nextRow, nextCol) {
    return !(nextRow < 1 || nextRow > $grid.maxRow || nextCol < 1 || nextCol > $grid.maxCol);
  }

  function ensureNoCrashOnSelf(nextRow, nextCol) {
    if ($snake.distribution[nextRow - 1][nextCol - 1] != 1) {
      return true;
    } else if (isContraryDirection()) {
      resumeDirection();
      return true;
    }
    return false;
  }

  function isAppleBeingEaten(nextRow, nextCol) {
    return $snake.distribution[nextRow - 1][nextCol - 1] === 2;
  }

  function isContraryDirection(direction) {
    switch($snake.direction) {
      case 'left':  return $snake.body[0] === 'l';
      case 'right': return $snake.body[0] === 'r';
      case 'up':    return $snake.body[0] === 't';
      case 'down':  return $snake.body[0] === 'b';
    }
  }

  function resumeDirection() {
    switch($snake.direction) {
      case 'left':  changeDirection('right'); break;
      case 'right': changeDirection('left');  break;
      case 'up':    changeDirection('down');  break;
      case 'down':  changeDirection('up');    break;
    }
  }

  function updateSnakeDistributionData() {
    $snake.distribution = [];
    /* Refresh Total Snake  */
    for (var row = 1; row <= $grid.maxRow; row++) {
      $snake.distribution.push([]);
      for (var col = 1; col <= $grid.maxCol; col++) {
        $snake.distribution[row - 1].push(0);
      }
    }

    /* Redraw All Canvas */
    clearAll();
    drawGridBasis();

    var currentRow = $snake.head.row;
    var currentCol = $snake.head.col;
    var white = function(opacity) { return 'rgba(221, 221, 221, ' + opacity + ')'; };
    
    $snake.distribution[currentRow - 1][currentCol - 1] = 1;
    drawFilledSquare(currentRow, currentCol, white(1));

    var counter = 0;
    for (var part of $snake.body) {
      counter++;
      switch(part) {
        case 'l': currentCol -= 1; break;
        case 'r': currentCol += 1; break;
        case 't': currentRow -= 1; break;
        case 'b': currentRow += 1; break;
      }
      $snake.distribution[currentRow - 1][currentCol - 1] = 1;
      var opacity = 1 - counter / $snake.body.length;
      opacity = opacity < 0.4 ? 0.4 : opacity;
      drawFilledSquare(currentRow, currentCol, white(opacity));
    }
    if ($apple.row && $apple.col) {
      $snake.distribution[$apple.row - 1][$apple.col - 1] = 2;
      drawApple(); 
    }
  }

  function updateSnakeHeadAndBodyPart() {
    switch($snake.direction) {
      case 'left':  $snake.body.unshift('r'); $snake.head.col -= 1; break;
      case 'right': $snake.body.unshift('l'); $snake.head.col += 1; break;
      case 'up':    $snake.body.unshift('b'); $snake.head.row -= 1; break;
      case 'down':  $snake.body.unshift('t'); $snake.head.row += 1; break;
    }
    return $snake.body.pop();
  }

  function changeDirection(direction) {
    $snake.direction = direction;
  }

  function generateNewApple() {
    var generated = false;
    while (!generated) {
      var randomNum = parseInt(Math.random() * $grid.maxRow * $grid.maxCol);
      var randomRow = parseInt(randomNum / $grid.maxCol) + 1;
      var randomCol = randomNum % $grid.maxCol + 1;
      generated = $snake.distribution[randomRow - 1][randomCol - 1] !== 1;
    }
    $apple.row = randomRow;
    $apple.col = randomCol;
    $snake.distribution[randomRow - 1][randomCol - 1] = 2;
  }

  function setupEvents() {
    Mousetrap.bind('left',  function() { changeDirection('left');  });
    Mousetrap.bind('right', function() { changeDirection('right'); });
    Mousetrap.bind('up',    function() { changeDirection('up');    });
    Mousetrap.bind('down',  function() { changeDirection('down');  });
    hammer = new Hammer($canvas.element);
    hammer.get('swipe').set({ direction: Hammer.DIRECTION_ALL });
    hammer.on('swipeleft',  function() { changeDirection('left');  });
    hammer.on('swiperight', function() { changeDirection('right'); });
    hammer.on('swipeup',    function() { changeDirection('up');    });
    hammer.on('swipedown',  function() { changeDirection('down');  });
  }

$(document).ready(function() {
  $canvas.element = document.getElementById('main-canvas');

  if ($canvas.element.getContext) {
    $ctx = $canvas.element.getContext('2d');  
    /* Initialize Grid System */
    initializeGridSystem();
    initializeSnake();
    setGameInterval();
    setupEvents();
  }
});
