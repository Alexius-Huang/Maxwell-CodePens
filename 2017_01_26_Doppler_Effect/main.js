var $canvas = {
  element: null,
  width: 800,
  height: 600,
};
var $ctx;
var $circle = {
  data: [],
  maxRadius: 500,
  disperseSpeed: 1.5,
  gradient: {
    base: 30,
    left: null,
    right: null
  }
};
var $source = {
  baseXPosition: $canvas.width / 2,
  xPosition: $canvas.width  / 2,
  yPosition: $canvas.height / 2,
  maxDisplacement: 150,
  currentDegree: 0,
  degreeIncreasePerInterval: 0.5
};

/* Helper Functions */
  function drawCircle(centerX, centerY, radius) {
    adjustGradientStyle();
    var gradient = $ctx.createLinearGradient(0, 0, $canvas.width, 0);
    gradient.addColorStop(0, 'rgba(' + $circle.gradient.left + ', ' + (1 - radius / $circle.maxRadius) + ')');
    gradient.addColorStop(1, 'rgba(' + $circle.gradient.right + ', ' + (1 - radius / $circle.maxRadius) + ')');
    $ctx.strokeStyle = gradient;
    $ctx.lineWidth = 5 * (1 - radius / $circle.maxRadius);
    $ctx.shadowBlur  = radius / 5;
    $ctx.shadowColor = "#666";
    $ctx.beginPath();
    $ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    $ctx.stroke();
  }

  function drawSource() {
    $ctx.fillStyle = '#ccc';
    $ctx.shadowColor = '#ccc';
    $ctx.shadowBlur = 5;
    $ctx.beginPath();
    $ctx.arc($source.xPosition, $source.yPosition, 10, 0, Math.PI * 2);
    $ctx.fill();
  }

  function clearAll() {
    $ctx.clearRect(0, 0, $canvas.width, $canvas.height);
  }

  function degToRad(degree) { return degree / 180 * Math.PI; }

/* Main Functions */
  function initializeCanvas() {
    $ctx = $canvas.element.getContext('2d');
    $canvas.element.width  = $canvas.width;
    $canvas.element.height = $canvas.height;
  }

  function updateSourceAnimation() {
    $source.xPosition = $source.baseXPosition + $source.maxDisplacement * Math.sin(degToRad($source.currentDegree));
    drawSource();
    $source.currentDegree += $source.degreeIncreasePerInterval;
    if ($source.currentDegree === 360) { $source.currentDegree = 0; }
  }

  function updateCirclesAnimation() {
    var newCircles = [];
    for (var circle of $circle.data) {
      circle.radius += $circle.disperseSpeed;
      var opacity = 1 - circle.radius / $circle.maxRadius;
      opacity = opacity < 0 ? 0 : opacity;
      drawCircle(circle.x, circle.y, circle.radius, 'rgba(45,224,241,' + opacity + ')');
      if (circle.radius < $circle.maxRadius) {
        newCircles.push(circle);
      }
    }
    $circle.data = newCircles;
  }

  function createNewCircle() {
    $circle.data.push({ x: $source.xPosition, y: $source.yPosition, radius: 10 });
  }

  function adjustGradientStyle() {
    var ratio = Math.sin(degToRad($source.currentDegree));
    var baseColor = $circle.gradient.base;
    var middleColor = (255 - baseColor) / 2;
    $circle.gradient.left = String(parseInt(baseColor + middleColor * (1 - ratio))) + ', ' + baseColor + ', ' + String(parseInt(baseColor + middleColor * (1 + ratio)));
    $circle.gradient.right = String(parseInt(baseColor + middleColor * (1 + ratio))) + ', ' + baseColor + ', ' + String(parseInt(baseColor + middleColor * (1 - ratio)));
  }

$(document).ready(function() {
  $canvas.element = document.getElementById('main-canvas');
  if ($canvas.element.getContext) {
    initializeCanvas();

    var counter = 0;
    setInterval(function() {
      counter++;
      clearAll();
      updateSourceAnimation();
      updateCirclesAnimation();

      if (counter == 50) {
        counter = 0;
        createNewCircle();
      }
    }, 15);
  }
});
