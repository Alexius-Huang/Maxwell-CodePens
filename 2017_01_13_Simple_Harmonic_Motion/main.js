var $canvas;
var $canvasContainer;
var $size;
var windowWidth = $(window).width();
if (windowWidth <= 360) {
  $size = 300;
} else if (windowWidth <= 480) {
  $size = 360;
} else if (windowWidth <= 720) {
  $size = 400;
} else {
  $size = 500;
}
var $ctx;
var $stretchUnit = 10 / 1.1;
var $springMaxY = $size / 500 * 195;
var $springMinY = $size / 500 * 155;
var $springMinX = $size / 500 * 70;
var $springMaxX = NaN;
var $springCurrentX = NaN;
var $springNextX = NaN;
var $boxSize = $size / 10;
var $degree = 90;
var $extension = 0.5;
var $strength = NaN;
var $motionRate = 2;
var $motionID = null;
var $isDragging = false;
var $boxElement = document.createElement('div');
var $boxHammerElement;
var $dragXPosition = NaN;
var $energy100YPos = $size / 500 * 260;
var $energyBarChartMaxHeight = $size / 50 * 3 * 4;
var $energyTotalBarHeight = NaN;
var $energyKineticBarHeight = NaN;
var $energyPotentialBarHeight = NaN;
var $energyKineticYPoints = [];
var $energyPotentialYPoints = [];
var $lineChartStart = $size / 500 * 275;
var $lineChartEnd = $size / 500 * 450 - 10;
var $totalLineChartData = $lineChartEnd - $lineChartStart;
var $counter = 0;
var $speedRate = NaN;
var $dampRate = NaN; // Attenuation

$(document).ready(function() {
  /* Initializing Canvas Element and Container */
  initCanvas();

  /* Initializing Parameters */
  initParams();

  /* Initializing draggable box element */
  initDraggableBoxElement();

  /* Setting up HammerJS Events */
  setupDraggableEvents();

  /* Setting up Range Input Events */
  setupInputChangeEvents();

  if ($canvas.getContext('2d')) {
    $ctx = $canvas.getContext('2d');
    drawEnvironment(0);
    setMotion();
  }
});

/* Main Functions */
function initCanvas() {
  $canvasContainer = document.getElementById('main-canvas-container');
  $canvas = document.getElementById('main-canvas');
  $canvas.height = $size;
  $canvas.width = $size * 9 / 10;
  $canvasContainer.style['width'] = $size + 'px';
  $canvasContainer.style['height'] = $size * 9 / 10 + 'px';
}

function initParams() {
  $speedRate = (100 - $('input#rate-speed-input').val()) / 3 + 10;
  $dampRate = $('input#attenuation-input').val() / 1000;
}

function initDraggableBoxElement() {
  $boxElement.style['height'] = $springMaxY - $springMinY + 10 + 'px';
  $boxElement.style['top'] = $springMinY + 'px';
  $boxElement.style['left'] = $springMinX + 'px';
  $boxElement.setAttribute('id', 'box-draggable')
  $canvasContainer.append($boxElement);
  $boxElement.style['position'] = 'absolute';
}

function setupDraggableEvents() {
  $boxHammerElement = new Hammer($boxElement);
  $boxHammerElement.on("panleft panright", function(event) {
    unsetMotion();
  });
  $boxHammerElement.on("panmove", function(event) {
    $dragXPosition = event.srcEvent.pageX - $('#box-draggable').offset().left;
    if ($dragXPosition < $springMaxX && $dragXPosition > 0) {
      clearAll();
      $extension = $dragXPosition / $springMaxX / 2;
      drawEnvironment($dragXPosition / $springMaxX);
      $degree = 90;
    }
  });
  $boxHammerElement.on("panend", function(event) {
    setMotion();
  });
}

function setupInputChangeEvents() {
  $('input#rate-speed-input').on('change', function() {
    unsetMotion();
    $(this).next().html($(this).val());
    $speedRate = 50 - $(this).val();
    setMotion();
  });
  $('input#attenuation-input').on('change', function() {
    unsetMotion();
    $(this).next().html($(this).val());
    $dampRate = $(this).val() / 1000;
    setMotion();
  });
}

function drawEnvironment(shrinkParams) {
  drawMotionChart();

  /* Draw Spring System */
  shrinkParams = 0.1 + (shrinkParams || shrinkParams == 0 ? shrinkParams : 1);
  $springCurrentX = $springMinX + $stretchUnit * shrinkParams;
  $springNextX = $springCurrentX + $stretchUnit * shrinkParams;

  /* Initial Line */
  drawLine($size / 10, $size / 20 * 7, $springMinX, $size / 20 * 7);
  drawLine($size / 50 * 7, $size / 20 * 7, $springCurrentX, $springMaxY);
  for (var i = 1; i <= 20; i++) {
    drawLine($springCurrentX, (i % 2 == 0 ? $springMinY : $springMaxY), $springNextX, (i % 2 == 0 ? $springMaxY : $springMinY));
    $springCurrentX = $springNextX;
    $springNextX = $springCurrentX + $stretchUnit * shrinkParams;
  }
  drawLine($springCurrentX, $springMaxY, $springNextX, $size / 20 * 7);
  drawLine($springNextX, $size / 20 * 7, $springNextX + $size / 25, $size / 20 * 7);
  if (!$springMaxX || $springNextX > $springMaxX) { $springMaxX = $springNextX; }
  $springNextX += $size / 25;

  /* Draw Box */
  drawLine($springNextX, $size / 10 * 3, $springNextX, $size / 10 * 3 + $boxSize);
  drawLine($springNextX + $boxSize, $size / 10 * 3, $springNextX + $boxSize, $size / 10 * 3 + $boxSize);
  drawLine($springNextX, $size / 10 * 3, $springNextX + $boxSize, $size / 10 * 3);

  /* Update Energy Chart */
  updateEnergyBarChart(shrinkParams);
  updateEnergyLineChart();
}

