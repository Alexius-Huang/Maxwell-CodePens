$canvas = {
  element: null,
  width: window.innerWidth,
  height: window.innerHeight,
  fps: 60
};
$ctx = null;
$blackHole = {
  radius: 50,
  maxRadius: 300,
  expandedRadiusPerStar: 0.1,
  acceleration: 0.05,
  eventHorizon: 300,
  expand: function(times) {
    times = times ? times : 0;
    if (this.radius + this.expandedRadiusPerStar * times < this.maxRadius) {
      this.radius += this.expandedRadiusPerStar * times;
    } else {
      this.radius = this.maxRadius;
    }
  },
  draw: function() {
    $ctx.fillStyle = 'black';
    $ctx.shadowColor = 'white';
    $ctx.shadowBlur = $blackHole.radius * 0.1;
    $ctx.beginPath();
    $ctx.arc($canvas.width / 2, $canvas.height / 2, $blackHole.radius, 0, Math.PI * 2);
    $ctx.fill();

    $ctx.font = $blackHole.radius * 0.2 + 'pt Josefin Sans';
    $ctx.fillStyle = '#aaa';
    $ctx.textAlign = 'center';
    $ctx.textBaseline = 'middle';
    $ctx.fillText('Event Horizon', $canvas.width / 2, $canvas.height / 2)
  }
};
$star = {
  data: [],
  maxCount: 300,
  generate: function() {
    if (this.data.length < this.maxCount) {
      this.data.push({
        index: this.data.length,
        radialSpeed: Math.floor(Math.random() * 1000) / 1000,
        initToBlackHoleSpeed: getRandomInt(0, 10),
        time: 0,
        color: { r: 255, g: 255, b: 255 },
        radius: getRandomInt(500, 1000),
        degree: getRandomInt(0, 360)
      });
    }
  },
  terminateList: [],
  drawStarWithData: function(starData) {
    var xPosition = $canvas.width  / 2 + starData.radius * Math.cos(degToRad(starData.degree));
    var yPosition = $canvas.height / 2 + starData.radius * Math.sin(degToRad(starData.degree));
    $ctx.fillStyle = 'rgb(' + starData.color.r + ',' + starData.color.g + ',' + starData.color.b + ')';
    $ctx.fillRect(xPosition, yPosition, 2, 2);
  },
  nextState: function(starData) {
    if (starData.radius > $blackHole.radius) {
      starData.time += 1 / $canvas.fps;
      starData.degree += starData.radialSpeed;      
      starData.radius -= Math.pow(starData.time, 2) * $blackHole.acceleration + starData.initToBlackHoleSpeed;
      if (starData.radius - $blackHole.radius < $blackHole.eventHorizon) {
        var color = 255 * (starData.radius - $blackHole.radius) / $blackHole.eventHorizon;
        starData.color.g = color > 0 ? parseInt(color) : 0;
        starData.color.b = color > 0 ? parseInt(color) : 0;
      }
    } else this.terminateList.push(starData.index);
  },
  terminateStars: function() {
    var newStarData = [];
    for (var index of this.terminateList) { this.data[index] = undefined; }
    for (var star of this.data) {
      if (star !== undefined) {
        star.index = newStarData.length;
        newStarData.push(star);
      }
    }
    $blackHole.expand(this.terminateList.length);
    this.terminateList = [];
    this.data = JSON.parse(JSON.stringify(newStarData));
  }
};

/* Helper Functions */
  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function degToRad(degree) {
    return degree / 180 * Math.PI;
  }

/* Main Function */
$(document).ready(function() {
  $canvas.element = document.getElementById('main-canvas');
  $canvas.element.width  = $canvas.width;
  $canvas.element.height = $canvas.height;
  if ($canvas.element.getContext) {
    $ctx = $canvas.element.getContext('2d');

    function animation() {
      setTimeout(function() {
        requestAnimationFrame(animation);
        $ctx.clearRect(0, 0, $canvas.width, $canvas.height);
        
        /* Each frame generates a star until its maxima */
        $star.generate();

        /* Loop through each star */
        for (var star of $star.data) {
          $star.nextState(star);
          $star.drawStarWithData(star);
        }

        /* Terminate the star list with undefined data */
        $star.terminateStars();

        /* Draw blackhole */
        $blackHole.draw();
      }, 1000 / $canvas.fps);
    }
    animation();
  }
});
