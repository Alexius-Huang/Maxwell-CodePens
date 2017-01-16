var $canvas;
var $ctx;
var $blockRows = 20;
var $blockCols = 12;
var $blockSize = 16;
var $blockGap = 5;
var $blockData = null;
var $currentTetris = null;
var $rotatedTetris = null;
var $canvasHeight = $blockSize * $blockRows + $blockGap * ($blockRows + 1);
var $canvasWidth =  $blockSize * $blockCols + $blockGap * ($blockCols + 1);
var $gameIntervalID = null;
var $currentSpeed = NaN;
var $scoreContainer = null;
var $score = 0;
var $hammerElement = null;

/* Helper Functions */
  function drawLine(fromX, fromY, toX, toY, style, width) {
    $ctx.strokeStyle = style ? style : '#ddd';
    $ctx.lineWidth = width ? width : 1;
    $ctx.beginPath();
    $ctx.moveTo(fromX, fromY);
    $ctx.lineTo(toX, toY);
    $ctx.stroke();
  }

  function clearAll() {
    $ctx.clearRect(0, 0, $canvasWidth, $canvasHeight);
  }

  function degToRad(degree) {
    return degree / 180 * Math.PI;
  }

  function drawBlock(row, col, style) {
    if (row <= 3) {
      style = style ? style : '#941c1c';
    } else if (row <= 7) {
      style = style ? style : '#666';
    } else if (row <= 12) {
      style = style ? style : '#555';
    } else {
      style = style ? style : '#444';
    }
    drawLine(col * $blockGap + (col - 1) * $blockSize, row * $blockGap + (row - 1) * $blockSize, col * $blockGap + (col - 1) * $blockSize, row * ($blockGap + $blockSize), style);
    drawLine(col * $blockGap + (col - 1) * $blockSize, row * ($blockGap + $blockSize), col * ($blockGap + $blockSize), row * ($blockGap + $blockSize), style);
    drawLine(col * ($blockGap + $blockSize), row * ($blockGap + $blockSize), col * ($blockGap + $blockSize), row * $blockGap + (row - 1) * $blockSize, style);
    drawLine(col * ($blockGap + $blockSize), row * $blockGap + (row - 1) * $blockSize, col * $blockGap + (col - 1) * $blockSize, row * $blockGap + (row - 1) * $blockSize, style);
  }

  function duplicateObject(obj) {
    return JSON.parse(JSON.stringify(obj));
  }
/* Helper Functions End */

/* Event Functions */
  var keyLeft = function(event) {
    if ($gameIntervalID && !checkCollisionIfMove('left')) {
      moveCurrentTetris('left');
      refreshGame();
    }
  }

  var keyRight = function(event) {
    if ($gameIntervalID && !checkCollisionIfMove('right')) {
      moveCurrentTetris('right');
      refreshGame();
    }
  }

  /* Clockwise Rotation */
  var keyUp = function(event) { if ($gameIntervalID) { rotate(true) }; }

  /* Counterclockwise Rotation */
  var keyDown = function(event) {
    if ($gameIntervalID && !checkCollisionIfMove('down')) {
      moveCurrentTetris('down');
      refreshGame();
    };
  }

  /* Move the block straight toward down */
  var keySpace = function(event) { straightDown(); }

  function setRangeInputListener() {
    $('#speed-input').change(function(event) {
      resetGameInterval(100 + (100 - this.value) * 9);
    });
  }

  function setupMousetrapEvents() {
    Mousetrap.bind('left', keyLeft);
    Mousetrap.bind('right', keyRight);
    Mousetrap.bind('space', keySpace);
    Mousetrap.bind('up', keyUp);
    Mousetrap.bind('down', keyDown);
  }

  function setupHammerEvents() {
    $hammerElement = new Hammer($canvas);
    $hammerElement.get('swipe').set({ direction: Hammer.DIRECTION_VERTICAL });
    $hammerElement.on('swipeleft', keyLeft);
    $hammerElement.on('swiperight', keyRight);
    $hammerElement.on('swipedown', keyDown);
    $hammerElement.on('swipeup', keyUp);
    $hammerElement.on('doubletap', keySpace);

  }
/* Event Functions End */

/* Main Functions */
function initGame() {
  $blockData = [];
  for (var row = 1; row <= $blockRows; row++) {
    $blockData.push([]);
    for (var col = 1; col <= $blockCols; col++) {
      $blockData[row - 1].push(null);
      drawBlock(row, col);
    }
  }
  $score = 0;
  $scoreContainer = $('#score');
  $currentTetris = null;
  $currentSpeed = 100 + (100 - getCurrentSpeedInput()) * 10;
}

function refreshGame() {
  clearAll();
  for (var row = 1; row <= $blockRows; row++) {
    for (var col = 1; col <= $blockCols; col++) {
      drawBlock(row, col, $blockData[row - 1][col - 1]);
    }
  }
}

