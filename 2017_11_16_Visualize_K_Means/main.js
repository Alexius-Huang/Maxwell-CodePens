/* Polyfill for NodeList */
NodeList.prototype.map = function(callback) {
  var result = [];
  for (var i = 0; i < this.length; i++) {
    result.push(callback(this[i]));
  }
  return result;
}
NodeList.prototype.each = function(callback) {
  for (var i = 0; i < this.length; i++) {
    callback(this[i]);
  }
}
NodeList.prototype.remove = function() {
  for (var i = 0; i < this.length; i++) {
    this[i].remove();
  }
}

/* Polyfill for Node */
Node.prototype.setAttributeFromObject = function(obj) {
  for (var key of Object.keys(obj)) {
    this.setAttribute(key, obj[key])
  }
}
Node.prototype.getAttributeFromObject = function() {
  var attrArray = this.attributes;
  var attr = {};
  for (var i = 0; i < attrArray.length; i++) {
    var value = this.getAttribute(attrArray[i].name);
    attr[attrArray[i].name] = isNaN(value) ? value : Number(value);
  }
  return attr;
}
Node.prototype.remove = function() { this.parentNode.removeChild(this) }

/* Polyfill for Math */
Math.roundDecimal = function(value, precision) {
  return Number(value.toFixed(precision)) 
}

function randomColor() {
  /* Accept color brighter than #999999 */
  var letters = '9ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * letters.length)];
  }
  return color;
}

function pythagorianSquared(arr1, arr2) {
  return Math.pow(arr1[0] - arr2[0], 2) + Math.pow(arr1[1] - arr2[1], 2); 
}

