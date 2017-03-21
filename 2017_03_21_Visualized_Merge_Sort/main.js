var $helpers = {
  getRandomInt: function(min, max) {
    /* Get random integer between min and max and both edges are all inclusive */
    return Math.round(Math.random() * (max - min) + min);
  },
  copy: function(object) {
    return JSON.parse(JSON.stringify(object));
  }
}
Array.prototype.insert = function(item, index) { this.splice(index, 0, item); };
Array.prototype.swap = function(index1, index2) {
  var mem = this[index1 - 1];
  this[index1 - 1] = this[index2 - 1];
  this[index2 - 1] = mem;
  return this;
};
Array.prototype.sorted = function() {
  for (var i = 1; i < this.length; i++) {
    if (this[i - 1] > this[i]) return false;
  } return true;
};
// Returns the divided left and right array
Array.prototype.divide = function() {
  var length = this.length;
  var leftLength = Math.ceil(length / 2);
  return { left: this.slice(0, leftLength), right: this.slice(leftLength, length)};
};
Array.prototype.replaceWithArray = function(start, array) {
  for (var i = 0; i < array.length; i++)
    this.splice(start + i, 1, array[i]);
  return this;
};
Array.prototype.splat = function(step) {
  if (this[0] == this[1]) { this.pop(); return this; }
  step = step ? step : 1;
  var end = this[1], count = 1;
  for (var i = this[0] + step; i <= end - step; i += step, count++) { this.splice(count, 0, i); }
  return this;
};
var $canvas = {
  element: null,
  width: 600,
  height: 600,
  refresh: function() { $ctx.clearRect(0, 0, this.width, this.height); },
  intervalID: null
};
var $ctx = null;
var $bar = {
  count: 100,
  mainColorAngle: 45,
  colorizeBar: { leftArrayRange: [], rightArrayRange: [], mergeArrayRange: [] },
  state: new Array(this.count).join().split(',').map(function(item, index) { return ++index; }),
  getState: function(index) { if (index) { return this.state[index - 1]; } else return this.state; },
  setState: function(newState) { this.state = newState; },
  randomizeState: function() {
    var newArr = [];
    for (var i = 1; i <= this.count; i++) {
      newArr.insert(i, $helpers.getRandomInt(0, i));
    }
    this.setState(newArr);
  },
  getThickness: function() { return Math.round($canvas.width / this.count); },
  getHSLColor: function(index, angle) {
    angle = angle ? angle : this.mainColorAngle;
    return "hsl(" + angle + ", " + Math.round(index / this.count * 100) + "%, 50%)";
  },
  getHeight: function(barNum) { return Math.round($canvas.height * barNum / this.count); },
  getHorizontalPosition: function(index) { return Math.round(this.getThickness() * (index - 1) + this.getThickness() / 2); }
};
var $events = {
  setRandomizeButtonEvent: function() {
    $('button#randomize-btn').on('click', function(event) {
      event.preventDefault();
      $bar.randomizeState();
      $('button#sort-btn').prop('disabled', false);
      $canvas.refresh();
      $draw.main();
    });
  },
  setSortingButtonEvent: function() {
    $('button#sort-btn').on('click', function(event) {
      event.preventDefault();
      $(this).prop('disabled', true);
      $('button#randomize-btn').prop('disabled', true);

      $sorting.accessLevel = 1;
      $sorting.stackLevel = 1;
      $sorting.stack = [$bar.getState()];
      $sorting.nextState($sorting.states.CHECK_SORTED);

      $draw.sort = true;
      $canvas.refresh();
      $draw.main();

      return false;
    });
  },
};
var $sorting = {
  currentState: 1,
  nextState: function(next) { this.currentState = next },
  states: {
    CHECK_SORTED: 1,
    DIVIDE: 2,
    ACCESS_NEXT_LEVEL: 3,
    MERGE_ARRAY: 4,
    ACCESS_PREVIOUS_LEVEL: 5,
    MERGE_SORT_PROCESS_DONE: 6
  },
  leftArrayColor: '#ed7ebe',
  rightArrayColor: '#87edb9',
  mergeArrayColor: '#a320ff',
  stack: [],
  stackLevel: NaN,
  sortingSide: {},
  sortingBarIndexRange: {},
  accessLevel: NaN,
  accessSide: null,
  accessLevelIndex: NaN,
  mergedArray: [],
  getCurrentStack: function(side) {
    if (side) {
      return this.stack[this.accessLevel - 1][side];
    } else return this.stack[this.accessLevel - 1];
  },
};
var $draw = {
  sort: false,
  line: function(fromX, fromY, toX, toY, width, style) {
    $ctx.strokeStyle = style ? style : '#ddd';
    $ctx.lineWidth = width ? width : 1;
    $ctx.beginPath();
    $ctx.moveTo(fromX, fromY);
    $ctx.lineTo(toX, toY);
    $ctx.stroke();
  },
  renderBars: function(options) {
    $canvas.refresh();
    var states = $sorting.states;
    for (var i = 1; i <= $bar.count; i++) {
      currentBar = $bar.state[i - 1];
      switch($sorting.currentState) {
        case states.DIVIDE:
          if ($bar.colorizeBar.leftArrayRange.indexOf(i) != -1) {
            this.line($bar.getHorizontalPosition(i), $canvas.height, $bar.getHorizontalPosition(i), $canvas.height - $bar.getHeight(currentBar), $bar.getThickness(), $sorting.leftArrayColor);
          } else if ($bar.colorizeBar.rightArrayRange.indexOf(i) != -1) {
            this.line($bar.getHorizontalPosition(i), $canvas.height, $bar.getHorizontalPosition(i), $canvas.height - $bar.getHeight(currentBar), $bar.getThickness(), $sorting.rightArrayColor);
          } else this.line($bar.getHorizontalPosition(i), $canvas.height, $bar.getHorizontalPosition(i), $canvas.height - $bar.getHeight(currentBar), $bar.getThickness(), $bar.getHSLColor(currentBar));
          break;
        case states.MERGE_ARRAY:
          if ($bar.colorizeBar.mergeArrayRange.indexOf(i) != -1) {
            this.line($bar.getHorizontalPosition(i), $canvas.height, $bar.getHorizontalPosition(i), $canvas.height - $bar.getHeight(currentBar), $bar.getThickness(), $sorting.mergeArrayColor);
          } else this.line($bar.getHorizontalPosition(i), $canvas.height, $bar.getHorizontalPosition(i), $canvas.height - $bar.getHeight(currentBar), $bar.getThickness(), $bar.getHSLColor(currentBar));
          break;
        default:
          this.line($bar.getHorizontalPosition(i), $canvas.height, $bar.getHorizontalPosition(i), $canvas.height - $bar.getHeight(currentBar), $bar.getThickness(), $bar.getHSLColor(currentBar));
          break;
      }
    }
  },
  init: function() {
    $bar.randomizeState();
  },
  main: function() {
    this.renderBars();

    if (this.sort) {
      $canvas.intervalID = setInterval(function() {
        var states = $sorting.states;

        switch($sorting.currentState) {
          case states.CHECK_SORTED:
            if ($sorting.accessLevel == 1) {
              /* Root Array */
              if (!$sorting.stack[0].sorted()) {
                $sorting.nextState(states.DIVIDE);
              } else {
                /* Merge Sort Complete! */
                $sorting.nextState(states.MERGE_SORT_PROCESS_DONE)
              }
            } else {
              /* Sub Array */
              var currentStackArray = $sorting.getCurrentStack();
              
              if (currentStackArray.left.length === 1) {
                $sorting.nextState(states.MERGE_ARRAY);
              } else if (!currentStackArray.left.sorted()) {
                $sorting.nextState(states.DIVIDE);
                $sorting.sortingSide[String($sorting.accessLevel)] = 'left';
                $sorting.accessSide = 'left';
              } else if (currentStackArray.right.length === 1) {
                $sorting.nextState(states.MERGE_ARRAY);
              } else if (!currentStackArray.right.sorted()) {
                $sorting.nextState(states.DIVIDE);
                $sorting.sortingSide[String($sorting.accessLevel)] = 'right';
                $sorting.accessSide = 'right';
              } else {
                /* Both Left & Right Array Sort Completed => Merge & Roll to Previous Stack Level */
                $sorting.nextState(states.MERGE_ARRAY);
              }
            }
            break;
          
          case states.DIVIDE:
            if ($sorting.stackLevel == 1) {
              var divided = $sorting.getCurrentStack().divide();
            } else {
              var divided = $sorting.getCurrentStack($sorting.accessSide).divide();
            }
            $sorting.stack.push({ left: divided.left, right: divided.right });
            $sorting.stackLevel = $sorting.stack.length;
            $sorting.accessLevel++;

            if ($sorting.accessLevel == 2) {
              $sorting.sortingBarIndexRange[$sorting.accessLevel] = {
                left: [1, Math.ceil($bar.count / 2)],
                right: [Math.ceil($bar.count / 2) + 1, $bar.count]
              };
            } else {
              var previousRange = $sorting.sortingBarIndexRange[$sorting.accessLevel - 1][$sorting.accessSide];
              var sumOfEdge = previousRange[0] + previousRange[1];
              if (sumOfEdge % 2 === 1) {
                $sorting.sortingBarIndexRange[$sorting.accessLevel] = {
                  left: [previousRange[0], Math.floor(sumOfEdge / 2)],
                  right: [Math.ceil(sumOfEdge / 2 ), previousRange[1]]
                };
              } else {
                $sorting.sortingBarIndexRange[$sorting.accessLevel] = {
                  left: [previousRange[0], sumOfEdge / 2],
                  right: [sumOfEdge / 2 + 1, previousRange[1]]
                };
              }
            }

            currentAccessBarRange = $sorting.sortingBarIndexRange[$sorting.accessLevel];
            $bar.colorizeBar.leftArrayRange = $helpers.copy(currentAccessBarRange.left).splat();
            $bar.colorizeBar.rightArrayRange = $helpers.copy(currentAccessBarRange.right).splat();
            
            $draw.renderBars();
            $sorting.nextState(states.CHECK_SORTED);
            break;

          case states.MERGE_ARRAY:
            var leftArr = $sorting.getCurrentStack('left');
            var rightArr = $sorting.getCurrentStack('right');
            var leftNumPushed = false;
            var mergedArray = [];
            var left, right;
            var currentAccessBarRange = $sorting.sortingBarIndexRange[$sorting.accessLevel];
            $bar.colorizeBar.mergeArrayRange = [currentAccessBarRange.left[0], currentAccessBarRange.right[1]].splat();
            
            $sorting.mergeBarDataStartIndex = currentAccessBarRange.left[0];

            for (var i = 0; i < leftArr.length; /* DO NOTHING */ ) {
              left = leftArr[i];
              if (rightArr.length != 0) {
                right = rightArr[0];
              } else {
                for (var j = i; j < leftArr.length; j++) {
                  mergedArray.push(leftArr[j]);
                }
                break;
              }

              if (left > right) {
                mergedArray.push(rightArr.shift());
              } else {
                mergedArray.push(left);
                i++;
              }
            }
            
            if (rightArr.length != 0) { mergedArray = mergedArray.concat(rightArr); }

            $sorting.mergedArray = mergedArray;
            $draw.renderBars();
            $sorting.nextState(states.ACCESS_PREVIOUS_LEVEL);
            break;
          
          case states.ACCESS_PREVIOUS_LEVEL:
            $sorting.stack.pop();
            $sorting.stackLevel--;
            $sorting.accessLevel--;
            if ($sorting.stackLevel != 1){
              $sorting.stack[$sorting.accessLevel - 1][$sorting.sortingSide[String($sorting.accessLevel)]] = $sorting.mergedArray;
            } else $sorting.stack = [$sorting.mergedArray];            
            $sorting.nextState(states.CHECK_SORTED);

            var newBarState = $bar.getState();
            newBarState.replaceWithArray($sorting.mergeBarDataStartIndex - 1, $sorting.mergedArray);
            $draw.renderBars();
            break;
          
          case states.MERGE_SORT_PROCESS_DONE:
            /* Initialize Back */
            $sorting.stack = [];
            $sorting.stackLevel = NaN;
            $sorting.sortingSide = {};
            $sorting.sortingBarIndexRange = {};
            $sorting.accessLevel = NaN;
            $sorting.accessSide = null;
            $sorting.accessLevelIndex = NaN;
            $sorting.mergedArray = [];
            $sorting.nextState(NaN);
            this.sort = false;

            $('button#randomize-btn').prop('disabled', false);
            
            clearInterval($canvas.intervalID);
            $canvas.intervalID = null;
            
            break;
        }
        
      }, 150);
    }
  }
}

$(document).ready(function() {
  $canvas.element = document.getElementById('main-canvas');
  $canvas.element.height = $canvas.height;
  $canvas.element.width  = $canvas.width;

  if ($canvas.element.getContext) {
    $ctx = $canvas.element.getContext('2d');

    $draw.init();
    $draw.main();
    $events.setRandomizeButtonEvent();
    $events.setSortingButtonEvent();
  }
});