function getCurrentSpeedInput() {
  return $('#speed-input').val();
}

function setGameInterval(duration) {
  $gameIntervalID = setInterval(function() {
    if (!$currentTetris) {
      /* Generate new Tetris data and check collision */
      generateRandomTetris();
      if (!checkCollisionIfGenerateNewTetris()) {
        updateTetrisToBlockData();
      } else {
        /* GAME OVER */
        gameOverResult();
      }
      refreshGame();
    } else if (!checkCollisionIfMove('down')) {
      /* Keep moving down the tetris */
      moveCurrentTetris('down');
      refreshGame();
    } else {
      /* Clear tetris data */
      $currentTetris = null;
      checkFullRowAndSlice();
    }
    updateScore();
  }, duration);
}

function resetGameInterval(duration) {
  clearInterval($gameIntervalID);
  setGameInterval(duration);
}

function unsetGameInterval() {
  clearInterval($gameIntervalID);
  $gameIntervalID = null;
}

function updateScore() { return $scoreContainer.html($score); }

function generateRandomTetris() {
  switch(Math.floor(Math.random() * 7)) {
    case 0:
      $currentTetris = {
        coords: [ { row: 1, col: 6 }, { row: 1, col: 5 }, { row: 1, col: 7 }, { row: 1, col: 8 } ],
        style: '#3e80f0',
        type: 'I'
      }
      break;
    case 1:
      $currentTetris = {
        coords: [ { row: 1, col: 6 }, { row: 1, col: 7 }, { row: 2, col: 6 }, { row: 3, col: 6 } ],
        style: '#77a6f4',
        type: 'J'
      }
      break;
    case 2:
      $currentTetris = {
        coords: [ { row: 1, col: 7 }, { row: 1, col: 6 }, { row: 2, col: 7 }, { row: 3, col: 7 } ],
        style: '#49ff4c',
        type: 'L'
      }
      break;
    case 3: // 'Z'
      $currentTetris = {
        coords: [ { row: 2, col: 6 }, { row: 1, col: 5 }, { row: 1, col: 6 }, { row: 2, col: 7 } ],
        style: '#ff8d87',
        type: 'Z'
      }
      break;
    case 4: // 'S'
      $currentTetris = {
        coords: [ { row: 2, col: 7 }, { row: 1, col: 7 }, { row: 1, col: 8 }, { row: 2, col: 6 } ],
        style: '#e3ff7a',
        type: 'S'
      }
      break;
    case 5: // 'O' <= No need to rotate
      $currentTetris = {
        coords: [ { row: 1, col: 6 }, { row: 1, col: 7 }, { row: 2, col: 6 }, { row: 2, col: 7 } ],
        style: '#ff7aec',
        type: 'O'
      }
      break;
    case 6: // 'T'
      $currentTetris = {
        coords: [ { row: 2, col: 6 }, { row: 1, col: 6 }, { row: 2, col: 5 }, { row: 2, col: 7 } ],
        style: '#86d8d9',
        type: 'T'
      }
  }
  $score += 4;
}

function updateTetrisToBlockData() {
  for (var coord of $currentTetris.coords) {
    $blockData[coord.row - 1][coord.col - 1] = $currentTetris.style;
  }
}

function checkCollisionIfGenerateNewTetris() {
  for (var coord of $currentTetris.coords) {
    if ($blockData[coord.row - 1][coord.col - 1] != null) { return true; }
  } return false;
}

function checkCollisionIfMove(direction) {
  if ($currentTetris) {
    var duplicatedBlockData = duplicateObject($blockData);
    for (var coord of $currentTetris.coords) {
      /* Clear the original tetris block */
      duplicatedBlockData[coord.row - 1][coord.col - 1] = null;
    }
    for (var coord of $currentTetris.coords) {
      switch(direction) {
        case 'down':  if (coord.row == $blockRows || duplicatedBlockData[coord.row][coord.col - 1] != null) { return true; } break;
        case 'left':  if (coord.col ==          1 || duplicatedBlockData[coord.row - 1][coord.col - 2] != null) { return true; } break;
        case 'right': if (coord.col == $blockCols || duplicatedBlockData[coord.row - 1][coord.col] != null) { return true; } break;
      }
    }
  } else return true;
  return false;
}

function checkCollisionIfRotate() {
  if ($currentTetris && $rotatedTetris) {
    var duplicatedBlockData = duplicateObject($blockData);
    for (var coord of $currentTetris.coords) {
      /* Clear the original tetris block */
      duplicatedBlockData[coord.row - 1][coord.col - 1] = null;
    }
    for (var coord of $rotatedTetris) {
      if ( coord.row >= $blockRows
        || coord.col >= $blockCols
        || coord.row <= 0
        || coord.col <= 0
        || duplicatedBlockData[coord.row - 1][coord.col - 1] != null
      ) { return true; }
    }
  } else return true;
  return false;
}

