var $canvas;
var $canvasContainer;
var $size = 500;
var $ctx;
var $stretchUnit = 10 / 1.1;
var $springMaxY = 195;
var $springMinY = 155;
var $springMinX = 70;
var $springMaxX = NaN;
var $springCurrentX = NaN;
var $springNextX = NaN;
var $boxSize = 50;
var $degree = 90;
var $extension = 0.5;
var $strength = NaN;
var $motionRate = 5;
var $motionID = null;
var $isDragging = false;
var $boxElement = document.createElement('div');
var $boxHammerElement;
var $dragXPosition = NaN;
var $energy100YPos = 260;
var $energyBarChartMaxHeight = 30 * 4;
var $energyTotalBarHeight = NaN;
var $energyKineticBarHeight = NaN;
var $energyPotentialBarHeight = NaN;
var $energyKineticYPoints = [];
var $energyPotentialYPoints = [];
var $lineChartStart = 275;
var $lineChartEnd = 450 - 10;
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
  $canvas.width = $size - 50;
  $canvasContainer.style['width'] = $size + 'px';
  $canvasContainer.style['height'] = $size - 50 + 'px';
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
  drawLine(50, 175, $springMinX, 175);
  drawLine(70, 175, $springCurrentX, $springMaxY);
  for (var i = 1; i <= 20; i++) {
    drawLine($springCurrentX, (i % 2 == 0 ? $springMinY : $springMaxY), $springNextX, (i % 2 == 0 ? $springMaxY : $springMinY));
    $springCurrentX = $springNextX;
    $springNextX = $springCurrentX + $stretchUnit * shrinkParams;
  }
  drawLine($springCurrentX, $springMaxY, $springNextX, 175);
  drawLine($springNextX, 175, $springNextX + 20, 175);
  if (!$springMaxX || $springNextX > $springMaxX) { $springMaxX = $springNextX; }
  $springNextX += 20;

  /* Draw Box */
  drawLine($springNextX, 150, $springNextX, 150 + $boxSize);
  drawLine($springNextX + $boxSize, 150, $springNextX + $boxSize, 150 + $boxSize);
  drawLine($springNextX, 150, $springNextX + $boxSize, 150);

  /* Update Energy Chart */
  updateEnergyBarChart(shrinkParams);
  updateEnergyLineChart();
}

function setMotion() {
  $motionID = setInterval(function() {
    $degree += $motionRate;
    if ($degree == 360) { $degree = 0; }
    clearAll();
    $extension *= Math.exp(-($dampRate * $counter /1000));
    $strength = $extension * (1 + Math.sin(degToRad($degree)));
    drawEnvironment($strength);
    $boxElement.style['width'] = $springMaxX - $springMinX + 20 + $boxSize + 'px';
    $counter++;
  }, $speedRate);
}

function unsetMotion() {
  clearInterval($motionID);
  $counter = 0;
}

function drawMotionChart() {
  /* Main Motion Chart */
  drawLine(50, 100, 50, 200);
  drawLine(50, 200, 450, 200);
  addText('Drag the Box to Modify String\'s Tension', 50, 75, 20);
  addText('X Position', 390, 220, 12)

  /* Energy Bar Chart */
  addText('Energy Bar Chart', 85, 245, 15);
  drawLine(50, 250, 50, 375);
  drawLine(50, 375, 250, 375);
  addText('100%', 15, $energy100YPos, 10);
  addText('75%', 25, $energy100YPos + 30, 10);
  addText('50%', 23, $energy100YPos + 60, 10);
  addText('25%', 25, $energy100YPos + 90, 10);
  addText('0%', 29, $energy100YPos + 120, 10);
  addText('Potential', 125, 400, 12);
  addText('Kinetic', 190, 400, 12);
  addText('Total', 75, 400, 12);

  /* Energy Line Chart */
  addText('Energy Line Chart', 300, 245, 15);
  drawLine($lineChartStart, 250, $lineChartStart, 375);
  drawLine($lineChartStart, 375, $lineChartEnd + 10, 375);
}

function updateEnergyBarChart(shrinkParams) {
  $energyTotalBarHeight = $extension * 2 * $energyBarChartMaxHeight;
  drawLine(90, 374, 90, 374 - $energyTotalBarHeight, '#f9ff8d', 30);
  $energyKineticBarHeight = (shrinkParams - 0.11) * $energyBarChartMaxHeight;
  $energyKineticYPoints.unshift($energyKineticBarHeight);
  if ($energyKineticYPoints.length > $totalLineChartData) { $energyKineticYPoints.pop(); }
  drawLine(210, 374, 210, 374 - $energyKineticBarHeight, '#ff9aaa', 30); 
  $energyPotentialBarHeight = $energyTotalBarHeight - $energyKineticBarHeight;
  $energyPotentialYPoints.unshift($energyPotentialBarHeight);
  if ($energyPotentialYPoints.length > $totalLineChartData) { $energyPotentialYPoints.pop(); }
  drawLine(150, 374, 150, 374 - $energyPotentialBarHeight, '#9affef', 30);
}

function updateEnergyLineChart() {
  for (var i = 0; i < $energyPotentialYPoints.length; i++) {
    drawDot($lineChartStart + 1 + i, 373 - $energyPotentialYPoints[i], '#9affef');
    drawDot($lineChartStart + 1 + i, 373 - $energyKineticYPoints[i], '#ff9aaa');
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
