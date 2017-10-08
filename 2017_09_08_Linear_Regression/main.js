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
Node.prototype.remove = function() { this.parentNode.removeChild(this) }

/* Recursive create elements */
function recursiveCreateElement(obj) {
  var element = document.createElement(obj.element);

  /* Set attributes of the element */
  if (obj.attributes) {
    element.setAttributeFromObject(obj.attributes)
  }

  /* Append child node in the element */
  if (obj.children && obj.children instanceof Array) {
    for (var child of obj.children) {
      element.appendChild(recursiveCreateElement(child))
    }
  }
  /* Innertext condition */
  else if (obj.innerText) {
    element.innerText = obj.innerText;
  }

  return element
}

/* Main function will be onload after page loaded */
var main = function() {
  /* Init all variables */
  var recordCounter   = 1;
  var tableRecords    = document.getElementById('table-records');
  var helpBtn         = document.getElementById('help-btn');
  var newRecordBtn    = document.getElementById('new-record');
  var trainModelBtn   = document.getElementById('train-model');
  var flushDataBtn    = document.getElementById('flush-data');
  var animateBtn      = document.getElementById('animate-mode');
  var alphaInput      = document.getElementById('alpha-input');
  var iterationsInput = document.getElementById('iterations-input');
  var errorModal      = document.getElementById('error-modal');

  /* Loading the samples automatically */
  var autoloading = true;

  /* A latch for animation mode */
  var animationLatch = false;

  var newRecordForm = function() {
    var inputStructure = function(type) {
      return {
        element: 'td',
        children: [
          {
            element: 'input',
            attributes: {
              'data-id': recordCounter,
              class: 'record-input',
              type: 'text',
              value: '0',
              name: type
            }
          }
        ]
      };
    };
    return {
      element: 'tr',
      attributes: {
        style: 'animation: fadeIn 0.25s;',
        id: 'record-' + recordCounter
      },
      children: [
        inputStructure('midterm-score'),
        inputStructure('final-score'),
        {
          element: 'td',
          children: [
            { element: 'button', attributes: { class: 'save-action',   'data-id': recordCounter }, innerText: 'Save'   },
            { element: 'button', attributes: { class: 'delete-action', 'data-id': recordCounter }, innerText: 'Delete' },
          ]
        },
      ]
    };
  };
  var editRecordForm = function(x, y) {
    return {
      element: 'tr',
      attributes: {
        style: 'animation: fadeIn 0.25s;',
        id: 'record-' + recordCounter
      },
      children: [
        {
          element: 'td',
          innerText: String(x)
        },
        {
          element: 'td',
          innerText: String(y)
        },
        {
          element: 'td',
          children: [
            { element: 'button', attributes: { class: 'edit-action',   'data-id': recordCounter }, innerText: 'Edit'   },
            { element: 'button', attributes: { class: 'delete-action', 'data-id': recordCounter }, innerText: 'Delete' },
          ]
        },
      ]
    };
  };

  /* Modal Helper */
  function popErrorModal(message, duration) {
    errorModal.style.opacity = 1;
    errorModal.querySelector('.error-msg').innerText = message;
    setTimeout(function() {
      errorModal.style.opacity = 0;
    }, (duration || 3) * 1000);
  }

  /* Help Modal */
  helpBtn.addEventListener('click', function() {
    var helpModal = document.getElementById('help-modal');
    helpModal.style['pointer-events'] = 'auto';
    helpModal.style['opacity'] = 1;
  });

  /* Close all the modals when close-btn being clicked */
  document.querySelectorAll('.close-btn').each(node => node.addEventListener('click', function() {
    document.querySelectorAll('.modal').each(modal => {
      modal.style['pointer-events'] = 'none';
      modal.style['opacity'] = 0;
    });
  }));

  /* --------------- Start SVG Object ------------- */

  var svg = {
    element: document.getElementById('diagram'),
    width: 500,
    height: 500,
    offset: 50,
    coordinateSize: 400,
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
      this.text('Students\' Exam Scores', this.width / 2, this.offset - 10, '', 'center', 'font-size: 15pt')
      this.text('Final (Pts)', this.offset, this.offset - 20)
      this.text('Midterm (Pts)', this.width - this.offset, this.height - this.offset - 10)

      this.text('0', this.offset - 10, this.height - this.offset + 15)
      for (var i = 1; i <= 10; i++) {
        this.text(String(i * 10), this.offset - 5, this.height - this.offset - (this.coordinateSize / 10) * i + 5, '', 'right')
        this.text(String(i * 10), this.offset + (this.coordinateSize / 10) * i, this.height - this.offset + 15)
      }

      /* Draw Grid */
      var style = 'stroke-dasharray: 1, 5; stroke-opacity: 0.4;';
      for (var i = 1; i <= 10; i++) {
        var xPosition = this.offset + this.coordinateSize / 10 * i;
        var yPosition = this.height - this.offset - this.coordinateSize / 10 * i;
        var d1 = 'M' + xPosition + ' 50 L' + xPosition + ' 450';
        var d2 = 'M50 ' + yPosition + ' L450 ' + yPosition;
        this.path(d1, style);
        this.path(d2, style);
      }

      /* Initialize svg event */
      this.element.addEventListener('click',     this.onClick.bind(this));
      this.element.addEventListener('mousemove', this.onMousemove.bind(this));
    },
    dot: function(x, y, id, radius, color, style) {
      var circle = document.createElementNS(this.svgSource, 'circle');
      var params = {
        cx: this.offset + Number(x),
        cy: this.height - this.offset - Number(y),
        r:  radius || 5,
        fill: color || '#129900',
        id: 'data-' + id,
        style: style || 'animation: fadeIn .25s',
        'data-id': id,
        'data-midterm': Math.floor(Number(x) / this.coordinateSize * 10000) / 100,
        'data-final':   Math.floor(Number(y) / this.coordinateSize * 10000) / 100
      };
      circle.setAttributeFromObject(params);
      this.element.appendChild(circle);

      /* Circle's hover event */
      circle.addEventListener('mouseover', function(event) {
        event.stopPropagation();
        
        var center = { x: Number(circle.getAttribute('cx')), y: Number(circle.getAttribute('cy')) };
        var scores = { midterm: circle.getAttribute('data-midterm'), final: circle.getAttribute('data-final') };

        /* Circle animation */
        var id = event.target.getAttribute('data-id');
        document.getElementById('record-' + id).style.backgroundColor = '#888';
        circle.style = 'fill: #9bFF79; r: 9; transition: .25s;';

        /* Coordinate of the circle */
        var d = 'M' + center.x + ' 450 ' + 'L' + center.x + ' ' + center.y + 'L50 ' + center.y;
        svg.path(d, 'stroke-dasharray: 4, 7;', 'coordinate-path', '#9bFF79');

        /* Small box of information */
        var textContent = '(' + scores.midterm + ', ' + scores.final + ')';
        if (scores.midterm < 80) {
          var rect = svg.rect(center.x + 5, center.y + 5, 100, 40, 'opacity: 0.7', 'coordinate-info');
          svg.text(textContent, center.x + 55, center.y + 30, 'coordinate-info', undefined, 'font-size: 10pt; font-weight: 500', '#222');
        } else {
          var rect = svg.rect(center.x - 110, center.y + 5, 100, 40, 'opacity: 0.7', 'coordinate-info');
          svg.text(textContent, center.x - 60, center.y + 30, 'coordinate-info', undefined, 'font-size: 10pt; font-weight: 500', '#222');    
        }
      });

      circle.addEventListener('mouseleave', function(event) {
        event.stopPropagation();
        
        /* Circle animation */
        var id = event.target.getAttribute('data-id');
        document.getElementById('record-' + id).style.backgroundColor = '#444';
        circle.style = 'fill: #129900; r: 5; transition: .25s;';

        /* Teardown coordinate and info of the circle */
        document.getElementsByClassName('coordinate-path')[0].remove();
        document.querySelectorAll('.coordinate-info').remove();
      });
    },
    path: function(d, style, className, color) {
      var path = document.createElementNS(this.svgSource, 'path');
      var params = {
        d: d,
        stroke: color || '#ddd',
        fill: 'none',
        style: style || '',
        class: className || ''
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
        style: style || 'font-size: 10pt',
        class: className || '',
      }
      switch(align) {
        case 'left':
          params['text-anchor'] = 'start'
          break;
        case 'right':
          params['text-anchor'] = 'end'
          break;
        default:
          params['text-anchor'] = 'middle'
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
    dropDot: function(id) {
      if (dot = document.getElementById('data-' + id)) { dot.remove(); }
    },

    /* Svg Onclick event */
    onClick: function(event) {
      /* Prevent event when autoloading samples or animation mode */
      if (animationLatch || autoloading) return;

      var x = event.offsetX, y = this.height - event.offsetY;
      var position = {
        x: x,
        y: y,
        inDiagramRange: function() {
          var relativeX = x - this.offset;
          var relativeY = y - this.offset;
          return relativeX >= 0 && relativeY >= 0 && relativeX <= this.coordinateSize && relativeY <= this.coordinateSize;
        }.bind(this)
      };

      /* Circle onclick => Scroll to record table */
      if (event.target.nodeName === 'circle') {
        /* The OffsetParent is not the <tbody> element instead the <table> element */
        var firstRecord = document.getElementById('record-1');

        var id = 'record-' + event.target.getAttribute('data-id');
        var record = document.getElementById(id);
        tableRecords.scrollTop = record.offsetTop - firstRecord.offsetTop;
      }
      /* Append record if in range of diagram */
      else if (position.inDiagramRange()) {
        var offsetX = x - this.offset;
        var offsetY = y - this.offset;
        var dataX = Math.floor(offsetX / this.coordinateSize * 10000) / 100;
        var dataY = Math.floor(offsetY / this.coordinateSize * 10000) / 100;
        tableRecords.appendChild(recursiveCreateElement(editRecordForm(dataX, dataY)));
        tableRecords.scrollTop = tableRecords.scrollHeight;
        svg.dot(offsetX, offsetY, recordCounter);
        recordCounter++;
      }
    },

    /* SVG Onmousemove event */
    onMousemove: function(event) {
      /* Remove the prediction dot if exist */
      if (prediction = document.getElementById('data-prediction-dot')) {
        prediction.remove();
        document.querySelector('.prediction-info').remove();
        document.querySelectorAll('.prediction-text').remove();
      }

      /* Check if already trained an regression-line */
      if (l = document.getElementById('regression-line')) {
        var position = { x: event.offsetX, y: svg.height - event.offsetY };

        /* Mouse cursor is in diagram */
        if (
          position.x >= svg.offset && position.x <= svg.width - svg.offset &&
          position.y >= svg.offset && position.y <= svg.height - svg.offset
        ) {
          position.x -= svg.offset;
          position.y -= svg.offset;

          /* Pin the prediction dot if located on diagram */
          var theta1 = Number(l.getAttribute('data-theta-1')), theta2 = Number(l.getAttribute('data-theta-2'));
          var center = { x: position.x, y: theta1 / 100 * svg.coordinateSize + theta2 * position.x }

          if (
            center.x >= 0 && center.x <= svg.width - 2 * svg.offset &&
            center.y >= 0 && center.y <= svg.height - 2 * svg.offset
          ) {
            svg.dot(center.x, center.y, 'prediction-dot', 8, '#fb6f74', 'pointer-events: none');
            /* Add the info of prediction dot */
            var prediction = { midterm: position.x / svg.coordinateSize * 100, final: position.x * theta2 / svg.coordinateSize * 100 + theta1 };
            var content1 = 'Predicted Result';
            var content2 = 'Midterm: ' + (Math.floor(prediction.midterm * 100) / 100);
            var content3 = 'Final: '   + (Math.floor(prediction.final   * 100) / 100);
            svg.rect(center.x - 25, svg.height - center.y - 120, 150, 70, 'opacity: 0.5; pointer-events: none', 'prediction-info', '#fb6f74');
            svg.text(content1, center.x, svg.height - center.y - 100, 'prediction-text', 'left', 'pointer-events: none; font-size: 10pt;');
            svg.text(content2, center.x, svg.height - center.y - 85, 'prediction-text', 'left', 'pointer-events: none; font-size: 10pt;');
            svg.text(content3, center.x, svg.height - center.y - 70, 'prediction-text', 'left', 'pointer-events: none; font-size: 10pt;');
          }
        }
      }
    }
  }
  svg.init();

  /* --------------- End SVG Object ------------- */

  /* --------------- Start CRUD for record table ------------- */

  /* Interactions in the table records */
  tableRecords.addEventListener('click', function(event) {
    if (event.target.nodeName !== 'BUTTON') return;
    var recordId = event.target.getAttribute('data-id');
    var element = document.getElementById('record-' + recordId);
    var children = element.childNodes;

    /* Validate for record input */
    function validate(callback) {
      var input = element.querySelectorAll('input[type="text"]').map(node => node.value)
      if (input.indexOf('') !== -1) {
        popErrorModal('Data should not be empty input!');
      } else if (input.map(isNaN).indexOf(true) !== -1) {
        popErrorModal('Data should be input as a number!');
      } else if (input.map(x => x <= 100 && x >= 0).indexOf(false) !== -1) {
        popErrorModal('Data should be in range 0 ~ 100!');
      } else return input;
      return false;
    }

    switch(event.target.className) {
      case 'save-action':
        if (input = validate()) {
          /* Switch Button Type */
          event.target.className = 'edit-action';
          event.target.innerText = 'Edit';

          /* Save Record */
          children[0].innerText = input[0];
          children[1].innerText = input[1];

          /* Draw data on Svg */
          var mappedPosition = input.map(function(i) {
            return svg.coordinateSize / 100 * i;
          })
          svg.dot(mappedPosition[0], mappedPosition[1], recordId)
        }
        break;

      case 'edit-action':
        /* Switch Button Type */
        event.target.className = 'save-action';
        event.target.innerText = 'Save';

        /* Convert to input form */
        children[0].innerHTML = '<input class="record-input" type="text" value="' + children[0].innerText + '" />'
        children[1].innerHTML = '<input class="record-input" type="text" value="' + children[1].innerText + '" />'

        /* Drop the dot when edit it */
        svg.dropDot(recordId);
        break;

      /* Delete Record */
      case 'delete-action':
        element.remove();

        /* Drop the dot when delete it */
        svg.dropDot(recordId);
        break;
    }
  });

  /* Set event listener for dynamic record form */
  var newRecordInput = function() {
    tableRecords.appendChild(recursiveCreateElement(newRecordForm()));
    recordCounter++;
    tableRecords.scrollTop = tableRecords.scrollHeight;
  };
  newRecordBtn.addEventListener('click', newRecordInput);

  /* Flush out all of the data */
  flushDataBtn.addEventListener('click', function() {
    /* Remove Dots */
    svg.element.querySelectorAll('circle').remove();

    /* Remove regression line if exist */
    if (l = document.getElementById('regression-line')) { l.remove() }

    /* Remove prediction info if exist */
    if (prediction = document.querySelector('.prediction-info')) {
      prediction.remove();
      document.querySelectorAll('.prediction-text').remove();
    }

    /* Remove all record data */
    tableRecords.innerHTML = '';
    recordCounter = 1;
  })

  /* --------------- End CRUD for record table ------------- */

  /* --------------- Start Linear Regression ------------- */

  /* Simplified Matrix Object */
  function Matrix(value) {
    this.value = value

    /*
      Returns an array with two element specify matrix
      size in format M x N (Rows x Columns)
    */
    this.size = (function() {
      return [value.length, value[0].length];
    })()

    this.transpose = function() {
      var result = [];
      var size = this.size;
      for (var j = 0; j < size[1]; j++) {
        result.push([]);
        for (var i = 0; i < size[0]; i++) {
          result[j].push(this.value[i][j]);
        }
      }
      return new Matrix(result);
    }

    this.sum = function() {
      return this.value.reduce(function(acc, current) {
        return acc + current.reduce(function(acc, current) {
          return acc + current;
        }, 0);
      }, 0);
    }

    this.column = function(entry) {
      entry--;
      var result = [];
      for (var i = 0; i < this.size[0]; i++) {
        result.push([this.value[i][entry]]);
      }
      return new Matrix(result);
    }

    this.subtract = function(input) {
      var size = this.size;
      var result = [];

      if (input instanceof Matrix) {
        if (input.size[0] !== size[0] || input.size[1] !== size[1]) {
          return false
        } else {
          for (var i = 0; i < size[0]; i++) {
            result.push([]);
            for (var j = 0; j < size[1]; j++) {
              result[i].push(this.value[i][j] - input.value[i][j])
            }
          }
        }
      } else if ( ! isNaN(input)) {
        /* Scalar Point-wise Subtraction */
        for (var i = 0; i < size[0]; i++) {
          result.push([]);
          for (var j = 0; j < size[1]; j++) {
            result[i].push(this.value[i][j] - input)
          }
        }
      } else return false;

      return new Matrix(result);
    }

    this.product = function(input) {
      var size = this.size;
      var result = [];

      if (input instanceof Matrix) {
        /* Matrix Product */
        for (var i = 0; i < size[0]; i++) {
          result.push([])
          for (var j = 0; j < input.size[1]; j++) {
            var count = -1
            result[i].push(this.value[i].reduce(function(acc, current) {
              count++;
              return acc + current * input.value[count][j]
            }, 0));
          }
        }
      } else if ( ! isNaN(input)) {
        /* Scalar Point-wise Product */
        for (var i = 0; i < size[0]; i++) {
          result.push([]);
          for (var j = 0; j < size[1]; j++) {
            result[i].push(this.value[i][j] * input)
          }
        }
      } else return false;

      return new Matrix(result)
    }
  }

  Matrix.zeros = function(rows, cols) {
    var result = [];
    for (var i = 0; i < rows; i++) {
      result.push([]);
      for (var j = 0; j < cols; j++) {
        result[i].push(0);
      }
    }
    return new Matrix(result);
  }

  /* Validations for alpha and iteration value */
  function validateAlpha() {
    if (alphaValue = Number(alphaInput.value)) {
      if (alphaValue > 1) {
        popErrorModal('Alpha should be smaller than or equal to 1!');
        return false;
      }
      return alphaValue;
    } else {
      popErrorModal('Alpha should be a number smaller than or equal to 1!');
      return false;
    }
  }

  function validateIterations() {
    if (iterationsValue = Math.floor(Number(iterationsInput.value))) {
      if (iterationsValue < 1) {
        popErrorModal('Training should at least have 1 iteration!');
        return false;
      }
      return iterationsValue;
    } else {
      popErrorModal('Iterations should be a number larger than or equal to 1!');
      return false;
    }
  }

  /* Train model with linear regression via gradient descent */
  var trainModelAction = function() {
    /* Drop line if exist */
    if (l = document.getElementById('regression-line')) { l.remove(); }

    /* Initialize parameters of linear regression model */
    var dots = svg.element.querySelectorAll('circle');
    if (dots.length < 2) {
      popErrorModal('Should at least have 2 records to train the model!');
      return;
    }
    
    /* Using feature scaling, we divide the actual data by 100 */

    /* X represents the training datasets */
    var X = new Matrix(dots.map(dot => [1, Number(dot.getAttribute('data-midterm') / 100)]));

    /* y represents the output data of the training dataset */
    var y = new Matrix(dots.map(dot => [Number(dot.getAttribute('data-final') / 100)]));

    /* m represents the count of the samples */
    var m = y.size[0];

    /* Linear regression's parameter */
    var alpha, iterations;
    if (typeof arguments[0] === 'number' && typeof arguments[1] === 'number') {
      if (! (alpha      = arguments[0] || validateAlpha()))      { return; }
      if (! (iterations = arguments[1] || validateIterations())) { return; }  
    } else {
      if (! (alpha      = validateAlpha()))      { return; }
      if (! (iterations = validateIterations())) { return; }  
    }

    var theta = Matrix.zeros(2, 1);
    var h, temp1, temp2;

    /* Gradient Descent */
    for (var i = 1; i <= iterations; i++) {
      h = theta.transpose().product(X.transpose()).transpose();
      temp1 = theta.value[0][0] - alpha / m * (h.subtract(y)).sum();
      temp2 = theta.value[1][0] - alpha / m * (h.subtract(y).transpose().product(X.column(2))).sum();
      theta.value[0][0] = temp1;
      theta.value[1][0] = temp2;
    }

    var resultLine = document.createElementNS(svg.svgSource, 'path');

    function getPointPosition(x) {
      var theta1 = theta.value[0][0], theta2 = theta.value[1][0];
      var point_x = x / 100 * svg.coordinateSize + svg.offset;
      var point_y = svg.height - svg.offset - (theta1 * svg.coordinateSize + x / 100 * svg.coordinateSize * theta2);
      if (point_y < svg.offset) {
        point_y = svg.offset;
        point_x = svg.offset + (1 - theta1) / theta2 * svg.coordinateSize;
      } else if (point_y > svg.offset + svg.coordinateSize) {
        point_y = svg.offset + svg.coordinateSize;
        point_x = svg.offset + (-theta1) / theta2 * svg.coordinateSize;
      }
      return [point_x, point_y];
    }

    /* When x = 0 */
    var p1 = getPointPosition(0);

    /* When x = 100 */
    var p2 = getPointPosition(100);

    var d = 'M' + p1[0] + ' ' + p1[1] + ' L' + p2[0] + ' ' + p2[1];
    if (p1[0] && p1[1] && p2[0] && p2[1]) {
      var attributes = {
        d: d,
        stroke: '#fb6f74',
        'stroke-width': 3,
        fill: 'none',
        id: 'regression-line',
        style: 'animation: fadeIn 0.5s; pointer-events: none',

        /* Revert back to the normal data */
        'data-theta-1': theta.value[0][0] * 100,

        /* Because it is a slope which represents the ratio, it didn't need to revert back */
        'data-theta-2': theta.value[1][0],
      };
      resultLine.setAttributeFromObject(attributes)
      svg.element.appendChild(resultLine)
    } else popErrorModal('Something went wrong')
  }

  /* Setting up event for traning model */
  trainModelBtn.addEventListener('click', trainModelAction);

  /* --------------- End Linear Regression ------------- */

  /* --------------- Start Animation Mode ------------- */

  var animationMode = function() {
    var alpha, iterations;
    /* Linear regression's parameter */
    if (! (alpha         = validateAlpha()))      { return; }
    if (! (maxIterations = validateIterations())) { return; }

    /* Disable all of the buttons and inputs */
    document.querySelectorAll('button, input').each(node => node.setAttribute('disabled', 'disabled'));

    /* Enable animation mode */
    animationLatch = true;

    /* Change animate button to stop Button */
    var stopAnimation = false;
    var stopAnimationMode = function() {
      stopAnimation = true;
      animateBtn.innerText = 'Animate';
      animateBtn.removeEventListener('click', stopAnimationMode);
      animateBtn.addEventListener('click', animationMode);
      animateBtn.style.color = '#ddd';
      animateBtn.style.backgroundColor = '#666';
    };

    animateBtn.innerText = 'Stop';
    animateBtn.removeAttribute('disabled');
    animateBtn.removeEventListener('click', animationMode);
    animateBtn.addEventListener('click', stopAnimationMode);
    animateBtn.style.color = '#fff';
    animateBtn.style.backgroundColor = '#8C0305';

    /* Start iterations */
    var iterationCount = 1;

    iterationsInput.style.color = '#fff';
    iterationsInput.style.backgroundColor = '#8C0305';

    var setGradientDescentTimeout = function() {
      trainModelAction(alpha, iterationCount);
      iterationsInput.setAttribute('value', iterationCount);
      var checkResultExisted = window.setTimeout(function() {
        /* When Regression Line Existed */
        if (document.getElementById('regression-line')) {
          window.clearInterval(checkResultExisted);

          if (!stopAnimation && ++iterationCount <= maxIterations) {
            setGradientDescentTimeout();  
          } else {
            /* Enable all of the buttons and inputs */
            document.querySelectorAll('button, input').each(node => node.removeAttribute('disabled'));
            /* Set back iteration input value */
            iterationsInput.setAttribute('value', maxIterations);
            iterationsInput.style.color = 'white';
            iterationsInput.style.backgroundColor = '#333';
            /* Turn back to normal mode */
            animationLatch = false;
          }
        }
      }, 300);
    }
    setGradientDescentTimeout();
  }

  /* Setting up event for animation */
  animateBtn.addEventListener('click', animationMode);

  /* --------------- End Animation Mode ------------- */

  /* --------------- Start Animation Mode ------------- */

  var defaultData = '[["73","87"],["73","81"],["63","81"],["68","85"],["93","97"],["86","91"],["83","84"],["93","83"],["65","65"],["35","62"],["45","62"],["59","67"],["61","81"],["65","93"],["52","78"],["51","71"],["31","41"],["6","31"],["31","44"],["71","47"],["80","71"],["91","74"],["85","82"],["71","76"],["54","76"],["69","91"],["68","78"],["48","73"],["30","57"],["17","53"],["24","72"],["5","54"],["21","47"],["28","51"],["46","56"],["39","71"],["44","82"],["31","79"],["66","84"],["86","76"],["90","87"],["74","85"],["64","89"],["57","84"],["61","73"],["71","71"],["59","61"],["68","71"],["66","75"],["78","97"]]'
  var defaultJSON = JSON.parse(defaultData);
  var dataCount = 1;
  var sampleSize = defaultJSON.length;
  var studentScore, id;

  /* Disable all inputs and buttons */
  document.querySelectorAll('button, input').each(node => node.setAttribute('disabled', 'disabled'));

  function setInputDataTimeout() {
    setTimeout(function() {
      studentScore = defaultJSON[dataCount - 1];
      newRecordInput();
      document.querySelector('input[data-id="' + dataCount + '"][name="midterm-score"]').setAttribute('value', studentScore[0]);
      document.querySelector('input[data-id="' + dataCount + '"][name="final-score"]').setAttribute('value', studentScore[1]);
      document.getElementById('record-' + dataCount).querySelector('button.save-action').click();
      if (++dataCount <= sampleSize) {
        /* Keep input data until no samples to append */
        setInputDataTimeout();
      } else {
        /* Enable all UI buttons and input */
        document.querySelectorAll('button, input').each(node => node.removeAttribute('disabled'));
        /* Train model and show regression result */
        trainModelBtn.click();
        /* Autoloading result complete */
        autoloading = false;
      }
    }, 200);
  }
  setInputDataTimeout();

  /* --------------- End Animation Mode ------------- */

}

window.addEventListener('load', main);
