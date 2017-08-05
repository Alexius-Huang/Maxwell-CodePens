var $canvas = {
  element: null,
  width: NaN,
  height: NaN,
  refresh: function() { $ctx.clearRect(0, 0, this.width, this.height); },
  intervalID: null
};
var $ctx = null;
var $dots = {
  count: 100,
  details: [],
  radius: { max: 3, min: 1 },
  detectionRange: 200,
  randomInit: function() {
    for (var i = 1; i <= this.count; i++) {
      var obj = {
        index: i,
        position: { x: getRandomInt(1, $canvas.width), y: getRandomInt(1, $canvas.height) },
        radius: getRandomInt(this.radius.min, this.radius.max),
        velocity: Math.random(),
        angle: getRandomInt(1, 360)
      };
      this.details.push(obj);
    }
  },
  each: function(callback) {
    for (var dot of this.details) { callback(dot) }
  }
};
var $mouse = { position: { x: NaN, y: NaN } };
var $draw = {
  line: function(fromX, fromY, toX, toY, width, style) {
    $ctx.strokeStyle = style ? style : '#ddd';
    $ctx.lineWidth = width ? width : 1;
    $ctx.beginPath();
    $ctx.moveTo(fromX, fromY);
    $ctx.lineTo(toX, toY);
    $ctx.stroke();
  },
  dot: function(centerX, centerY, radius, style) {
    $ctx.fillStyle = style ? style : '#ddd';
    $ctx.beginPath();
    $ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
    $ctx.fill();
  }
}

function getRandomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function degToRad(degree) { return degree / 180 * Math.PI }
function distance(dotA, dotB) { return Math.sqrt(Math.pow(dotA.position.x - dotB.position.x, 2) + Math.pow(dotA.position.y - dotB.position.y, 2)) }

$(document).ready(function() {
  $canvas.width = $(window).width();
  $canvas.height = $(window).height();
  $canvas.element = document.getElementById('main-canvas');
  $canvas.element.height = $canvas.height;
  $canvas.element.width  = $canvas.width;

  if ($canvas.element.getContext) {
    $ctx = $canvas.element.getContext('2d');

    $dots.randomInit();

    var animation = function() {
      $canvas.refresh();

      $dots.each(function(dot) {
        $draw.dot(dot.position.x, dot.position.y, dot.radius)
        $dots.each(function(compareDot) {
          var d = distance(dot, compareDot)
          if (dot.index < compareDot.index && d < $dots.detectionRange) {
            $draw.line(dot.position.x, dot.position.y, compareDot.position.x, compareDot.position.y, 1, 'rgba(255, 255, 255, ' + (1 - d / $dots.detectionRange) + ')')
          }
        })
        var mouseDistance = distance(dot, $mouse);
        if (mouseDistance < $dots.detectionRange) {
          $draw.line(dot.position.x, dot.position.y, $mouse.position.x, $mouse.position.y, 1, 'rgba(255, 255, 255, ' + (1 - mouseDistance / $dots.detectionRange) + ')')
        }
      })

      var newData = [];
      $dots.each(function(dot) {
        var newPositionX = dot.position.x + dot.velocity * Math.cos(degToRad(dot.angle));
        var newPositionY = dot.position.y + dot.velocity * Math.sin(degToRad(dot.angle));
        if (newPositionX > $(window).width() + $dots.detectionRange) { newPositionX = -$dots.detectionRange }
        if (newPositionX < -$dots.detectionRange) { newPositionX = $(window).width() + $dots.detectionRange }
        if (newPositionY > $(window).height() + $dots.detectionRange) { newPositionY = -$dots.detectionRange }
        if (newPositionY < -$dots.detectionRange) { newPositionY = $(window).height() + $dots.detectionRange }

        newData.push({
          index: dot.index,
          position: { x: newPositionX, y: newPositionY },
          radius: dot.radius,
          velocity: dot.velocity,
          angle: dot.angle
        })
      })
      $dots.details = newData;

      window.setTimeout(function() {
        window.requestAnimationFrame(animation)
      }, 1000 / 60)
    }

    window.onmousemove = function(event) {
      $mouse.position.x = event.clientX;
      $mouse.position.y = event.clientY;
    }
    window.requestAnimationFrame(animation);
  }
});
