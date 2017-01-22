var $canvas = {
  element: null,
  width:   505,
  height:  650,
  maxRowBricks: 20,
  maxColBricks: 20
};
var $ctx;
var $brick = {
  data: [],
  distribution: [],
  unitHeight: 20,
  unitWidth:  20,
  unitGap: 5
};
var $paddle = {
  position: { x: 250, y: 600 },
  extends:  { x: 50, y: 8 }
};
var $ball = {
  radius: 10,
  position: { x: 250 , y: 590 },
  state: 'onPaddle',
  directionAngle: 0,
  paddleXPosition: 50,
  speed: 5
};
var $gameIntervalID = null;

/* Helper Functions */
  function drawLine(fromX, fromY, toX, toY, style, width) {
    $ctx.strokeStyle = style ? style : '#ddd';
    $ctx.lineWidth = width ? width : 1;
    $ctx.beginPath();
    $ctx.moveTo(fromX, fromY);
    $ctx.lineTo(toX, toY);
    $ctx.stroke();
  }

  function drawBrick(rowStart, colStart, rowExtends, colExtends, live) {
    var position = {
      left:   colStart * $brick.unitGap + (colStart - 1) * $brick.unitWidth,
      right:  (colStart + colExtends - 1) * $brick.unitGap + (colStart + colExtends - 1) * $brick.unitWidth,
      top:    rowStart * $brick.unitGap + (rowStart - 1) * $brick.unitHeight,
      bottom: (rowStart + rowExtends - 1) * $brick.unitGap + (rowStart + rowExtends - 1) * $brick.unitHeight
    };
    var style = null;
    switch(live) {
      /* Brick Live Customization */
      case 1: style = "#E1F5FE"; break;
      case 2: style = "#B3E5FC"; break;
      case 3: style = "#4FC3F7"; break;
      case 4: style = "#03A9F4"; break;
      case 5: style = "#0277BD"; break;
      case 6: style = "#015798"; break;
      // case  1: style = "#E1F5FE"; break;
      // case  2: style = "#B3E5FC"; break;
      // case  3: style = "#81D4FA"; break;
      // case  4: style = "#4FC3F7"; break;
      // case  5: style = "#29B6F6"; break;
      // case  6: style = "#03A9F4"; break;
      // case  7: style = "#039BE5"; break;
      // case  8: style = "#0288D1"; break;
      // case  9: style = "#0277BD"; break;
      // case 10: style = "#01579B"; break;
    }
    drawLine(position.left,  position.top,    position.right, position.top,    style);
    drawLine(position.right, position.top,    position.right, position.bottom, style);
    drawLine(position.right, position.bottom, position.left,  position.bottom, style);
    drawLine(position.left,  position.bottom, position.left,  position.top,    style);  
  }

  function drawPaddle() {
    var position = {
      left: $paddle.position.x - $paddle.extends.x,
      right: $paddle.position.x + $paddle.extends.x,
      top: $paddle.position.y - $paddle.extends.y,
      bottom: $paddle.position.y + $paddle.extends.y
    }
    drawLine(position.left,  position.top,    position.right, position.top,    "#E1F5FE");
    drawLine(position.right, position.top,    position.right, position.bottom, "#E1F5FE");
    drawLine(position.right, position.bottom, position.left,  position.bottom, "#E1F5FE");
    drawLine(position.left,  position.bottom, position.left,  position.top,    "#E1F5FE");  
  }

  function drawBall() {
    $ctx.fillStyle = "#E1F5FE";
    $ctx.beginPath();
    $ctx.arc($ball.position.x, $ball.position.y, $ball.radius, 0, Math.PI * 2);
    $ctx.fill();
  }

  function clearAll() {
    $ctx.clearRect(0, 0, $canvas.width, $canvas.height);
  }

  function degToRad(degree) {
    return degree / 180 * Math.PI;
  }

  function duplicateObject(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

/* Helper Functions End */

/* Events Functions Start */
  function setupPaddleAlongMouseMoveEvent() {
    $('#main-canvas').mousemove(function(event) {
      var xPosition = event.offsetX;
      if (xPosition > $paddle.extends.x && xPosition < $canvas.width - $paddle.extends.x) {
        updatePaddlePosition(xPosition);
        if ($ball.state === 'onPaddle') {
          $ball.position.x = $paddle.position.x - $paddle.extends.x + $ball.paddleXPosition,
          $ball.position.y = $paddle.position.y - $paddle.extends.y - $ball.radius
        }
      }
    });
  }

  function setupReleaseBallEvent() {
    $('#main-canvas').click(function(event) {
      if ($ball.state === 'onPaddle') {
        $ball.state = 'dynamic';
        $ball.directionAngle = 30 + Math.random() * 120;
      }
    })
  }
/* Events Functions End */

/* Main Functions Start */
  function initTheme() {
    $brick.data = [];
    $brick.distribution = [];
    $ball.state = 'onPaddle';
    $ball.directionAngle = NaN;
    $ball.position = { x: 250, y: 590 };
    $ball.paddleXPosition = 50;
    $paddle.position.x = 250;

    /* Customize your brick data */
    for (var i = 0; i < 20; i++) {
      $brick.data.push({ index: i, row: 13, col: i + 1, rowExtends: 1, colExtends: 1, live: 1 })
    }
    for (var j = 1; j <= 10; j++) {
      $brick.data.push({ index: 19 + j, row: 12, col: j * 2 - 1, rowExtends: 1, colExtends: 2, live: 1 });
    }
    for (var k = 1; k <= 11; k++) {
      $brick.data.push({ index: 29 + k, row: 11, col: (k == 1 ? 1 : (k == 11 ? 20 : (k - 1) * 2)), rowExtends: 1, colExtends: (k == 1 || k == 11 ? 1 : 2), live: 2 });
    }
    for (var l = 1; l <= 10; l++) {
      $brick.data.push({ index: 40 + l, row: 9, col: l * 2 - 1, rowExtends: 2, colExtends: 2, live: 3 });
    }
    for (var m = 1; m <= 11; m++) {
      $brick.data.push({ index: 50 + m, row: 7, col: (m == 1 ? 1 : (m == 11 ? 20 : (m - 1) * 2)), rowExtends: 2, colExtends: (m == 1 || m == 11 ? 1 : 2), live: 4 });
    }
    for (var n = 1; n <= 10; n++) {
      $brick.data.push({ index: 61 + n, row: 5, col: n * 2 - 1, rowExtends: 2, colExtends: 2, live: 5 });
    }
    for (var o = 1; o <= 5; o++) {
      $brick.data.push({ index: 71 + o, row: 1, col: (o - 1) * 4 + 1, rowExtends: 4, colExtends: 4, live: 6 });
    }
  }

  function initBrickDistributionArray() {
    $brick.distribution = [];
    for (var row = 1; row <= $canvas.maxRowBricks; row++) {
      $brick.distribution.push([]);
      for (var col = 1; col <= $canvas.maxColBricks; col++) {
        $brick.distribution[row - 1].push(null);
      }
    }
  }

  function updateTheme() {
    clearAll();

    /* Update Brick Part */
    for (var brick of $brick.data) { drawBrick(brick.row, brick.col, brick.rowExtends, brick.colExtends, brick.live); }
    updateBrickDistributionArray();

    updateBallPositionWhileDynamicState();

    /* Update Paddle Part */
    drawPaddle();

    /* Update Ball Part */
    drawBall();
  }

  function updateBrickDistributionArray() {
    initBrickDistributionArray();
    for (var brick of $brick.data) {
      for (var row = brick.row, i = 0; i < brick.rowExtends; row++, i++) {
        for (var col = brick.col, j = 0; j < brick.colExtends; col++, j++) {
          $brick.distribution[row - 1][col - 1] = {
            index: brick.index,
            live: brick.live
          };
        }
      }
    }
  }

  function updatePaddlePosition(positionX) {
    $paddle.position.x = positionX;
  }

  function updateBallPositionWhileDynamicState() {
    if ($ball.state === 'dynamic') {
      var currentCol = parseInt($ball.position.x / ($brick.unitGap + $brick.unitWidth));
      var currentRow = parseInt($ball.position.y / ($brick.unitGap + $brick.unitHeight));
      var nextPositionX = $ball.position.x + $ball.speed * Math.cos(degToRad($ball.directionAngle));
      var nextPositionY = $ball.position.y - $ball.speed * Math.sin(degToRad($ball.directionAngle));
      
      /* Validate Collision */
      var collideTopBorder    = nextPositionY <= $ball.radius;
      var collideLeftBorder   = nextPositionX <= $ball.radius;
      var collideRightBorder  = nextPositionX >= $canvas.width - $ball.radius;
      var collideBottomBorder = nextPositionY >= $canvas.height + $ball.radius * 2;
      var collidePaddle = (nextPositionX >= $paddle.position.x - $paddle.extends.x - $ball.radius)
        && (nextPositionX <= $paddle.position.x + $paddle.extends.x + $ball.radius)
        && (nextPositionY >= $paddle.position.y - $paddle.extends.y - $ball.radius);

      if ($ball.directionAngle > 0) {
        var nextRow = parseInt((nextPositionY - $ball.radius) / ($brick.unitGap + $brick.unitHeight));
      } else {
        var nextRow = parseInt((nextPositionY + $ball.radius) / ($brick.unitGap + $brick.unitHeight));
      }
      var absDirectionAngle = Math.abs($ball.directionAngle);

      if (absDirectionAngle > 90) {
        var nextCol = parseInt((nextPositionX - $ball.radius) / ($brick.unitGap + $brick.unitWidth));
      } else {
        var nextCol = parseInt((nextPositionX + $ball.radius) / ($brick.unitGap + $brick.unitWidth));
      }

      if (nextRow < $canvas.maxRowBricks && nextCol < $canvas.maxColBricks && $brick.distribution[nextRow][nextCol] != null) {
        /* From Direction to distinguish where it collide */
        var index = $brick.distribution[nextRow][nextCol].index;
        var currentBrick = $brick.data[index];
        if (currentBrick.live != 1) { currentBrick.live -= 1; } else {
          $brick.data.splice(index, 1);
          for (var i = index; i < $brick.data.length; i++) { $brick.data[i].index -= 1; }
        }

        switch(parseInt($ball.directionAngle / 45)) {
          case  3:
            /* Check left collision first then top collision */
            if (currentCol > nextCol) { $ball.directionAngle = 180 - $ball.directionAngle; return; }  
            if (currentRow > nextRow) { $ball.directionAngle = -$ball.directionAngle; return; }
          case  2:
            /* Check top collision first then left collision */
            if (currentRow > nextRow) { $ball.directionAngle = -$ball.directionAngle; return; }
            if (currentCol > nextCol) { $ball.directionAngle = 180 - $ball.directionAngle; return; }  
          case  1:
            /* Check top collision first then right collision */
            if (currentRow > nextRow) { $ball.directionAngle = -$ball.directionAngle; return; }
            if (currentCol < nextCol) { $ball.directionAngle = 180 - $ball.directionAngle; return; }  
          case  0:
            if ($ball.directionAngle > 0) {
              /* Check right collision first then top collision */
              if (currentCol < nextCol) { $ball.directionAngle = 180 - $ball.directionAngle; return; }  
              if (currentRow > nextRow) { $ball.directionAngle = -$ball.directionAngle; return; }
            } else {
              /* Check right collision first then bottom collision */
              if (currentCol < nextCol) { $ball.directionAngle = -180 - $ball.directionAngle; return; }  
              if (currentRow < nextRow) { $ball.directionAngle = -$ball.directionAngle; return; }
            }
          case -1:
            /* Check bottom collision first then right collision */
            if (currentRow < nextRow) { $ball.directionAngle = -$ball.directionAngle; return; }
            if (currentCol < nextCol) { $ball.directionAngle = -180 - $ball.directionAngle; return; }  
          case -2:
            /* Check bottom collision first then left collision */
            if (currentRow < nextRow) { $ball.directionAngle = -$ball.directionAngle; return; }
            if (currentCol > nextCol) { $ball.directionAngle = -180 - $ball.directionAngle; return; }  
          case -3:
            /* Check left collision first then bottom collision */
            if (currentCol > nextCol) { $ball.directionAngle = -180 - $ball.directionAngle; return; }  
            if (currentRow < nextRow) { $ball.directionAngle = -$ball.directionAngle; return; }
        }
      }
      
      if (collideBottomBorder) {
        swal({
          title: 'Game Over!',
          showConfirmButton: true,
          showCancelButton: false,
          confirmButtonText: 'Try Again !',
          confirmButtonColor: '#29B6F6',
          allowOutsideClick: false,
          allowEscapeKey: false
        }).then(function() {
          initTheme();
        });
      } else if (collideTopBorder) {
        $ball.directionAngle = -$ball.directionAngle;
      } else if (collideLeftBorder || collideRightBorder) {
        $ball.directionAngle = $ball.directionAngle > 0 ? 180 - $ball.directionAngle : -180 - $ball.directionAngle;
      } else if (collidePaddle) {
        if ($ball.position.y > $paddle.position.y - $paddle.extends.y) {
          /* If ball's position is lower than the paddle, than keep it move */ 
          $ball.position.x = nextPositionX;
          $ball.position.y = nextPositionY;
          return;
        }
        var relativePosition = $ball.position.x - ($paddle.position.x - $paddle.extends.x);
        $ball.directionAngle = 30 + 120 * (1 - relativePosition / ($paddle.extends.x * 2));
      } else {
        $ball.position.x = nextPositionX;
        $ball.position.y = nextPositionY;
      }
    }
  }
/* Main Functions End */

/* Main Function Process */
$(document).ready(function() {
  $canvas.element = document.getElementById('main-canvas');
  $canvas.element.width  = $canvas.width;
  $canvas.element.height = $canvas.height;

  if ($canvas.element.getContext) {
    $ctx = $canvas.element.getContext('2d');
    initTheme();
    $gameIntervalID = setInterval(function() {
      updateTheme();
    }, 10);
  
    /* Events Setup */
    setupPaddleAlongMouseMoveEvent();
    setupReleaseBallEvent();
  }
});