/* Main Function */
var main = function() {
  /* Variables Initialization */
  var uniqueDataCounter = 0;
  var uniqueCentroidCounter = 0;
  var runKMeansBtn = document.getElementById('run-k-means-btn');
  var sampleModeBtn = document.getElementById('sample-mode-btn');
  var centroidModeBtn = document.getElementById('centroid-mode-btn');
  var clearCentroidBtn = document.getElementById('clear-centroids-btn');
  var clearSamplesBtn = document.getElementById('clear-samples-btn');
  var sampleInput = document.getElementById('sample-input');
  var sampleInputBG = document.getElementById('sample-input-bg');
  var sampleRangeInput = document.getElementById('sample-range-input');
  var sampleRangeInputBG = document.getElementById('sample-range-input-bg');
  var intervalInput = document.getElementById('interval-input');
  var iterationInput = document.getElementById('iteration-input');
  var disablePanel = document.getElementById('disable-panel');
  var errorModal = document.getElementById('error-modal');
  var errorContent = document.getElementById('error-content');

  /* Initialize mode for planting centroids or samples */
  var mode = 'sample';
  var previousMode;
  var originalIteration;

  /* K-Means SVG Object */
  var svg = {
    element: document.getElementById('k-means-svg'),
    width: 600,
    height: 600,
    offset: 50,
    coordinateSize: 500,
    svgSource: 'http://www.w3.org/2000/svg',
    init: function() {
      /* Initialize svg coordinate axis */
      var leftTop = [this.offset, this.offset]
      var leftBottom = [this.offset, this.height - this.offset]
      var rightBottom = [this.width - this.offset, this.height - this.offset]
      var axis = 'M' + leftTop[0]     + ' ' + leftTop[0]     + ' ' +
                 'L' + leftBottom[0]  + ' ' + leftBottom[1]  + ' ' +
                 'L' + rightBottom[0] + ' ' + rightBottom[1]
      this.path(axis)
      
      /* Captions and Labels */
      this.text('K Means Visualization', this.width / 2, this.offset - 10, '', 'center', 'font-size: 15pt')
      this.text('Feature 2', this.offset, this.offset - 20)
      this.text('Feature 1', this.width - this.offset, this.height - this.offset - 10)

      this.text('0', this.offset - 10, this.height - this.offset + 15)
      for (var i = 1; i <= 10; i++) {
        this.text(i / 10, this.offset - 5, this.height - this.offset - (this.coordinateSize / 10) * i + 5, '', 'right')
        this.text(i / 10, this.offset + (this.coordinateSize / 10) * i, this.height - this.offset + 15)
      }

      /* Draw Grid */
      var style = 'stroke-dasharray: 1, 5; stroke-opacity: 0.4;';
      for (var i = 1; i <= 10; i++) {
        var xPosition = this.offset + this.coordinateSize / 10 * i;
        var yPosition = this.height - this.offset - this.coordinateSize / 10 * i;
        var d1 = 'M' + xPosition + ' ' + this.offset + ' L' + xPosition + ' ' + (this.coordinateSize + this.offset);
        var d2 = 'M' + this.offset + ' ' + yPosition + ' L' + (this.coordinateSize + this.offset) + ' ' + yPosition;
        this.path(d1, style);
        this.path(d2, style);
      }

      /* Initialize svg event */
      this.element.addEventListener('click',     this.onClick.bind(this));
      // this.element.addEventListener('mousemove', this.onMousemove.bind(this));
    },
    path: function(d, style, className, color, id) {
      var path = document.createElementNS(this.svgSource, 'path');
      var params = {
        d: d,
        stroke: color || '#ddd',
        fill: 'none',
        style: style || '',
        class: className || '',
        id: id || ''
      }
      path.setAttributeFromObject(params)
      this.element.appendChild(path)
    },
    text: function(content, x, y, className, align, style, color) {
      var text = document.createElementNS(this.svgSource, 'text');
      var params = {
        x: x,
        y: y,
        fill: color || '#ddd',
        style: style || 'font-size: 10pt;',
        class: className || '',
      }
      switch(align) {
        case 'left':  params['text-anchor'] = 'start'; break;
        case 'right': params['text-anchor'] = 'end';   break;
        default:      params['text-anchor'] = 'middle';
      }
      text.setAttributeFromObject(params);
      text.textContent = content;
      this.element.appendChild(text);
    },
    rect: function(x, y, width, height, style, className, color) {
      var params = {
        x: x,
        y: y,
        width: width,
        height: height,
        fill: color || '#ddd',
        style: style || ''
      };
      var group = document.createElementNS(this.svgSource, 'g');
      group.setAttribute('class', className);
      var rect = document.createElementNS(this.svgSource, 'rect');
      group.appendChild(rect);
      rect.setAttributeFromObject(params);
      this.element.appendChild(group);
    },

    /* Events */
    onClick: function(event) {
      if (position = this.getCoordinate(event.offsetX, event.offsetY)) {
        /* Draw sample or centroid and append to data array */
        var data = {
          f1: position.x / this.coordinateSize,
          f2: position.y / this.coordinateSize
        };

        if (mode === 'sample') {
          for (var i = 1; i <= sampleInput.value; i++) {
            var xPosition = -1, yPosition = -1;
            while (xPosition < 0 || xPosition > svg.coordinateSize || yPosition < 0 || yPosition > svg.coordinateSize) {
              xPosition = Math.floor((Math.random() - 0.5) * sampleRangeInput.value) + position.x;
              yPosition = Math.floor((Math.random() - 0.5) * sampleRangeInput.value) + position.y;
            }
            this.dot(xPosition, yPosition, ++uniqueDataCounter);
          }
          // data.id = uniqueDataCounter;
        } else if (mode === 'centroid') {
          data.color = randomColor();
          /* Assign and draw the centroid as the cross */
          this.cross(position.x, position.y, 7, data.color, 'centroid-' + (++uniqueCentroidCounter));
          data.id = 'centroid-' + uniqueCentroidCounter;
          document.getElementById(data.id).setAttribute('data-origin', 'true');
        }
      }
    },

    /* Custom Methods */
    getCoordinate: function(x, y) {
      if (
        x >= this.offset && x <= this.width  - this.offset &&
        y >= this.offset && y <= this.height - this.offset
      ) {
        return {
          x: x - this.offset,
          y: this.height - this.offset - y
        };
      } else return null;
    },
    cross: function(x, y, radius, color, id) {
      var svgPosition = { x: x + this.offset, y: this.height - this.offset - y };
      var path =
        'M' + (svgPosition.x - radius) + ' ' + (svgPosition.y - radius) + ' ' +
        'L' + (svgPosition.x + radius) + ' ' + (svgPosition.y + radius) + ' ' +
        'M' + (svgPosition.x - radius) + ' ' + (svgPosition.y + radius) + ' ' +
        'L' + (svgPosition.x + radius) + ' ' + (svgPosition.y - radius);
      this.path(path, 'stroke-width: 3pt; animation: fadeIn .5s;', 'centroid current', color, id);

      /* Cross Hover Event */
      var cross = document.getElementById(id);
      cross.addEventListener('mouseover', function(event) {
        event.stopPropagation();
        svg.onCrossHover[0](event.target);
      });
      cross.addEventListener('mouseleave', function(event) {
        event.stopPropagation();
        svg.onCrossHover[1](event.target);
      });

      /* Set custom data attribute */
      var attributes = {
        'data-svg-x': svgPosition.x,
        'data-svg-y': svgPosition.y,
        'data-coord-x': x,
        'data-coord-y': y,
        'data-x': x / this.coordinateSize,
        'data-y': y / this.coordinateSize,
        'data-color': color
      };
      cross.setAttributeFromObject(attributes);
    },
    dot: function(x, y, id, radius, color, style) {
      var dot = document.createElementNS(this.svgSource, 'circle');
      var params = {
        cx: this.offset + Number(x),
        cy: this.height - this.offset - Number(y),
        r:  radius || 5,
        fill: color || '#ddd',
        id: 'data-' + id,
        style: style || 'animation: fadeIn .5s',
        'dot-id': id,
        'data-coord-x': x,
        'data-coord-y': y,
        'data-x': x / this.coordinateSize,
        'data-y': y / this.coordinateSize,
      };
      params['data-svg-x'] = params.cx;
      params['data-svg-y'] = params.cy;
      dot.setAttributeFromObject(params);
      this.element.appendChild(dot);

      /* Dot's hover event */
      dot.addEventListener('mouseover', function(event) {
        event.stopPropagation();
        svg.onDotHover[0](event.target);
      });

      dot.addEventListener('mouseleave', function(event) {
        event.stopPropagation();
        svg.onDotHover[1](event.target);
      });
    },

    /* Custom Events */
    onCrossHover: [
      function(cross) {
        var attr = cross.getAttributeFromObject();
        var x = attr['data-svg-x'], y = attr['data-svg-y'];

        /* Create Modal */
        var boxSize = [150, 50];
        var marginTop = 20;
        svg.rect(
          x - (boxSize[0] / 2),
          y - (boxSize[1] + marginTop),
          boxSize[0],
          boxSize[1],
          'animation: fadeInEightyPercent .25s; opacity: 0.8;',
          'centroid-info',
          attr['data-color']
        );

        var padding = 10;
        var position = '(' + Math.roundDecimal(attr['data-x'], 3) + ', ' + Math.roundDecimal(attr['data-y'], 3) + ')';
        svg.text('Centroid', x, y - (boxSize[1] + marginTop) + 20, 'centroid-info', 'middle', null, '#333');
        svg.text(position, x, y - (boxSize[1] + marginTop) + 40, 'centroid-info', 'middle', null, '#333');
      },
      function(cross) {
        document.querySelectorAll('.centroid-info').remove();
      }
    ],
    onDotHover: [
      function(dot) {
        var attr = dot.getAttributeFromObject();
        var x = attr['data-svg-x'], y = attr['data-svg-y'];

        /* Create Modal */
        var boxSize = [100, 30];
        var marginTop = 10;
        svg.rect(
          x - (boxSize[0] / 2),
          y - (boxSize[1] + marginTop),
          boxSize[0],
          boxSize[1],
          'animation: fadeInEightyPercent .25s; opacity: 0.8;',
          'data-info',
          attr['data-color']
        );

        var padding = 10;
        var position = '(' + attr['data-x'] + ', ' + attr['data-y'] + ')';
        svg.text(position, x, y - (boxSize[1] + marginTop) + 20, 'data-info', 'middle', null, '#333');
      },
      function(dot) {
        document.querySelectorAll('.data-info').remove();
      }
    ],
  }
  svg.init();

  /* -------------------------- Custom Event Program ---------------------------- */

  /* Mode button change between sample mode and centroid mode */
  sampleModeBtn.addEventListener('click', function(event) {
    event.preventDefault();
    if (mode === 'centroid') { 
      mode = 'sample';
      sampleModeBtn.setAttribute('data-trigger', 'true');
      for (var input of [sampleInputBG, sampleRangeInputBG, clearSamplesBtn]) {
        input.setAttribute('class', 'lighten')
      }
      centroidModeBtn.setAttribute('data-trigger', 'false');
      clearCentroidBtn.setAttribute('class', '')
    }
  });
  centroidModeBtn.addEventListener('click', function(event) {
    event.preventDefault();
    if (mode === 'sample') {
      mode = 'centroid';
      centroidModeBtn.setAttribute('data-trigger', 'true');
      clearCentroidBtn.setAttribute('class', 'lighten');
      sampleModeBtn.setAttribute('data-trigger', 'false');
      for (var input of [sampleInputBG, sampleRangeInputBG, clearSamplesBtn]) {
        input.setAttribute('class', '')
      }
    }
  });

  /* Clear Centroid & Sample Btn Events */
  clearCentroidBtn.addEventListener('click', function() {
    document.querySelectorAll('path.centroid').remove();
    document.querySelectorAll('path.centroid-connection').remove();
  });
  clearSamplesBtn.addEventListener('click', function() { document.querySelectorAll('circle').remove() });

  /* Run K-Means Algorithm */
  runKMeansBtn.addEventListener('click', function(event) {
    event.preventDefault();

    /* Set back to normal mode */
    if (mode === 'k-means') {
      runKMeansBtn.setAttribute('class', '')
      runKMeansBtn.innerText = 'Run K-Means Algorithm'
      disablePanel.setAttribute('class', '')
      mode = previousMode

      iterationInput.setAttribute('value', originalIteration)
      return
    }

    previousMode = mode;
    originalIteration = Number(iterationInput.value);

    /* Clear out paths that has been already run */
    document.querySelectorAll('path.centroid-connection').remove();
    document.querySelectorAll('path.centroid').each(centroid => {
      if (centroid.getAttribute('data-origin') === 'true') {
        centroid.setAttribute('class', 'centroid current')        
      } else centroid.remove();
    });

    /* Clean all of the sample's color */
    document.querySelectorAll('circle').each(circle => circle.style.fill = '#ffffff');

    var samples = document.querySelectorAll('circle').map(sample => sample.getAttributeFromObject());
    var sampleMatrix = samples.map(attr => [attr['data-coord-x'], attr['data-coord-y']]);  
    var m = sampleMatrix.length;

    function popErrorModal(message) {
      errorModal.className = 'modal active';
      errorContent.innerText = message;
      setTimeout(() => errorModal.className = 'modal', 1500);
    }

    /* Validation Step */
    var centroids = document.querySelectorAll('path.centroid.current').map(centroid => centroid.getAttributeFromObject());
    if ( ! centroids || centroids.length < 2) {
      popErrorModal('There must exists at least 2 centroids!')
      return
    } else if (centroids.length > samples.length) {
      popErrorModal('The count of samples must larger than centroids!');
      return
    }

    /* Initialize centroids variables */
    var centroidMatrix, nearestCentroidIndices, centroidSampleMapping;

    function initializeKMeansCentroidData() {
      /* Initialize Values */
      centroids = document.querySelectorAll('path.centroid.current').map(centroid => centroid.getAttributeFromObject());
      centroidMatrix = centroids.map(attr => [attr['data-coord-x'], attr['data-coord-y']]);
      nearestCentroidIndices = [];
      centroidSampleMapping = centroids.map(attr => []);
    }
    initializeKMeansCentroidData();

    /* Label the samples W.R.T. nearest centroids */
    function labelizeSamples() {
      for (var i = 0; i < m; i++) {
        var minDistance = -1;
        var nearestCentroidID = null;
        for (var j = 0; j < centroidMatrix.length; j++) {
          var distance = pythagorianSquared(sampleMatrix[i], centroidMatrix[j]);
          if (minDistance == -1 || distance < minDistance) {
            minDistance = distance;
            nearestCentroidID = j;
          }
        }
        nearestCentroidIndices.push(nearestCentroidID);
      }  
    }

    /* Colorize Sample */
    function colorizeSample() {
      for (var i = 0; i < m; i++) {
        var sample = document.getElementById(samples[i].id);
        var centroidID = nearestCentroidIndices[i];
        sample.style.fill = centroids[centroidID]['data-color'];
        centroidSampleMapping[centroidID].push(i);
      }
    }

    /* Assign centroids to new points */
    function assignNewCentroidPoints(iteration) {
      for (var i = 0; i < centroidSampleMapping.length; i++) {
        var mass = { x: 0, y: 0 };
        var centroid = centroids[i];
        var sampleCount = centroidSampleMapping[i].length;
        
        /* Centroid isn't effective */
        if (sampleCount === 0) {
          console.log('Centroid being dismissed: ' + centroid);
          return
        }

        for (var j = 0; j < sampleCount; j++) {
          mass.x += samples[centroidSampleMapping[i][j]]['data-x'];
          mass.y += samples[centroidSampleMapping[i][j]]['data-y'];
        }
        mass.x = Math.roundDecimal(mass.x / sampleCount * svg.coordinateSize, 3);
        mass.y = Math.roundDecimal(mass.y / sampleCount * svg.coordinateSize, 3);

        var d =
          'M' + Math.roundDecimal(centroid['data-svg-x'], 6) + ' ' + Math.roundDecimal(centroid['data-svg-y'], 6) + ' ' +
          'L' + Math.roundDecimal(mass.x + svg.offset, 6) + ' ' + Math.roundDecimal(svg.height - mass.y - svg.offset, 6);

        svg.path(d, 'opacity: 0.5; animation: fadeInFiftyPercent .5;', 'centroid-connection');
        document.getElementById(centroid.id).setAttribute('class', 'centroid');

        svg.cross(mass.x, mass.y, 7, centroid['data-color'], 'centroid-' + i + '-iter-' + iteration);
      }
    }

    let iterations = Number(iterationInput.value)
    let interval   = Number(intervalInput.value)
    let runKMeansRecursive = function(i) {
      initializeKMeansCentroidData();
      labelizeSamples();
      colorizeSample();
      assignNewCentroidPoints(i);
      iterationInput.setAttribute('value', originalIteration - i);

      setTimeout(() => {
        if (i > 0 && mode === 'k-means') runKMeansRecursive(i - 1) 
        else {
          runKMeansBtn.setAttribute('class', '')
          runKMeansBtn.innerText = 'Run K-Means Algorithm'
          disablePanel.setAttribute('class', '')
          mode = previousMode
        }
      }, interval);
    }

    mode = 'k-means'
    runKMeansBtn.setAttribute('class', 'active')
    runKMeansBtn.innerText = 'Stop'
    disablePanel.setAttribute('class', 'active')

    runKMeansRecursive(iterations - 1)
  });

  /* Run KMeans For Preview */
  const data = '[{ "x": "394", "y": "431" }, { "x": "355", "y": "382" }, { "x": "376", "y": "381" }, { "x": "406", "y": "386" }, { "x": "428", "y": "382" }, { "x": "274", "y": "395" }, { "x": "298", "y": "357" }, { "x": "309", "y": "338" }, { "x": "331", "y": "351" }, { "x": "369", "y": "392" }, { "x": "405", "y": "327" }, { "x": "343", "y": "339" }, { "x": "346", "y": "412" }, { "x": "353", "y": "364" }, { "x": "350", "y": "344" }, { "x": "355", "y": "330" }, { "x": "410", "y": "334" }, { "x": "373", "y": "376" }, { "x": "417", "y": "317" }, { "x": "388", "y": "358" }, { "x": "392", "y": "414" }, { "x": "414", "y": "341" }, { "x": "423", "y": "365" }, { "x": "362", "y": "412" }, { "x": "437", "y": "387" }, { "x": "401", "y": "414" }, { "x": "385", "y": "402" }, { "x": "385", "y": "403" }, { "x": "370", "y": "350" }, { "x": "401", "y": "348" }, { "x": "413", "y": "451" }, { "x": "445", "y": "464" }, { "x": "492", "y": "392" }, { "x": "465", "y": "443" }, { "x": "497", "y": "469" }, { "x": "435", "y": "359" }, { "x": "386", "y": "336" }, { "x": "376", "y": "304" }, { "x": "387", "y": "298" }, { "x": "459", "y": "365" }, { "x": "386", "y": "68" }, { "x": "348", "y": "33" }, { "x": "391", "y": "109" }, { "x": "424", "y": "64" }, { "x": "371", "y": "53" }, { "x": "360", "y": "45" }, { "x": "368", "y": "134" }, { "x": "404", "y": "48" }, { "x": "372", "y": "81" }, { "x": "353", "y": "74" }, { "x": "434", "y": "108" }, { "x": "404", "y": "100" }, { "x": "442", "y": "79" }, { "x": "440", "y": "105" }, { "x": "387", "y": "116" }, { "x": "457", "y": "145" }, { "x": "434", "y": "123" }, { "x": "433", "y": "115" }, { "x": "466", "y": "103" }, { "x": "431", "y": "124" }, { "x": "362", "y": "50" }, { "x": "412", "y": "32" }, { "x": "343", "y": "16" }, { "x": "390", "y": "65" }, { "x": "380", "y": "71" }, { "x": "239", "y": "109" }, { "x": "264", "y": "44" }, { "x": "289", "y": "80" }, { "x": "250", "y": "101" }, { "x": "238", "y": "84" }, { "x": "333", "y": "138" }, { "x": "323", "y": "69" }, { "x": "313", "y": "41" }, { "x": "386", "y": "81" }, { "x": "331", "y": "48" }, { "x": "306", "y": "99" }, { "x": "378", "y": "61" }, { "x": "296", "y": "81" }, { "x": "335", "y": "106" }, { "x": "334", "y": "75" }, { "x": "407", "y": "111" }, { "x": "374", "y": "116" }, { "x": "360", "y": "44" }, { "x": "377", "y": "88" }, { "x": "408", "y": "121" }, { "x": "88", "y": "152" }, { "x": "39", "y": "224" }, { "x": "16", "y": "222" }, { "x": "30", "y": "136" }, { "x": "20", "y": "223" }, { "x": "75", "y": "250" }, { "x": "93", "y": "257" }, { "x": "53", "y": "211" }, { "x": "87", "y": "211" }, { "x": "59", "y": "195" }, { "x": "103", "y": "225" }, { "x": "71", "y": "284" }, { "x": "106", "y": "313" }, { "x": "86", "y": "296" }, { "x": "51", "y": "315" }, { "x": "32", "y": "245" }, { "x": "40", "y": "303" }, { "x": "76", "y": "255" }, { "x": "58", "y": "263" }, { "x": "111", "y": "246" }, { "x": "86", "y": "275" }, { "x": "171", "y": "241" }, { "x": "79", "y": "287" }, { "x": "126", "y": "313" }, { "x": "81", "y": "267" }, { "x": "61", "y": "208" }, { "x": "143", "y": "216" }, { "x": "142", "y": "254" }, { "x": "112", "y": "267" }, { "x": "141", "y": "246" }, { "x": "70", "y": "270" }, { "x": "54", "y": "250" }, { "x": "87", "y": "220" }, { "x": "115", "y": "223" }, { "x": "77", "y": "255" }, { "x": "115", "y": "197" }, { "x": "67", "y": "215" }, { "x": "152", "y": "219" }, { "x": "92", "y": "229" }, { "x": "123", "y": "173" }, { "x": "114", "y": "231" }, { "x": "154", "y": "208" }, { "x": "140", "y": "230" }, { "x": "154", "y": "161" }, { "x": "125", "y": "163" }, { "x": "155", "y": "269" }, { "x": "74", "y": "213" }, { "x": "123", "y": "208" }, { "x": "76", "y": "250" }, { "x": "100", "y": "269" }, { "x": "445", "y": "108" }, { "x": "430", "y": "108" }, { "x": "444", "y": "95" }, { "x": "445", "y": "88" }, { "x": "456", "y": "21" }, { "x": "84", "y": "253" }, { "x": "70", "y": "327" }, { "x": "7", "y": "301" }, { "x": "56", "y": "262" }, { "x": "47", "y": "272" }]'
  const dataArray = JSON.parse(data)
  const centroidsData = [ { x: 489, y: 218 }, { x: 100, y: 32 }, { x: 143, y: 450 } ]

  for (let { x, y } of dataArray) svg.dot(x, y, ++uniqueDataCounter)
  for (let { x, y } of centroidsData) {
    let id = 'centroid-' + (++uniqueCentroidCounter);
    svg.cross(x, y, 7, randomColor(), id);
    document.getElementById(id).setAttribute('data-origin', 'true');
  }

  setTimeout(() => runKMeansBtn.click(), 1000)
};

window.addEventListener('load', main);