function setMotion() {
  $motionID = setInterval(function() {
    $degree += $motionRate;
    if ($degree == 360) { $degree = 0; }
    clearAll();
    $extension *= Math.exp(-($dampRate * $counter / 1000));
    $strength = $extension * (1 + Math.sin(degToRad($degree)));
    drawEnvironment($strength);
    $boxElement.style['width'] = $springMaxX - $springMinX + $size / 25 + $boxSize + 'px';
    $counter++;
  }, $speedRate);
}

function unsetMotion() {
  clearInterval($motionID);
  $counter = 0;
}

function drawMotionChart() {
  /* Main Motion Chart */
  drawLine($size / 10, $size / 5, $size / 10, $size / 2.5);
  drawLine($size / 10, $size / 2.5, $size / 10 * 9, $size / 2.5);
  addText('Drag the Box to Modify String\'s Tension', $size / 10, $size / 20 * 3, $size / 25);
  addText('X Position', $size / 50 * 39, $size / 25 * 11, $size / 125 * 3);

  /* Energy Bar Chart */
  addText('Energy Bar Chart', $size / 100 * 17, $size / 100 * 49,  $size / 100 * 3);
  drawLine($size / 10, $size / 2, $size / 10, $size / 4 * 3);
  drawLine($size / 10, $size / 4 * 3, $size / 2, $size / 4 * 3);
  addText('100%', $size / 100 * 3, $energy100YPos, $size / 50);
  addText('75%', $size / 20, $energy100YPos + $size / 50 * 3, $size / 50);
  addText('50%', $size / 500 * 23, $energy100YPos + $size / 50 * 3 * 2, $size / 50);
  addText('25%', $size / 20, $energy100YPos + $size / 50 * 3 * 3, $size / 50);
  addText('0%', $size / 500 * 29, $energy100YPos + $size / 50 * 3 * 4, $size / 50);
  addText('Potential', $size / 4, $size / 5 * 4, $size / 125 * 3);
  addText('Kinetic', $size / 50 * 19, $size / 5 * 4, $size / 125 * 3);
  addText('Total', $size / 20 * 3, $size / 5 * 4, $size / 125 * 3);

  /* Energy Line Chart */
  addText('Energy Line Chart', $size / 5 * 3, $size / 100 * 49, $size / 100 * 3);
  drawLine($lineChartStart, $size / 2, $lineChartStart, $size / 4 * 3);
  drawLine($lineChartStart, $size / 4 * 3, $lineChartEnd + 10, $size / 4 * 3);
}

function updateEnergyBarChart(shrinkParams) {
  $energyTotalBarHeight = $extension * 2 * $energyBarChartMaxHeight;
  drawLine($size / 50 * 9, $size / 250 * 187, $size / 50 * 9, $size / 250 * 187 - $energyTotalBarHeight, '#f9ff8d', $size / 50 * 3);
  $energyKineticBarHeight = (shrinkParams - 0.11) * $energyBarChartMaxHeight;
  $energyKineticYPoints.unshift($energyKineticBarHeight);
  if ($energyKineticYPoints.length > $totalLineChartData) { $energyKineticYPoints.pop(); }
  drawLine($size / 50 * 21, $size / 250 * 187, $size / 50 * 21, $size / 250 * 187 - $energyKineticBarHeight, '#ff9aaa', $size / 50 * 3); 
  $energyPotentialBarHeight = $energyTotalBarHeight - $energyKineticBarHeight;
  $energyPotentialYPoints.unshift($energyPotentialBarHeight);
  if ($energyPotentialYPoints.length > $totalLineChartData) { $energyPotentialYPoints.pop(); }
  drawLine($size / 10 * 3, $size / 250 * 187, $size / 10 * 3, $size / 250 * 187 - $energyPotentialBarHeight, '#9affef', $size / 50 * 3);
}

function updateEnergyLineChart() {
  for (var i = 0; i < $energyPotentialYPoints.length; i++) {
    drawDot($lineChartStart + 1 + i, $size / 500 * 373 - $energyPotentialYPoints[i], '#9affef');
    drawDot($lineChartStart + 1 + i, $size / 500 * 373 - $energyKineticYPoints[i], '#ff9aaa');
  }
}

/* Helper Functions */
function drawLine(fromX, fromY, toX, toY, style, width) {
  $ctx.strokeStyle = style ? style : '#ddd';
  $ctx.lineWidth = width ? width : 2;
  $ctx.beginPath();
  $ctx.moveTo(fromX, fromY);
  $ctx.lineTo(toX, toY);
  $ctx.stroke();
}

function drawDot(xPos, yPos, style) {
  $ctx.fillStyle = style;
  $ctx.fillRect(xPos, yPos, 2, 2);
}

function addText(text, posX, posY, fontSize, fill) {
  $ctx.font = fontSize + 'pt Josefin Sans';
  $ctx.fillStyle = fill ? fill : '#ddd';
  $ctx.fillText(text, posX, posY);
}

function clearAll() {
  $ctx.clearRect(0, 0, $size, $size);
}

function degToRad(degree) {
  return degree / 180 * Math.PI;
}