function checkFullRowAndSlice() {
  for (var row = 1; row <= $blockRows; row++) {
    var counter = 0;
    for (var col = 1; col <= $blockCols; col++) {
      if ($blockData[row - 1][col - 1] == null) { break; }
      if (col == $blockCols) { $blockData[row - 1] = 0; }
    }
  }

  var newData = [];
  for (var row = 1; row <= $blockRows; row++) {
    if ($blockData[row - 1] !== 0) {
      newData.push(duplicateObject($blockData[row - 1]));
    } else {
      var newRow = [];
      for (var col = 1; col <= $blockCols; col++) { newRow.push(null); }
      newData.unshift(duplicateObject(newRow));
    }
  }
  $blockData = duplicateObject(newData);
  refreshGame();
}

function moveCurrentTetris(direction) {
  /* Clear original area */
  for (var coordIndex in $currentTetris.coords) {
    var coord = $currentTetris.coords[coordIndex];
    $blockData[coord.row - 1][coord.col - 1] = null;
    switch(direction) {
      case 'down':  coord.row += 1; break;
      case 'left':  coord.col -= 1; break;
      case 'right': coord.col += 1; break;
    }
  }
  /* Move to next area */
  for (var coord of $currentTetris.coords) {
    $blockData[coord.row - 1][coord.col - 1] = $currentTetris.style;
  }
}

function straightDown() {
  if ($currentTetris) {
    while (!checkCollisionIfMove('down')) { moveCurrentTetris('down'); $score += 1; }
    // refreshGame();
    // $currentTetris = null;
    generateRandomTetris();
    refreshGame();
    checkFullRowAndSlice();
  }
}

function rotate(clockwise) {
  /* Rotation Algorithm Apply to 2D */
  if (clockwise) var rotationMatrix = [[0, 1], [-1, 0]];
  else var rotationMatrix = [[0, -1], [1, 0]];

  if ($currentTetris && $currentTetris.type !== 'O') {
    for (var coordIndex in $currentTetris.coords) {
      /* Set center point */
      var centerRow = $currentTetris.coords[coordIndex].row;
      var centerCol = $currentTetris.coords[coordIndex].col;
      $rotatedTetris = [];

      for (var coord of $currentTetris.coords) {
        var rowRelativeToCenter = coord.row - centerRow;
        var colRelativeToCenter = coord.col - centerCol;
        /* Linear Transformation */
        rotatedRow = rowRelativeToCenter * rotationMatrix[0][0] + colRelativeToCenter * rotationMatrix[0][1] + centerRow;
        rotatedCol = rowRelativeToCenter * rotationMatrix[1][0] + colRelativeToCenter * rotationMatrix[1][1] + centerCol;
        $rotatedTetris.push({ row: rotatedRow, col: rotatedCol });  
      }

      if (!checkCollisionIfRotate()) {
        /* Clear original area */
        for (var coordIndex in $currentTetris.coords) {
          var coord = $currentTetris.coords[coordIndex];
          $blockData[coord.row - 1][coord.col - 1] = null;
        }
        /* Move to next area and update current tetris */
        for (var coordIndex in $rotatedTetris) {
          var coord = $rotatedTetris[coordIndex];
          $blockData[coord.row - 1][coord.col - 1] = $currentTetris.style;
          $currentTetris.coords[coordIndex] = { row: coord.row, col: coord.col };
        }
        $rotatedTetris = null;
        refreshGame();
        break;
      }
    }
  }
}

function gameOverResult() {
  unsetGameInterval();
  for (var coord of $currentTetris.coords) {
    if ($blockData[coord.row - 1][coord.col - 1] == null) {
      $blockData[coord.row - 1][coord.col - 1] = $currentTetris.style;
    } else {
      $blockData[coord.row - 1][coord.col - 1] = 'red';
    }
  }
  swal({
    title: 'Game Over',
    text: 'Your score : ' + $score + ' !',
    showConfirmButton: true,
    showCancelButton: false,
    confirmButtonColor: '#333',
    confirmButtonText: 'Try Again !',
    allowEscapeKey: false,
    allowOutsideClick: false
  }).then(function() {
    initGame();
    refreshGame();
    setGameInterval($currentSpeed);
  });
}

/* Main Executions */
$(document).ready(function() {
  $canvas = document.getElementById('main-canvas');
  $canvas.width = $canvasWidth;
  $canvas.height = $canvasHeight;
  if ($canvas.getContext('2d')) {
    $ctx = $canvas.getContext('2d');
    initGame();
    setGameInterval($currentSpeed);
    setRangeInputListener();
    setupMousetrapEvents();
    setupHammerEvents();
  }
});
